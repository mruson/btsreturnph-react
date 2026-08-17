import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSupabase } from '../lib/supabaseClient'
import { ENTRIES_TABLE, SUPABASE_ENVIRONMENT, isSupabaseConfigured } from '../data/supabase'
import { formatPH } from '../lib/datetime'
import { statusOf, toRaffle } from '../lib/raffles'
import { safeUrl } from '../lib/safeUrl'
import RaffleEditor from '../components/RaffleEditor'
import CampaignEditor from '../components/CampaignEditor'

// ============================================================================
// ADMIN — live raffle entries.
// ============================================================================
// Signed-in admins only. The route is noindex and absent from the nav, but that
// is tidiness, not security: what actually keeps entrants' names, emails, and
// phone numbers private is the row-level security policy in supabase/setup.sql,
// which grants SELECT to `authenticated` and not to `anon`. Anyone may open
// this URL; without a session they see a login form and the database returns
// them nothing.
//
// Accounts are created in the Supabase dashboard (Authentication → Users →
// Add user). There is no sign-up here on purpose — a public sign-up form on a
// page that reads entrant data would hand anyone a key.
//
// DESIGN: this page deliberately does NOT wear the site's "BTS in the City"
// theme — no Anton, no cream, no crimson. It's an internal tool, and the things
// that make the public pages good (big display type, brand colour, generous
// spacing) actively hurt a dense table you scan for twenty minutes looking for a
// duplicate. So: system-neutral slate, Inter at small sizes, tight rows, colour
// reserved for meaning rather than decoration — amber for "needs a look", red
// for problems, emerald for live. Layout.jsx also drops the public navbar and
// footer for /admin routes.

// Entries arrive over a realtime channel, so the table updates as people enter
// without anyone refreshing. The initial fetch below is the backfill; the
// subscription takes over from there.
// Supabase caps API responses at 1,000 rows, so this is the page size rather
// than a total — `load()` below walks through as many pages as it takes.
const PAGE_SIZE = 1000

// A stop so a bug can't spin forever. Well above any plausible raffle; if it's
// ever hit the dashboard says so out loud rather than quietly truncating.
const MAX_ENTRIES = 50000

// Must match the platform check constraint in supabase/setup.sql — the database
// rejects anything else, so this list is the complete set of possible values.
const PLATFORMS = ['Facebook', 'X', 'Instagram', 'TikTok']

// --- Duplicate detection ----------------------------------------------------
// Email-per-platform and post link are enforced in the database, so those
// duplicates can never land. What CAN repeat is a phone number or a social
// profile — often innocent (a shared family phone), sometimes one person
// entering twice under two email addresses. Flag them for a human, don't block.
//
// Comparison is scoped to ONE PLATFORM, which matters now that a raffle can
// allow one entry per platform: the same person entering on Facebook and X has
// the same phone number by design, and flagging that would make this column
// noise. Two entries sharing a phone on the SAME platform is the real signal —
// that's someone using a second email address to enter twice.

const digitsOnly = (v) => String(v || '').replace(/\D/g, '')

const normalizeUrl = (v) =>
  String(v || '')
    .trim()
    .toLowerCase()
    .split('?')[0]
    .replace(/\/+$/, '')

// Returns Map<entryId, reasons[]> — which fields this entry shares with another
// entry in the same list. Reasons rather than a plain flag so the table can say
// *why* something is suspicious: "same phone" and "same profile" call for
// different judgement, and a row with both is a much stronger signal than either
// alone.
function findDuplicates(entries) {
  const byPhone = new Map()
  const bySocial = new Map()

  for (const e of entries) {
    const phone = digitsOnly(e.contact)
    const social = normalizeUrl(e.social_link)
    // Platform is part of the key — see the note above.
    if (phone) {
      const k = `${e.platform}|${phone}`
      byPhone.set(k, [...(byPhone.get(k) || []), e.id])
    }
    if (social) {
      const k = `${e.platform}|${social}`
      bySocial.set(k, [...(bySocial.get(k) || []), e.id])
    }
  }

  const reasons = new Map()
  const add = (id, reason) => reasons.set(id, [...(reasons.get(id) || []), reason])

  for (const group of byPhone.values()) {
    if (group.length > 1) group.forEach((id) => add(id, 'phone'))
  }
  for (const group of bySocial.values()) {
    if (group.length > 1) group.forEach((id) => add(id, 'profile'))
  }
  return reasons
}

// "Yes — same phone" reads at a glance; a bare "Dupe?" made people ask what it
// meant, which is the whole job of this column failing.
function duplicateLabel(reasons) {
  if (!reasons?.length) return null
  if (reasons.length > 1) return 'Same phone + profile, same platform'
  return reasons[0] === 'phone'
    ? 'Same phone, same platform'
    : 'Same profile, same platform'
}

// --- Masking ----------------------------------------------------------------
// Emails and phone numbers are hidden until asked for. This dashboard gets left
// open on a shared screen, screenshotted into group chats, and screen-shared
// while drawing winners — none of which needs anybody's contact details on show.
// Enough is left visible to tell two entrants apart at a glance.

function maskEmail(value) {
  const raw = String(value ?? '')
  const at = raw.lastIndexOf('@')
  if (at < 1) return '•'.repeat(8)
  // First letter plus the domain: enough to recognise an address you already
  // know, not enough to write it down.
  return `${raw[0]}${'•'.repeat(Math.max(3, at - 1))}${raw.slice(at)}`
}

function maskPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length < 4) return '•'.repeat(8)
  // Last three digits — the part people quote when confirming a number.
  return `${'•'.repeat(Math.max(3, digits.length - 3))}${digits.slice(-3)}`
}

// Click to reveal one value; the toolbar toggle reveals every one at once for
// when you're actually contacting winners.
function Masked({ value, mask, what, name, revealAll }) {
  const [shown, setShown] = useState(false)
  const visible = shown || revealAll

  return (
    <button
      type="button"
      onClick={() => setShown((v) => !v)}
      title={visible ? 'Click to hide' : 'Click to reveal'}
      aria-label={`${visible ? 'Hide' : 'Show'} ${what} for ${name}`}
      className={`text-left underline-offset-2 hover:underline ${
        visible ? 'text-slate-600' : 'font-mono tracking-tight text-slate-400'
      }`}
    >
      {visible ? value : mask(value)}
    </button>
  )
}

// --- CSV --------------------------------------------------------------------

const CSV_COLUMNS = [
  ['created_at', 'Submitted'],
  ['name', 'Name'],
  ['email', 'Email'],
  ['contact', 'Contact'],
  ['platform', 'Platform'],
  ['social_link', 'Social link'],
  ['proof', 'Post link'],
  ['invalid_reason', 'Disqualified because'],
  ['is_winner', 'Winner'],
]

// Escape per RFC 4180. The leading-character guard stops a spreadsheet treating
// a value like "=1+1" or "+63..." as a formula when the file is opened — a real
// risk when the data is typed by strangers.
function csvCell(value) {
  const s = String(value ?? '')
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

// `duplicates` is the same Map the table uses, so the exported column can't
// disagree with what was on screen when you clicked Export.
function toCsv(entries, duplicates) {
  const header = [...CSV_COLUMNS.map(([, label]) => label), 'Duplicate']
    .map(csvCell)
    .join(',')
  const rows = entries.map((e) =>
    [
      ...CSV_COLUMNS.map(([key]) => csvCell(e[key])),
      csvCell(duplicateLabel(duplicates.get(e.id)) || 'No'),
    ].join(','),
  )
  return [header, ...rows].join('\r\n')
}

function downloadCsv(filename, csv) {
  // BOM so Excel opens UTF-8 names correctly instead of mangling them.
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function EntryLink({ href, label }) {
  const url = safeUrl(href)
  if (!url) {
    return (
      <span
        className="cursor-help text-amber-700 underline decoration-dotted"
        title={`Not a usable web link, so it isn't clickable: ${String(href).slice(0, 120)}`}
      >
        {label}?
      </span>
    )
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-slate-600 underline underline-offset-2 hover:text-slate-900"
    >
      {label}
    </a>
  )
}

// --- Confirm dialog ---------------------------------------------------------
// Used before anything that changes what the public sees. Focus lands on Cancel,
// not Confirm: this is a speed bump, and a stray Enter shouldn't vault over it.
function ConfirmDialog({ title, body, confirmLabel, danger = false, onConfirm, onCancel }) {
  const cancelRef = useRef(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* A button rather than a div so clicking away is a real control, but kept
          out of the tab order — Escape and Cancel are the keyboard paths. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-slate-900/40"
      />

      <div className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id="confirm-title" className="text-base font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium text-white transition ${
              danger ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-900 hover:bg-slate-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Sign in ----------------------------------------------------------------

function SignIn({ onSignedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await getSupabase().auth.signInWithPassword({ email, password })
    setBusy(false)
    if (err) setError(err.message)
    else onSignedIn()
  }

  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="text-xl font-semibold tracking-tight">Admin sign in</h1>
      <p className="mt-2 text-sm text-slate-500">
        Raffle entries contain people&rsquo;s contact details. Sign in with your own
        account — don&rsquo;t share one.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="admin-email" className="block text-xs font-medium text-slate-600">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-xs font-medium text-slate-600">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="w-full rounded-md bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

// --- Entry row --------------------------------------------------------------

function StatusCell({ entry, onSave }) {
  const [editing, setEditing] = useState(false)
  const [reason, setReason] = useState(entry.invalid_reason || '')
  const [busy, setBusy] = useState(false)

  async function save(nextReason) {
    setBusy(true)
    await onSave(entry.id, nextReason)
    setBusy(false)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2">
        <input
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (e.g. post is private)"
          className="w-52 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-900 focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy || !reason.trim()}
            onClick={() => save(reason.trim())}
            className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (entry.invalid_reason) {
    return (
      <div>
        <p className="text-xs font-medium text-red-600">
          Disqualified
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{entry.invalid_reason}</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => save(null)}
          className="mt-1 text-xs text-slate-500 underline-offset-2 hover:text-slate-900"
        >
          Undo
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-sm text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
    >
      Mark invalid
    </button>
  )
}

// Plain neutral chrome for every state of this page, signed in or not.
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <div className="mx-auto w-full max-w-2xl px-6">{children}</div>
    </div>
  )
}

// --- Page -------------------------------------------------------------------

export default function AdminRaffles() {
  const supabase = getSupabase()

  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [slug, setSlug] = useState('all')
  // Filters combine: "All raffles + X" is as valid as "one raffle + all platforms".
  const [platform, setPlatform] = useState('all')
  const [live, setLive] = useState(false)

  // Raffle management — the half of this page that replaced the spreadsheet.
  const [tab, setTab] = useState('entries') // entries | raffles | campaigns
  const [campaigns, setCampaigns] = useState([])
  const [editingCampaign, setEditingCampaign] = useState(null)
  // { entry, next } while the winner confirmation is open. Both directions
  // change what the public sees, so both go through it.
  const [pendingWinner, setPendingWinner] = useState(null)
  // Off on every load on purpose — a reveal shouldn't outlive the moment you
  // needed it, and this page is often reopened on a shared screen.
  const [revealContacts, setRevealContacts] = useState(false)
  const [raffles, setRaffles] = useState([])
  const [editing, setEditing] = useState(null) // raffle row, or 'new', or null

  // --- Session ---
  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCheckingSession(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => sub.subscription.unsubscribe()
  }, [supabase])

  // --- Campaigns ---
  const loadCampaigns = useCallback(async () => {
    if (!supabase) return
    const { data, error: err } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: true })
    if (err) setError(err.message)
    else setCampaigns(data || [])
  }, [supabase])

  const saveCampaign = useCallback(
    async (row, slug) => {
      // Exactly one campaign is primary. Clearing the others first means the
      // index can't end up landing on an arbitrary one.
      if (row.is_primary) {
        const { error: clearErr } = await supabase
          .from('campaigns')
          .update({ is_primary: false })
          .neq('slug', row.slug)
        if (clearErr) return clearErr.message
      }

      const query = slug
        ? supabase.from('campaigns').update(row).eq('slug', slug)
        : supabase.from('campaigns').insert(row)
      const { error: err } = await query
      if (err) {
        return err.code === '23505' ? 'That slug is already taken — pick another.' : err.message
      }
      await loadCampaigns()
      setEditingCampaign(null)
      return null
    },
    [supabase, loadCampaigns],
  )

  // --- Raffles ---
  const loadRaffles = useCallback(async () => {
    if (!supabase) return
    const { data, error: err } = await supabase
      .from('raffles')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setRaffles(data || [])
  }, [supabase])

  // Returns an error message on failure, or null on success — the editor shows
  // it inline rather than the page swallowing it.
  const saveRaffle = useCallback(
    async (row, id) => {
      const query = id
        ? supabase.from('raffles').update(row).eq('id', id)
        : supabase.from('raffles').insert(row)
      const { error: err } = await query
      if (err) {
        // 23505 is the unique index on `slug`.
        return err.code === '23505'
          ? 'That slug is already taken — pick another.'
          : err.message
      }
      await loadRaffles()
      setEditing(null)
      return null
    },
    [supabase, loadRaffles],
  )

  // --- Backfill ---
  // Pages through every entry rather than taking the first 1,000.
  //
  // This used to be a single `.limit(1000)`, which failed in the worst way: past
  // a thousand entries the dashboard silently showed the newest thousand, the
  // CSV exported only those, and duplicate detection only compared within them —
  // so you could have drawn a winner from a partial list without any warning.
  // Raising the number wouldn't have helped either; Supabase caps API responses
  // at 1,000 rows server-side, so paging is the only way through.
  //
  // Ordered ASCENDING on purpose. Entries arrive continuously, and with DESC the
  // newest row shifts every subsequent page by one, which duplicates and skips
  // rows mid-fetch. Ascending keeps already-written rows at stable offsets; new
  // ones simply land after the last page. The list is reversed for display.
  const load = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setError(null)

    const collected = []
    for (let from = 0; from < MAX_ENTRIES; from += PAGE_SIZE) {
      const { data, error: err } = await supabase
        .from(ENTRIES_TABLE)
        .select('*')
        .order('created_at', { ascending: true })
        .range(from, from + PAGE_SIZE - 1)

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      collected.push(...(data || []))
      if (!data || data.length < PAGE_SIZE) break
    }

    setLoading(false)
    if (collected.length >= MAX_ENTRIES) {
      setError(
        `Showing the first ${MAX_ENTRIES.toLocaleString()} entries — raise MAX_ENTRIES ` +
          `in AdminRaffles.jsx if a raffle really got this big.`,
      )
    }
    // Realtime may have delivered a row that the paging also picked up.
    const seen = new Set()
    setEntries(
      collected.reverse().filter((e) => (seen.has(e.id) ? false : seen.add(e.id))),
    )
  }, [supabase])

  useEffect(() => {
    if (session) {
      load()
      loadRaffles()
      loadCampaigns()
    }
  }, [session, load, loadRaffles, loadCampaigns])

  // --- Realtime ---
  useEffect(() => {
    if (!supabase || !session) return

    const channel = supabase
      .channel('raffle-entries-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: ENTRIES_TABLE },
        (payload) => {
          setEntries((prev) => {
            if (payload.eventType === 'INSERT') {
              // Guard against the backfill and the subscription both delivering
              // the same row in the moment the page loads.
              if (prev.some((e) => e.id === payload.new.id)) return prev
              return [payload.new, ...prev]
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((e) => (e.id === payload.new.id ? payload.new : e))
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((e) => e.id !== payload.old.id)
            }
            return prev
          })
        },
      )
      .subscribe((status) => setLive(status === 'SUBSCRIBED'))

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, session])

  // --- Derived ---
  // id → title, so the filter and the table can name a raffle instead of showing
  // a UUID. Falls back to the id for an entry whose raffle was somehow removed.
  const raffleName = useCallback(
    (id) => raffles.find((r) => r.id === id)?.title || id,
    [raffles],
  )

  const raffleIds = useMemo(() => [...new Set(entries.map((e) => e.raffle_id))], [entries])

  const visible = useMemo(
    () =>
      entries.filter(
        (e) =>
          (slug === 'all' || e.raffle_id === slug) &&
          (platform === 'all' || e.platform === platform),
      ),
    [entries, slug, platform],
  )

  // Computed per raffle across ALL loaded entries, never on the filtered view.
  //
  // Two reasons. Sharing a phone across two *different* raffles is normal — the
  // same person entering both — so comparing across raffles would flag ordinary
  // repeat entrants. And someone entering the same raffle twice via Facebook and
  // X is exactly the abuse worth catching, which a platform-filtered comparison
  // would hide. Scoping to the raffle also keeps the flags stable: switching
  // filters changes which rows you see, never what they mean.
  const duplicates = useMemo(() => {
    const byRaffle = new Map()
    for (const e of entries) {
      byRaffle.set(e.raffle_id, [...(byRaffle.get(e.raffle_id) || []), e])
    }
    const merged = new Map()
    for (const group of byRaffle.values()) {
      for (const [id, reasons] of findDuplicates(group)) merged.set(id, reasons)
    }
    return merged
  }, [entries])

  const counts = useMemo(() => {
    const disqualified = visible.filter((e) => e.invalid_reason).length
    return {
      total: visible.length,
      valid: visible.length - disqualified,
      disqualified,
      // Counted over what's on screen, not the whole map — otherwise the number
      // would contradict the rows beneath it whenever a filter is applied.
      flagged: visible.filter((e) => duplicates.has(e.id)).length,
    }
  }, [visible, duplicates])

  // Marking a winner does two writes, and the second is the important one.
  //
  // The flag lives on the entry, but the public page can't read entries — anon
  // SELECT is what protects everyone's email and phone number. So we also write a
  // snapshot of just { name, proof } for every flagged entry onto the raffle row,
  // which is already world-readable. That's what the raffle page renders, and it
  // means a winner's name can link to their post without exposing anything else.
  const toggleWinner = useCallback(
    async (entry, next) => {
      const { error: flagErr } = await supabase
        .from(ENTRIES_TABLE)
        .update({ is_winner: next })
        .eq('id', entry.id)
      if (flagErr) {
        setError(flagErr.message)
        return
      }

      // Recompute from what's on screen, applying the change we just made —
      // `entries` hasn't been refreshed by realtime yet at this point.
      const winners = entries
        .filter((e) => e.raffle_id === entry.raffle_id)
        .filter((e) => (e.id === entry.id ? next : e.is_winner))
        .filter((e) => !e.invalid_reason)
        .map((e) => ({ name: e.name, proof: e.proof }))

      const { error: snapErr } = await supabase
        .from('raffles')
        .update({ winner_entries: winners })
        .eq('id', entry.raffle_id)
      if (snapErr) setError(snapErr.message)
      else await loadRaffles()
    },
    [supabase, entries, loadRaffles],
  )

  const setInvalid = useCallback(
    async (id, reason) => {
      const { error: err } = await supabase
        .from(ENTRIES_TABLE)
        .update({
          invalid_reason: reason,
          invalidated_at: reason ? new Date().toISOString() : null,
        })
        .eq('id', id)
      if (err) setError(err.message)
      // The realtime UPDATE event refreshes the row; no local patching needed.
    },
    [supabase],
  )

  // --- Render ---
  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <div className="py-20">
        <h1 className="text-xl font-semibold tracking-tight">Not configured</h1>
        <p className="mt-2 max-w-lg text-sm text-slate-600">
          Fill in your project URL and anon key in{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
            src/data/supabase.js
          </code>
          , then rebuild.
        </p>
        </div>
      </Shell>
    )
  }

  if (checkingSession) {
    return (
      <Shell>
        <p className="py-20 text-center text-sm text-slate-500">Checking session…</p>
      </Shell>
    )
  }

  if (!session) {
    return (
      <Shell>
        <SignIn onSignedIn={() => {}} />
      </Shell>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {pendingWinner && (
        <ConfirmDialog
          title={
            pendingWinner.next
              ? `Publish ${pendingWinner.entry.name} as a winner?`
              : `Remove ${pendingWinner.entry.name} from the winners?`
          }
          body={
            pendingWinner.next
              ? 'Their name and post link appear on the raffle page immediately — do this after you’ve announced, not before.'
              : 'Their name disappears from the raffle page immediately, including for anyone who has already seen it.'
          }
          confirmLabel={pendingWinner.next ? 'Publish winner' : 'Remove winner'}
          danger={!pendingWinner.next}
          onCancel={() => setPendingWinner(null)}
          onConfirm={() => {
            const { entry, next } = pendingWinner
            setPendingWinner(null)
            toggleWinner(entry, next)
          }}
        />
      )}

      {/* Which database am I looking at? Preview and production hold different
          raffles and different entries, and mistaking one for the other means
          drawing a winner from test data. Only the real domain is unmarked. */}
      {SUPABASE_ENVIRONMENT !== 'production' && (
        <div className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-center">
          <p className="text-xs font-medium text-amber-900">
            Preview database — not live entries
          </p>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1400px] px-6 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {tab === 'entries'
              ? 'Raffle entries'
              : tab === 'raffles'
                ? 'Manage raffles'
                : 'Manage campaigns'}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  live ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
                aria-hidden
              />
              {live ? 'Live — new entries appear automatically' : 'Not connected to live updates'}
              <span className="text-slate-300">·</span>
              {session.user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRevealContacts((v) => !v)}
              aria-pressed={revealContacts}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                revealContacts
                  ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {revealContacts ? 'Hide contact details' : 'Reveal contact details'}
            </button>
            <button type="button" onClick={load} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50">
              Refresh
            </button>
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  // Name the file after the filters, so two exports taken
                  // minutes apart can't be mixed up in a downloads folder.
                  [
                    'raffle-entries',
                    slug === 'all'
                      ? 'all'
                      : raffles.find((r) => r.id === slug)?.slug || slug,
                    platform === 'all' ? null : platform.toLowerCase(),
                    new Date().toISOString().slice(0, 10),
                  ]
                    .filter(Boolean)
                    .join('-') + '.csv',
                  toCsv(visible, duplicates),
                )
              }
              disabled={!visible.length}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b border-slate-200">
          {[
            ['entries', 'Entries'],
            ['raffles', 'Raffles'],
            ['campaigns', 'Campaigns'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                tab === key
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'campaigns' ? (
          <CampaignsTab
            campaigns={campaigns}
            raffles={raffles}
            editing={editingCampaign}
            setEditing={setEditingCampaign}
            onSave={saveCampaign}
          />
        ) : tab === 'raffles' ? (
          <RafflesTab
            raffles={raffles}
            campaigns={campaigns}
            editing={editing}
            setEditing={setEditing}
            onSave={saveRaffle}
            entryCounts={entries}
          />
        ) : (
        <>
        {/* Filter + counts */}
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="raffle-filter"
                className="block text-xs font-medium text-slate-500"
              >
                Raffle
              </label>
              <select
                id="raffle-filter"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="all">All raffles</option>
                {raffleIds.map((id) => (
                  <option key={id} value={id}>
                    {raffleName(id)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="platform-filter"
                className="block text-xs font-medium text-slate-500"
              >
                Platform
              </label>
              <select
                id="platform-filter"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="mt-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="all">All platforms</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {(slug !== 'all' || platform !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSlug('all')
                  setPlatform('all')
                }}
                className="pb-2 text-sm text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <dl className="flex flex-wrap gap-8">
            {[
              ['Entries', counts.total],
              ['Valid', counts.valid],
              ['Disqualified', counts.disqualified],
              ['Flagged', counts.flagged],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium text-slate-500">
                  {label}
                </dt>
                <dd className="mt-0.5 text-2xl font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Table — scrolls inside its own box so the page never scrolls sideways */}
        <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Links</th>
                <th className="px-4 py-3">Duplicate</th>
                <th className="px-4 py-3">Winner</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((e) => {
                const dupeReason = duplicateLabel(duplicates.get(e.id))
                return (
                  <tr
                    key={e.id}
                    className={`align-top transition hover:bg-slate-50 ${
                      e.invalid_reason ? 'opacity-45' : ''
                    } ${dupeReason ? 'bg-amber-50' : ''}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {formatPH(new Date(e.created_at))}
                    </td>
                    <td className="px-4 py-3 font-medium">{e.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <Masked
                        value={e.email}
                        mask={maskEmail}
                        what="email"
                        name={e.name}
                        revealAll={revealContacts}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <Masked
                        value={e.contact}
                        mask={maskPhone}
                        what="contact number"
                        name={e.name}
                        revealAll={revealContacts}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{e.platform}</td>
                    {/* Entrant-supplied URLs. Anything that isn't http(s) is shown
                        as inert text — see lib/safeUrl. An admin clicking a
                        javascript: link would run it inside a session that can
                        read every entrant's contact details. */}
                    <td className="px-4 py-3 text-slate-600">
                      <EntryLink href={e.proof} label="Post" />
                      <span className="px-1.5 text-slate-300">·</span>
                      <EntryLink href={e.social_link} label="Profile" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {dupeReason ? (
                        <>
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                            Yes
                          </span>
                          <span className="ml-2 text-slate-600">{dupeReason}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(e.is_winner)}
                          disabled={Boolean(e.invalid_reason)}
                          onChange={(ev) =>
                            setPendingWinner({ entry: e, next: ev.target.checked })
                          }
                          className="h-4 w-4 accent-slate-900 disabled:opacity-40"
                        />
                        <span className={e.is_winner ? 'font-medium' : 'text-slate-400'}>
                          {e.is_winner ? 'Winner' : 'Pick'}
                        </span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <StatusCell entry={e} onSave={setInvalid} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {!visible.length && (
            <p className="px-4 py-16 text-center text-sm text-slate-400">
              {loading ? 'Loading…' : 'No entries yet.'}
            </p>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Emails and contact numbers are hidden by default — click one to reveal it,
          or use <strong>Reveal contact details</strong> for all of them. Reveals reset
          when you reload. The CSV export always contains the full values, since
          that&rsquo;s what you use to reach a winner.
        </p>
        <p className="mt-3 text-xs text-slate-400">
          Ticking <strong>Winner</strong> publishes that entrant&rsquo;s name to the
          raffle page immediately, linked to the post they entered with — so tick it
          after you&rsquo;ve announced, not before. Disqualified entries can&rsquo;t be
          picked, and are dropped from the published list if they already were.
        </p>
        <p className="mt-3 text-xs text-slate-400">
          A duplicate here means two entries <em>on the same platform</em> share a phone
          number or social profile — worth a look, not proof of anything (families share
          phones). Entering from several platforms is not flagged, since raffles set to
          &ldquo;one entry per platform&rdquo; invite exactly that. Duplicate post links,
          and repeat entries from the same email on one platform, can&rsquo;t reach this
          table at all — the database rejects those at entry.
        </p>
        </>
        )}
      </div>
    </div>
  )
}

// --- Raffles tab ------------------------------------------------------------

function RafflesTab({ raffles, campaigns, editing, setEditing, onSave, entryCounts }) {
  if (editing) {
    return (
      <div className="mt-8">
        <RaffleEditor
          raffle={editing === 'new' ? null : editing}
          campaigns={campaigns}
          onSave={onSave}
          onCancel={() => setEditing(null)}
        />
      </div>
    )
  }

  const now = Date.now()

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          This is where raffles are created now — no spreadsheet, no deploy. Saving
          publishes immediately.
        </p>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="rounded-md bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + New raffle
        </button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs font-medium text-slate-500">
              <th className="px-4 py-3">Raffle</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Opens</th>
              <th className="px-4 py-3">Closes</th>
              <th className="px-4 py-3">Entries</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {raffles.map((row) => {
              // Same status function the public page uses, so what an admin sees
              // here can't disagree with what visitors see.
              const status = statusOf(toRaffle(row), now)
              return (
                <tr key={row.id} className="align-middle">
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{row.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${
                        status === 'open'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'upcoming'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {row.opens ? formatPH(new Date(row.opens)) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {row.closes ? formatPH(new Date(row.closes)) : '—'}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {entryCounts.filter((e) => e.raffle_id === row.id).length}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(row)}
                      className="text-sm text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!raffles.length && (
          <p className="px-4 py-16 text-center text-sm text-slate-400">
            No raffles yet — create the first one.
          </p>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Raffles can&rsquo;t be deleted here: entries reference them, and removing one
        would orphan people&rsquo;s entries. Untick <strong>Active</strong> to retire a
        raffle to the public archive instead.
      </p>
    </div>
  )
}

// --- Campaigns tab ----------------------------------------------------------

function CampaignsTab({ campaigns, raffles, editing, setEditing, onSave }) {
  if (editing) {
    return (
      <div className="mt-8">
        <CampaignEditor
          campaign={editing === 'new' ? null : editing}
          onSave={onSave}
          onCancel={() => setEditing(null)}
        />
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          A campaign is a sponsored series. Its name, tagline and sponsor show in the
          header of the index and of every raffle in it — change them here, no deploy.
        </p>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="rounded-md bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + New campaign
        </button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs font-medium text-slate-500">
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Sponsor</th>
              <th className="px-4 py-3">Theme</th>
              <th className="px-4 py-3">Raffles</th>
              <th className="px-4 py-3">Landing</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.map((c) => (
              <tr key={c.slug} className="align-middle transition hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{c.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{c.slug}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {c.sponsor || <span className="text-slate-400">—</span>}
                  {c.sponsor && !c.sponsor_logo_url && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                      no logo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.theme}</td>
                <td className="px-4 py-3 tabular-nums text-slate-600">
                  {raffles.filter((r) => r.campaign === c.slug).length}
                </td>
                <td className="px-4 py-3">
                  {c.is_primary ? (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      /raffle
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    className="text-sm text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!campaigns.length && (
          <p className="px-4 py-16 text-center text-sm text-slate-400">
            No campaigns yet — create one, then point raffles at it.
          </p>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Themes are defined in code (src/data/campaigns.js) because a palette needs
        design work and a deploy. Everything else here is yours to change.
      </p>
    </div>
  )
}
