import { useCallback, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { formatPH } from '../lib/datetime'
import { statusOf, toRaffle, useRaffle } from '../lib/raffles'
import Countdown from '../components/Countdown'
import {
  Bar,
  CampaignHero,
  RaffleLoadError,
  StatusChip,
  panel,
} from '../components/RaffleUI'
import { CampaignTheme, useCampaignData } from '../lib/campaignTheme'
import {
  entriesEndpoint,
  isSupabaseConfigured,
  supabaseHeaders,
} from '../data/supabase'

// ============================================================================
// /raffle/:slug — ONE giveaway from a sponsored campaign.
// ============================================================================
//
// The index at /raffle (pages/Raffles.jsx) lists all seven; this renders the one
// the URL names. Giving each giveaway its own address is what makes a shared link
// keep its meaning: a post pointing at /raffle would have quietly started showing
// a different member's raffle a month later, and archived raffles had nowhere to
// link to at all.
//
// Chrome and status vocabulary come from components/RaffleUI.jsx, and the look
// from the raffle's campaign (data/campaigns.js) — so this page and the index
// can't drift apart, and a new sponsor is a data change rather than a rewrite.
//
// Raffles used to live in the Google Sheet like the rest of the site's content.
// They moved into the database when entries did, because a spreadsheet can't be
// a foreign key: entries now point at a raffle's `id`, so a renamed or mistyped
// slug can't orphan somebody's entry, and the insert policy can check the
// raffle is genuinely open before accepting one. Raffles are created and edited
// in the admin dashboard (pages/AdminRaffles.jsx) — nothing here needs a deploy.
//
// Field meanings and the status lifecycle live with the data, in lib/raffles.js.
//
// SECURITY: the browser may insert an entry and do nothing else — it cannot
// read, edit, or delete one. That's what makes it safe to ship the anon key
// publicly, and it's why duplicate detection is a database unique index rather
// than a "have I seen this email?" lookup, which this page has no permission to
// run. See supabase/setup.sql.

// The hosts each platform's post links actually use. Subdomains count, so
// m.facebook.com and vm.tiktok.com match without being listed individually.
const PLATFORMS = [
  { value: 'Facebook', hosts: ['facebook.com', 'fb.com', 'fb.watch'] },
  { value: 'X', hosts: ['x.com', 'twitter.com'] },
  { value: 'Instagram', hosts: ['instagram.com', 'instagr.am'] },
  { value: 'TikTok', hosts: ['tiktok.com'] },
]

function hostOf(url) {
  try {
    return new URL(String(url).trim()).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    // Not a parseable URL yet — the browser's own type="url" check will catch it.
    return null
  }
}

// Does this post link live on the platform they picked? Used to stop the
// commonest entry mistake: choosing Facebook and pasting an X link (or the
// reverse), which makes an entry impossible to verify later.
//
// Shortened links (bit.ly and friends) deliberately fail — we can't tell where
// they point without following them, and an unverifiable link is no better than
// a wrong one. The error text tells people to paste the direct link instead.
function matchesPlatform(url, platform) {
  const host = hostOf(url)
  if (!host) return false
  const entry = PLATFORMS.find((p) => p.value === platform)
  if (!entry) return false
  return entry.hosts.some((h) => host === h || host.endsWith(`.${h}`))
}

const DEFAULT_PROOF_LABEL = 'Link to your post (proof of entry)'

// Gates preview mode (see PREVIEW_STATES) to local development. Entries now go
// straight to Supabase over HTTPS, so submitting from localhost works exactly
// as it does in production — no more "deploy before you can test the form".
//
// Hostname, not `import.meta.env.DEV`: `npm run preview` runs a *production*
// build, where that flag is false and the check would be compiled away.
const isLocalhost = () =>
  typeof location !== 'undefined' &&
  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)

// Remembers which raffles this browser has already entered, so a refresh or a
// double-tap doesn't quietly file a second entry. It's a courtesy, not a
// control — anyone determined can clear it — so never treat it as enforcement.
const STORAGE_PREFIX = 'brph-raffle:'

function hasEntered(slug) {
  try {
    return localStorage.getItem(STORAGE_PREFIX + slug) != null
  } catch {
    // Private browsing or blocked storage — just let them enter.
    return false
  }
}

function rememberEntry(slug) {
  try {
    localStorage.setItem(STORAGE_PREFIX + slug, new Date().toISOString())
  } catch {
    /* Not being able to remember is survivable; failing to submit isn't. */
  }
}

// `toRaffle`, `statusOf`, and `splitLines` moved to lib/raffles.js when raffles
// became a database table — the admin dashboard needs the same status logic, and
// one copy of it is the only way the two views can't drift apart.

// --- Entry form ------------------------------------------------------------

const inputClass =
  'mt-1.5 w-full rounded-xl border border-[color:var(--rf-border-strong)] bg-[var(--rf-input)] px-4 py-2.5 font-[family-name:var(--rf-font-body)] text-sm text-[color:var(--rf-text)] placeholder:text-[color:var(--rf-faint)] focus:border-[color:var(--rf-border-strong)] focus:bg-[var(--rf-panel-hover)] focus:outline-none focus:ring-1 focus:ring-[color:var(--rf-border-strong)]'

const labelClass =
  'block font-[family-name:var(--rf-font-body)] text-xs font-bold uppercase tracking-wide text-[color:var(--rf-muted)]'

function Field({ label, name, type = 'text', hint, ...props }) {
  const id = `raffle-${name}`
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label} {props.required && <span className="text-[color:var(--rf-soft)]">*</span>}
      </label>
      {hint && <p className="mt-0.5 font-[family-name:var(--rf-font-body)] text-xs text-[color:var(--rf-soft)]">{hint}</p>}
      <input id={id} name={name} type={type} className={inputClass} {...props} />
    </div>
  )
}

function RaffleForm({ raffle, preview }) {
  // idle | sending | done | duplicate | preview | error
  const [state, setState] = useState('idle')
  const [duplicateOf, setDuplicateOf] = useState('email') // which unique index tripped
  const [entered, setEntered] = useState(() => hasEntered(raffle.slug))

  // Controlled so the post link can be checked against the chosen platform as
  // they go. Every other field is left uncontrolled — FormData reads them all
  // at submit time either way.
  const [platform, setPlatform] = useState('')
  const [proof, setProof] = useState('')
  // Don't scold someone mid-type: the mismatch only surfaces once they've left
  // the field, or once they've tried to submit.
  const [showMismatch, setShowMismatch] = useState(false)

  const mismatch = Boolean(platform && proof.trim() && !matchesPlatform(proof, platform))

  async function onSubmit(event) {
    event.preventDefault()
    if (state === 'sending') return

    if (mismatch) {
      setShowMismatch(true)
      return
    }

    // Grab the values before the await — React may recycle the event, and a
    // re-render could swap the form out from under us.
    const form = new FormData(event.currentTarget)
    const entry = {
      raffle_id: raffle.id,
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      contact: String(form.get('contact') || '').trim(),
      social_link: String(form.get('social_link') || '').trim(),
      platform: String(form.get('platform') || '').trim(),
      proof: String(form.get('proof') || '').trim(),
    }

    // Preview mode fabricates a raffle to show the layout — writing that to the
    // real entries table would put junk rows under a slug that doesn't exist.
    if (preview) {
      console.info('[raffle] preview mode — entry NOT saved. Payload:', entry)
      setState('preview')
      return
    }

    if (!isSupabaseConfigured) {
      console.error(
        '[raffle] Supabase is not configured — fill in src/data/supabase.js.',
      )
      setState('error')
      return
    }

    setState('sending')

    try {
      const res = await fetch(entriesEndpoint, {
        method: 'POST',
        headers: { ...supabaseHeaders, Prefer: 'return=minimal' },
        body: JSON.stringify(entry),
      })

      // 409 is a unique-index violation: this email, or this exact post, has
      // already been entered for this raffle. The database is the only place
      // that can know — the browser can't read existing entries, by design.
      if (res.status === 409) {
        const detail = await res.text()
        setDuplicateOf(detail.includes('one_per_post') ? 'post' : 'email')
        setState('duplicate')
        return
      }

      if (!res.ok) throw new Error(`Supabase responded ${res.status}: ${await res.text()}`)

      rememberEntry(raffle.slug)
      setEntered(true)
      setState('done')
    } catch (err) {
      // Detail goes to the console for whoever's debugging; the visitor gets a
      // sentence they can act on.
      console.error('Raffle entry failed:', err)
      setState('error')
    }
  }

  if (state === 'duplicate') {
    return (
      <div
        role="status"
        className={`${panel} p-6 text-center`}
      >
        <p className="font-[family-name:var(--rf-font-display)] text-2xl uppercase leading-none text-[color:var(--rf-text)]">
          Naka-sali ka na
        </p>
        <p className="mt-3 text-sm text-[color:var(--rf-muted)]">
          {duplicateOf === 'post'
            ? 'That post has already been used to enter this raffle. Each post counts once — make a new one if you want another go.'
            : raffle.perPlatform
              ? `You’ve already entered from ${platform || 'this platform'}. You can still enter from a different one with a new post.`
              : 'This email address has already entered this raffle. One entry per person, so you’re all set!'}
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-5 rounded-md border border-[color:var(--rf-border-strong)] px-5 py-2.5 font-[family-name:var(--rf-font-body)] text-xs font-bold uppercase tracking-wide text-[color:var(--rf-text)] transition hover:bg-[var(--rf-panel-hover)]"
        >
          Back to the form
        </button>
      </div>
    )
  }

  // Preview mode only — see the guard in onSubmit.
  if (state === 'preview') {
    return (
      <div className="rounded-2xl border border-dashed border-[color:var(--rf-border-strong)] bg-[var(--rf-input)] p-6 text-center">
        <p className="font-[family-name:var(--rf-font-display)] text-xl uppercase leading-none text-[color:var(--rf-text)]">
          Preview mode — nothing was saved
        </p>
        <p className="mt-3 text-sm text-[color:var(--rf-muted)]">
          Your values passed validation and are logged in the browser console.
          Exit preview to file a real entry.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-5 rounded-md border border-[color:var(--rf-border-strong)] px-5 py-2.5 font-[family-name:var(--rf-font-body)] text-xs font-bold uppercase tracking-wide text-[color:var(--rf-text)] transition hover:bg-[var(--rf-panel-hover)]"
        >
          Back to the form
        </button>
      </div>
    )
  }

  // Two different situations, and conflating them used to produce a "Submit
  // again" link that invited a second entry:
  //
  //   justSubmitted — they filed an entry seconds ago. It's definitely theirs,
  //     and re-submitting can't edit it: the database rejects a repeat email or
  //     post link, so the only submission that would succeed is one with
  //     DIFFERENT details, i.e. a duplicate. So there's no re-entry link at all;
  //     corrections go through a human.
  //
  //   entered (from localStorage) — this *browser* has entered before. On a
  //     shared phone or a computer shop PC that may well be somebody else, so
  //     there is a way through — worded for that case only, not as an invitation
  //     to have another go.
  if (state === 'done' || entered) {
    const justSubmitted = state === 'done'
    return (
      <div
        role="status"
        className={`${panel} p-6 text-center`}
      >
        <p className="font-[family-name:var(--rf-font-display)] text-2xl uppercase leading-none text-[color:var(--rf-text)]">
          Ayos, you&rsquo;re in!
        </p>
        <p className="mt-3 font-[family-name:var(--rf-font-body)] text-sm text-[color:var(--rf-muted)]">
          {justSubmitted ? (
            <>
              Your entry for <strong>{raffle.title}</strong> has been recorded.
            </>
          ) : (
            <>
              This device has already entered <strong>{raffle.title}</strong>.
            </>
          )}
          {raffle.announcement && <> Winners will be announced {raffle.announcement}.</>}
        </p>

        <p className="mt-4 font-[family-name:var(--rf-font-body)] text-xs text-[color:var(--rf-soft)]">
          Got a detail wrong? Message us on socials and we&rsquo;ll fix it — entering
          again won&rsquo;t update your entry, it just files a second one, and duplicates
          can be disqualified.
        </p>

        {!justSubmitted && (
          <button
            type="button"
            onClick={() => {
              setEntered(false)
              setState('idle')
            }}
            className="mt-3 font-[family-name:var(--rf-font-body)] text-xs font-bold text-[color:var(--rf-text)] underline underline-offset-2"
          >
            Sharing this device? Enter as someone else
          </button>
        )}
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-4 ${panel} p-6 sm:p-8`}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" autoComplete="name" required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Contact number"
          name="contact"
          type="tel"
          autoComplete="tel"
          placeholder="09XX XXX XXXX"
          required
        />
        <Field
          label="Social media link"
          name="social_link"
          type="url"
          placeholder="https://facebook.com/yourprofile"
          required
        />
      </div>

      <div>
        <label htmlFor="raffle-platform" className={labelClass}>
          Where did you post? <span className="text-[color:var(--rf-soft)]">*</span>
        </label>
        <select
          id="raffle-platform"
          name="platform"
          required
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Choose a platform…
          </option>
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.value}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Field
          label={raffle.proofLabel || DEFAULT_PROOF_LABEL}
          name="proof"
          type="url"
          hint="Paste the direct link (not a shortened one), and make sure your post is public so we can verify it."
          placeholder="https://…"
          required
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          onBlur={() => setShowMismatch(true)}
          aria-invalid={mismatch && showMismatch ? 'true' : undefined}
        />
        {mismatch && showMismatch && (
          <p className="mt-2 font-[family-name:var(--rf-font-body)] text-xs font-bold text-[color:var(--rf-danger)]">
            That doesn&rsquo;t look like a {platform} link. Paste your {platform} post,
            or change the platform above to match.
          </p>
        )}
      </div>

      {state === 'error' && (
        <p
          role="alert"
          className="rounded-xl border border-[color:var(--rf-danger-border)] bg-[var(--rf-danger-bg)] px-4 py-3 font-[family-name:var(--rf-font-body)] text-sm font-semibold text-[color:var(--rf-danger)]"
        >
          We couldn&rsquo;t submit your entry. Check your connection and try again — if
          it keeps failing, message us on socials so we can sort it out.
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="w-full rounded-md bg-[var(--rf-accent)] px-6 py-3 font-[family-name:var(--rf-font-body)] text-sm font-bold uppercase tracking-wide text-[color:var(--rf-accent-text)] transition hover:bg-[var(--rf-accent)] disabled:opacity-60"
      >
        {state === 'sending' ? 'Submitting…' : 'Submit my entry'}
      </button>

      <p className="font-[family-name:var(--rf-font-body)] text-xs text-[color:var(--rf-soft)]">
        We only use your details to contact you if you win.
      </p>
    </form>
  )
}

// --- Preview mode ----------------------------------------------------------
//
// /raffle?preview=open lets you see any state without waiting for real dates or
// touching the sheet — the states are hard to reach otherwise, since "closed"
// means sitting through an entry period.
//
// Localhost only, deliberately: on the live site the parameter is ignored
// completely, so nobody can conjure a fake raffle (with a working entry form)
// out of a URL. Use `npm run dev` or `npm run preview`.
// `archive` is gone — that view moved to the index, whose states you can reach
// just by creating raffles. `empty` now previews the not-found panel.
const PREVIEW_STATES = ['upcoming', 'open', 'closed', 'ended', 'empty', 'loading', 'error']

// States that show no raffle at all — the difference between them is which of
// the skeleton / retry / not-found panels renders.
const BLANK_PREVIEWS = ['empty', 'loading', 'error']

// Stand-in content for when the table is empty or unreachable, so the layout is
// previewable before a single raffle exists. A real raffle always wins over it.
// Shaped like a database row, so it goes through the same toRaffle() mapping the
// live data does and can't drift from it.
const DEMO_ROW = {
  id: '00000000-0000-0000-0000-000000000000',
  slug: 'preview-demo',
  title: 'Sample Raffle',
  blurb: 'Preview content — this is not a real raffle.',
  sponsor: 'Sample Sponsor',
  prize: '1 BTS Ticket\nFreebie bag',
  mechanics:
    'Share this post\nPost using the tag #BTSRE_TURNPH\nFill out the form below',
  announcement: 'three days after entries close, on our socials',
  proof_label: 'Link of your post',
  note: 'One entry per person.',
  active: true,
}

const DAY = 24 * 60 * 60 * 1000

// Rewrite the dates so the requested state is what renders, keeping the row's
// real copy. Countdowns get a few days on the clock so they look realistic.
function withPreviewState(raffle, state, now) {
  switch (state) {
    case 'upcoming':
      return { ...raffle, opens: new Date(now + 2 * DAY), closes: new Date(now + 9 * DAY), winners: [] }
    case 'open':
      return { ...raffle, opens: new Date(now - DAY), closes: new Date(now + 2 * DAY), winners: [] }
    case 'closed':
      return { ...raffle, opens: new Date(now - 9 * DAY), closes: new Date(now - DAY), winners: [] }
    case 'ended':
      // Winners filled in, so the announcement panel renders. Keeps the row's own
      // winners when it has them, so you preview your real copy.
      return {
        ...raffle,
        opens: new Date(now - 9 * DAY),
        closes: new Date(now - DAY),
        winners: raffle.winners.length
          ? raffle.winners
          : [
              { name: 'Maj U.', url: 'https://x.com/BTSisBackInPH/status/1' },
              { name: 'Andrea B.', url: '' },
            ],
      }
    default:
      return raffle
  }
}

function PreviewBanner({ state, valid }) {
  return (
    <div className="sticky top-16 z-30 border-b border-[color:var(--rf-border)] bg-black/80 px-4 py-2 text-center text-[color:var(--rf-text)] backdrop-blur">
      <p className="font-[family-name:var(--rf-font-body)] text-[11px] font-bold uppercase tracking-wide">
        {valid ? (
          <>
            Preview: <span className="text-amber-300">{state}</span>
          </>
        ) : (
          <>
            <span className="text-amber-300">“{state}”</span> isn&rsquo;t a preview
            state
          </>
        )}
        <span className="text-[color:var(--rf-faint)]"> · local only, ignored live</span>
      </p>
      <p className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {PREVIEW_STATES.map((s) => (
          <a
            key={s}
            href={`${location.pathname}?preview=${s}`}
            className={`font-[family-name:var(--rf-font-body)] text-[11px] font-bold uppercase tracking-wide underline-offset-2 ${
              s === state ? 'text-amber-300 underline' : 'text-[color:var(--rf-muted)] hover:underline'
            }`}
          >
            {s}
          </a>
        ))}
        <a
          href={location.pathname}
          className="font-[family-name:var(--rf-font-body)] text-[11px] font-bold uppercase tracking-wide text-[color:var(--rf-muted)] underline-offset-2 hover:underline"
        >
          exit
        </a>
      </p>
    </div>
  )
}

// --- Page ------------------------------------------------------------------

function RaffleSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-4">
        <Bar className="aspect-[4/3] w-full" />
        <Bar className="h-5 w-2/3" />
        <Bar className="h-4 w-1/2" />
      </div>
      <div className="space-y-4">
        <Bar className="h-24 w-full" />
        <Bar className="h-10 w-full" />
        <Bar className="h-10 w-full" />
        <Bar className="h-10 w-full" />
      </div>
    </div>
  )
}

export default function Raffle() {
  // The slug is the address of one member's giveaway. It's what makes a shared
  // link keep its meaning after that giveaway closes — /raffle alone used to
  // silently start showing a different raffle a month later.
  const { slug } = useParams()
  // One raffle, not all of them — see useRaffle for why that matters here.
  const { raffle, loading, error, reload } = useRaffle(slug)
  // The raffle's own campaign, so a giveaway backed by a different sponsor
  // renders in their look with their credit. Falls back to the primary campaign
  // until the raffle loads, or if it names none.
  const campaign = useCampaignData(raffle?.campaign)

  // null off localhost, so the live site behaves as if this feature isn't there.
  const [params] = useSearchParams()
  const preview = isLocalhost() ? params.get('preview') : null
  const previewValid = PREVIEW_STATES.includes(preview)

  // Bumped when a countdown hits zero, which re-derives the status below so the
  // page flips from "opens in…" to the live form on its own.
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((t) => t + 1), [])

  const { current, currentStatus } = useMemo(() => {
    const now = Date.now()
    const found = raffle && raffle.title && raffle.slug ? raffle : null

    const real = {
      current: found,
      currentStatus: found ? statusOf(found, now) : null,
    }

    if (!previewValid || BLANK_PREVIEWS.includes(preview)) {
      return previewValid ? { current: null, currentStatus: null } : real
    }

    // Preview: shape whichever raffle this URL names into the requested state,
    // falling back to demo content when the slug doesn't exist yet.
    const base = found || toRaffle(DEMO_ROW)
    return {
      current: withPreviewState(base, preview, now),
      currentStatus: preview,
    }
    // `tick` is the whole point of this dependency — it re-runs the clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raffle, tick, preview, previewValid])

  // In preview mode the requested state decides which panel shows, rather than
  // the real fetch — otherwise `?preview=loading` would be overridden by data.
  const showSkeleton = previewValid ? preview === 'loading' : loading && !current
  const showError = previewValid ? preview === 'error' : error && !current && !loading
  // No raffle by that slug. Distinct from the index's "nothing is running":
  // this URL is simply wrong, so say so and point back to the series.
  const notFound = previewValid
    ? preview === 'empty'
    : !loading && !error && !current

  return (
    <CampaignTheme campaign={campaign}>
      {preview && <PreviewBanner state={preview} valid={previewValid} />}

      <CampaignHero raffle={current} back />

      <section className="py-14 sm:py-20">
        <div className="container-page">
          {showSkeleton && <RaffleSkeleton />}
          {showError && <RaffleLoadError onRetry={reload} />}

          {notFound && (
            <div className="rounded-2xl border border-dashed border-[color:var(--rf-border-strong)] bg-[var(--rf-panel)] px-6 py-14 text-center">
              <p className="font-[family-name:var(--rf-font-display)] text-2xl uppercase leading-none text-[color:var(--rf-text)]">
                Wala kaming makita
              </p>
              <p className="mx-auto mt-3 max-w-md text-[color:var(--rf-soft)]">
                There&rsquo;s no raffle at this link. It may have been renamed, or the
                address may be mistyped.
              </p>
              <Link
                to="/raffle"
                className="mt-6 inline-block rounded-md border border-[color:var(--rf-border-strong)] px-5 py-2.5 font-[family-name:var(--rf-font-body)] text-xs font-bold uppercase tracking-wide text-[color:var(--rf-text)] transition hover:bg-[var(--rf-panel-hover)]"
              >
                See all raffles →
              </Link>
            </div>
          )}

          {current && (
            <>
              {/* --- Title block: what the raffle is, and how long you have ---
                  Same column widths as the section below, so the countdown lands
                  directly above the form instead of drifting off on its own. */}
              <div className="mb-10 grid gap-8 border-b border-[color:var(--rf-border)] pb-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-14">
                <div className="min-w-0">
                  <StatusChip status={currentStatus} />
                  <h2 className="mt-4 font-[family-name:var(--rf-font-display)] text-4xl uppercase leading-none text-[color:var(--rf-text)] sm:text-5xl">
                    {current.title}
                  </h2>
                  {/* No sponsor credit here — it lives in the hero now. Showing
                      it in both places read as a duplicate, not as emphasis. */}
                  {current.blurb && (
                    <p className="mt-4 text-lg text-[color:var(--rf-muted)]">{current.blurb}</p>
                  )}
                </div>

                <div className="lg:pt-3">
                  {currentStatus === 'upcoming' && current.opens && (
                    <Countdown
                      to={current.opens.getTime()}
                      label="Raffle opens in"
                      align="right"
                      onComplete={refresh}
                    />
                  )}
                  {currentStatus === 'open' && current.closes && (
                    <Countdown
                      to={current.closes.getTime()}
                      label="Raffle closes in"
                      align="right"
                      onComplete={refresh}
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-14">
              {/* --- Prize, mechanics, the small print ---
                  One card with ruled sections rather than three loose blocks on
                  the cream, so the page reads as two columns instead of five
                  floating pieces. */}
              <div className={`overflow-hidden ${panel}`}>
                {current.prize.length > 0 && (
                  <section className="p-6 sm:p-8">
                    <h3 className="font-[family-name:var(--rf-font-display)] text-2xl uppercase leading-tight text-[color:var(--rf-text)]">
                      What you can win
                    </h3>
                    <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
                      {current.image && (
                        // A thumbnail, not a hero: the prize and the mechanics are
                        // what people came for. Leave the sheet cell blank when
                        // there's no real prize photo to show.
                        <img
                          src={current.image}
                          alt={`Prize for ${current.title}`}
                          loading="lazy"
                          className="w-32 shrink-0 rounded-xl border border-[color:var(--rf-border-strong)] bg-[var(--rf-panel)] object-contain sm:w-36"
                        />
                      )}
                      <div className="min-w-0">
                        {current.prize.length === 1 ? (
                          <p className="text-[color:var(--rf-muted)]">{current.prize[0]}</p>
                        ) : (
                          <ul className="space-y-2">
                            {current.prize.map((p, i) => (
                              <li key={`${i}-${p}`} className="flex gap-2.5 text-[color:var(--rf-muted)]">
                                <span aria-hidden className="font-bold text-[color:var(--rf-soft)]">
                                  ★
                                </span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* Directly above the form on desktop, and directly before it on
                    mobile — you shouldn't have to scroll past the form to find
                    out how to enter. */}
                {current.mechanics.length > 0 && (
                  <section className="border-t border-[color:var(--rf-border)] p-6 sm:p-8">
                    <p className="font-[family-name:var(--rf-font-body)] text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--rf-soft)]">
                      How to join
                    </p>
                    <h3 className="mt-2 font-[family-name:var(--rf-font-display)] text-2xl uppercase leading-tight text-[color:var(--rf-text)]">
                      Mechanics
                    </h3>
                    <ol className="mt-6 space-y-4">
                      {current.mechanics.map((step, i) => (
                        <li key={`${i}-${step}`} className="flex gap-4">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--rf-chip-dim)] font-[family-name:var(--rf-font-display)] text-base leading-none text-[color:var(--rf-text)] ring-1 ring-[color:var(--rf-border-strong)]">
                            {i + 1}
                          </span>
                          <span className="pt-1.5 text-[color:var(--rf-muted)]">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {(current.opens || current.closes || current.announcement) && (
                <section className="border-t border-[color:var(--rf-border)] bg-[var(--rf-panel)] p-6 sm:p-8">
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  {current.opens && (
                    <div>
                      <dt className="font-bold uppercase tracking-wide text-[color:var(--rf-soft)]">
                         Raffle opens
                      </dt>
                      <dd className="mt-0.5 font-semibold text-[color:var(--rf-text)]">{formatPH(current.opens)}</dd>
                    </div>
                  )}
                  {current.closes && (
                    <div>
                      <dt className="font-bold uppercase tracking-wide text-[color:var(--rf-soft)]">
                        Raffle closes
                      </dt>
                      <dd className="mt-0.5 font-semibold text-[color:var(--rf-text)]">{formatPH(current.closes)}</dd>
                    </div>
                  )}
                  {current.announcement && (
                    <div className="sm:col-span-2">
                      <dt className="font-bold uppercase tracking-wide text-[color:var(--rf-soft)]">
                        Winners announced
                      </dt>
                      <dd className="mt-0.5 font-semibold text-[color:var(--rf-text)]">{current.announcement}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-4 text-xs text-[color:var(--rf-faint)]">
                  All times are Philippine time (GMT+8).
                </p>
                </section>
                )}
              </div>

              {/* --- The form, or why there isn't one --- */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                {currentStatus === 'upcoming' && (
                  <div className={`${panel} p-6 text-center`}>
                    <p className="font-[family-name:var(--rf-font-display)] text-2xl uppercase leading-none text-[color:var(--rf-text)]">
                      Hindi pa bukas
                    </p>
                    <p className="mt-3 text-sm text-[color:var(--rf-muted)]">
                      The entry form appears here the moment the countdown hits zero —
                      no need to reload. Read the mechanics so you&rsquo;re ready.
                    </p>
                  </div>
                )}

                {currentStatus === 'closed' && (
                  <div className={`${panel} p-6 text-center sm:p-8`}>
                    <p className="font-[family-name:var(--rf-font-display)] text-2xl uppercase leading-none text-[color:var(--rf-text)]">
                      Sarado na — entries are closed
                    </p>
                    <p className="mt-3 text-sm text-[color:var(--rf-muted)]">
                      Maraming salamat to everyone who joined!
                      {current.announcement ? (
                        <> Winners will be announced {current.announcement}.</>
                      ) : (
                        <> Follow all our social media for the winners.</>
                      )}
                    </p>
                    <p className="mt-4 text-xs text-[color:var(--rf-soft)]">
                      This page updates once the winners are posted — no need to keep
                      refreshing.
                    </p>
                  </div>
                )}

                {/* Drawn. Each winner's name links to the post they entered
                    with, when we have it — which is automatic for winners picked
                    from the entries list, and optional ("Name | url") for ones
                    typed by hand. */}
                {currentStatus === 'ended' && (
                  <div className={`${panel} p-6 text-center sm:p-8`}>
                    <p className="font-[family-name:var(--rf-font-display)] text-2xl uppercase leading-none text-[color:var(--rf-text)]">
                      Winners
                    </p>

                    {current.winners.length > 0 ? (
                      <ul className="mt-5 space-y-2.5">
                        {current.winners.map((w, i) => (
                          <li
                            key={`${i}-${w.name}`}
                            className="font-[family-name:var(--rf-font-display)] text-xl uppercase leading-tight text-[color:var(--rf-text)]"
                          >
                            {/* Already scheme-checked in lib/raffles.js. */}
                            {w.url ? (
                              <a
                                href={w.url}
                                target="_blank"
                                rel="noreferrer"
                                className="underline decoration-[color:var(--rf-border-strong)] decoration-2 underline-offset-4 transition hover:decoration-[color:var(--rf-text)]"
                                title="See their entry post"
                              >
                                {w.name}
                              </a>
                            ) : (
                              w.name
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      // `active` unticked with nothing drawn — retired by hand.
                      <p className="mt-3 text-sm text-[color:var(--rf-muted)]">
                        This raffle has ended.
                      </p>
                    )}

                    <p className="mt-6 text-xs text-[color:var(--rf-soft)]">
                      {current.winners.some((w) => w.url)
                        ? 'Names link to the post they entered with. '
                        : ''}
                      Congrats! We&rsquo;ll reach out using the details you entered with.
                      Maraming salamat to everyone who joined.
                    </p>
                  </div>
                )}

                {currentStatus === 'open' && (
                  <>
                    <h3 className="mb-4 font-[family-name:var(--rf-font-display)] text-2xl uppercase leading-tight text-[color:var(--rf-text)]">
                      Submit your entry here
                    </h3>
                    {/* Keyed by slug so switching raffles remounts the form — its
                        "already entered" state is read from localStorage once, on
                        mount, and would otherwise carry over to the next raffle. */}
                    <RaffleForm key={current.slug} raffle={current} preview={preview} />
                    {current.note && (
                      <p className="mt-4 rounded-xl border border-[color:var(--rf-border-strong)] bg-[var(--rf-input)] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[color:var(--rf-text)]">
                        ⚠ {current.note}
                      </p>
                    )}
                  </>
                )}
              </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* The archive lives on the index now — a detail page listing every other
          raffle competed with the one you actually came for. */}
      {current && (
        <section className="border-t border-[color:var(--rf-border)] py-12 text-center">
          <Link
            to="/raffle"
            className="font-[family-name:var(--rf-font-body)] text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--rf-soft)] underline-offset-4 transition hover:text-[color:var(--rf-text)] hover:underline"
          >
            See all {campaign.name} raffles →
          </Link>
        </section>
      )}
    </CampaignTheme>
  )
}
