import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CityPageHero, CityImagePlaceholder, Skeleton, LoadError } from '../components/UI'
import { useSheet, driveImage, isActive, num } from '../lib/sheet'
import { sheets } from '../data/site'

// ---------------------------------------------------------------------------
// EDIT ME — placeholder content for the BTS in the City: Manila page.
// ---------------------------------------------------------------------------

// Latest posts / updates shown in the carousel — live from the "Posts" tab.
// A row whose `active` box is unticked never reaches the carousel.
//
// Deliberately empty. `useSheet` renders this fallback immediately and only
// swaps in real rows once the fetch resolves, so anything here is shown to every
// visitor for a moment — and invented updates read as genuine announcements
// about a real event.
const updates = []

// Fan projects for BTS in Manila — live from the "FanProjects" tab:
//   name | description | target | image | link | button_text | active
//
//   description — optional line under the title
//   target      — optional "Target: …" pill
//   image       — a Drive share link, or a local path like /concert/bus-wrap.webp
//   link        — optional. A site path (/fan-projects) makes the card an
//                 internal link; an http(s) URL opens in a new tab.
//   button_text — the call to action for that link ("Avail ride to Bulacan").
//                 Blank falls back to "See the projects".
//   active      — untick to pull a card without deleting the row
//
// Unlike the Posts and Fund fallbacks, this list is kept filled in: it's real,
// already-published content pointing at images we ship in /public, so showing it
// while the sheet loads (or if it fails) is right rather than misleading.
const projects = [
  { name: 'Lamp Post Banners', target: '20 – 60 posts', image: '/concert/lamp-post-banner.webp' },
  { name: 'Aerial Banners', target: '2 – 5 flyovers', image: '/concert/aerial-banner.webp' },
  { name: 'Surprise Fan Projects (Team Loob)', target: '10,000 – 50,000', image: '/concert/hand-banners.webp', link: '/fan-projects' },
  { name: 'Bus Wraps', target: '2 – 8 buses', image: '/concert/bus-wrap.webp' },
  { name: 'Concert Kits', target: '10,000 – 50,000', image: '/concert/concert-kit.webp' },
  { name: 'Lighting Events', target: 'Manila → Nationwide', image: '/concert/lighting-events.webp' },
  { name: 'Airport Welcome Project', target: '3 – 10 screens', image: '/concert/airport-welcome.webp' },
]

// Label for a card's call to action. The arrow is drawn by the card, so a
// button_text that already ends in one doesn't render "Bili na → →".
const ctaLabel = (value) => {
  const s = String(value ?? '').replace(/[→>\s]+$/, '').trim()
  return s || 'See the projects'
}

// The sheet is editable by several people, so only two shapes are honoured:
// a same-site path (rendered as a client-side <Link>) and an http(s) URL
// (rendered as a new-tab <a>). Anything else — `javascript:`, mailto, junk —
// yields no link at all and the card stays a plain <article>.
function projectLink(value) {
  const s = String(value ?? '').trim()
  if (!s) return null
  if (s.startsWith('/')) return { kind: 'internal', href: s }
  try {
    const { protocol } = new URL(s)
    if (protocol === 'http:' || protocol === 'https:') return { kind: 'external', href: s }
  } catch {
    // not a URL — fall through
  }
  return null
}

// Fundraising snapshot — live from the "Fund" tab. `status` mirrors the sheet:
// "incomplete" rows are still raising (Fund Update), "complete" rows are secured.
//
// The ledger is deliberately empty: totals on this page are summed from these
// rows, so placeholder amounts would flash real-looking peso figures at every
// visitor before the sheet resolves — and would simply stay there if it ever
// failed. Invented numbers don't belong on a page asking people to donate.
const fund = {
  currency: '₱',
  ledger: [],
}

const peso = (n) => `${fund.currency}${n.toLocaleString('en-PH')}`
// Guard the divide: with no rows (or a row whose goal is blank) `goal` is 0,
// and an unguarded ratio yields NaN — which reaches the DOM as `width: NaN%`.
const pct = (raised, goal) => (goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0)
// True only when a sheet cell actually has a value (0 counts; blank/null doesn't).
const has = (v) => v !== '' && v != null

// ---------------------------------------------------------------------------

// Past this many units the pips stop being countable at a glance and start
// being a texture, so a wide row like "50,000 hand banners" falls back to a
// plain proportional bar instead of 50,000 <span>s.
const MAX_PIPS = 60

// Mirrors the Fund update card's shape — total, then three per-project
// columns — so the section doesn't resize when the real figures arrive.
function FundSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-city-ink/10 bg-white p-6 shadow-sm sm:p-8">
      <Skeleton city className="h-8 w-44" />
      <div className="mt-5 flex flex-wrap items-baseline gap-4">
        <Skeleton city className="h-11 w-52" />
        <Skeleton city className="h-4 w-28" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} city className="h-44 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// One square per banner / bus: filled for the ones already secured. The count
// is the headline of a unitised row, so it gets read before any peso figure.
function UnitPips({ secured, total, label }) {
  if (total > MAX_PIPS) {
    return (
      <div
        className="mb-4 mt-3 h-2.5 overflow-hidden rounded-full bg-city-ink/15"
        role="img"
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-city-crimson"
          style={{ width: `${pct(secured, total)}%` }}
        />
      </div>
    )
  }
  return (
    <div
      // mb-4 rather than a margin on the block below: that one is pushed down
      // with mt-auto, which collapses to nothing on a tile that's already full.
      className="mb-4 mt-3 grid gap-1"
      // auto-fill keeps every pip the same width and wraps to as many rows as
      // the tile needs — a fixed column count would squeeze 50 into a hairline.
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(8px, 1fr))' }}
      role="img"
      aria-label={label}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-2.5 rounded-[3px] ${i < secured ? 'bg-city-crimson' : 'bg-city-ink/15'}`}
        />
      ))}
    </div>
  )
}

// The sheet labels a row for the whole set ("Lamp Post Banners") but the
// funding bar is about one of them, so the plural is trimmed for that line.
// Deliberately crude — it only ever runs on a fallback, and a sheet `unit`
// overrides it outright for anything this would mangle.
const singular = (s) => (/[^s]s$/.test(s) ? s.slice(0, -1) : s)

// A row the sheet gives unit counts for: pips for how many are secured, then a
// bar for the money collected toward the next single one.
function UnitTile({ l }) {
  const remaining = Math.max(0, l.numGoal - l.numRaised)
  // `unit` names one item — "bus", "lamp post". It's optional: without it the
  // row's own label stands in, so the bar still reads "For lamp post banner #2"
  // rather than a bare "For #2".
  const unit = l.unit || singular(l.label)
  const nextUnit = `${unit} #${l.numRaised + 1}`
  return (
    <div className="flex h-full flex-col rounded-xl border-2 border-city-ink/10 bg-city-cream p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-manila-body text-sm font-bold uppercase tracking-wide">
          {l.label}
        </span>
        <span className="whitespace-nowrap font-manila-body text-xs font-bold uppercase tracking-wide text-city-crimson">
          {l.numRaised.toLocaleString('en-PH')} of {l.numGoal.toLocaleString('en-PH')} secured
        </span>
      </div>
      {l.description && <p className="mt-1 text-xs text-city-ink/70">{l.description}</p>}

      {/* The pips carry the count on their own — the header already says
          "1 of 50 secured", so no caption repeats it underneath. */}
      <UnitPips
        secured={l.numRaised}
        total={l.numGoal}
        label={`${l.numRaised.toLocaleString('en-PH')} of ${l.numGoal.toLocaleString('en-PH')} ${l.label} secured`}
      />

      {/* Every unit is paid for, so there's no "next one" left to fund. */}
      {remaining > 0 && (
        <div className="mt-auto border-t-2 border-city-ink/10 pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-manila-body text-[11px] font-bold uppercase tracking-wide text-city-ink/70">
              For {nextUnit}
            </span>
            <span className="font-manila-body text-xs font-semibold text-city-ink/60">
              {pct(l.raised, l.goal)}%
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-city-ink/10">
            <div
              className="h-full rounded-full bg-city-sky"
              style={{ width: `${pct(l.raised, l.goal)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-city-ink/60">
            {peso(l.raised)} of {peso(l.goal)} per {unit}
          </p>
        </div>
      )}
    </div>
  )
}

// A row with a single lump-sum goal and no unit counts — the original shape.
function TargetTile({ l }) {
  return (
    <div className="flex h-full flex-col rounded-xl border-2 border-city-ink/10 bg-city-cream p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-manila-body text-sm font-bold uppercase tracking-wide">
          {l.label}
        </span>
        <span className="font-manila-body text-xs font-semibold text-city-ink/60">
          {pct(l.raised, l.goal)}%
        </span>
      </div>
      {l.description && <p className="mt-1 text-xs text-city-ink/70">{l.description}</p>}
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-city-ink/10">
        <div
          className="h-full rounded-full bg-city-sky"
          style={{ width: `${pct(l.raised, l.goal)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-city-ink/60">
        {peso(l.raised)} / {peso(l.goal)}
      </p>
    </div>
  )
}

function UpdatesCarousel({ items }) {
  const scroller = useRef(null)
  const nudge = (dir) => {
    const el = scroller.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }
  return (
    <div className="relative">
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((u) => {
          const clickable = Boolean(u.link)
          const Wrapper = clickable ? 'a' : 'article'
          return (
            <Wrapper
              key={u.title}
              {...(clickable ? { href: u.link, target: '_blank', rel: 'noreferrer' } : {})}
              className={`block w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl border-2 border-city-ink/10 bg-white shadow-sm transition sm:w-[360px] ${
                clickable ? 'hover:-translate-y-1 hover:border-city-crimson/40 hover:shadow-md' : ''
              }`}
            >
              {u.image ? (
                <img
                  src={driveImage(u.image)}
                  alt={u.title}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full border-b-2 border-city-ink/10 object-cover"
                />
              ) : (
                <CityImagePlaceholder label="Post image" ratio="aspect-[4/5]" className="rounded-b-none border-0 border-b-2" />
              )}
              <div className="p-5">
                <p className="font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
                  {u.date}
                </p>
                <h3 className="mt-2 font-manila text-xl uppercase leading-tight">{u.title}</h3>
                <p className="mt-2 text-sm text-city-ink/70">{u.blurb}</p>
              </div>
            </Wrapper>
          )
        })}
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="Previous updates"
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-city-ink text-city-ink transition hover:bg-city-ink hover:text-city-cream"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label="More updates"
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-city-ink text-city-ink transition hover:bg-city-ink hover:text-city-cream"
        >
          ›
        </button>
      </div>
    </div>
  )
}

export default function Concert() {
  // Live "What's new" items from the Google Sheet, falling back to `updates`.
  // Rows with `active` unchecked are dropped, so a post can be pulled from the
  // carousel without deleting it. Sorted by date, newest first — so order
  // doesn't depend on sheet row position.
  const {
    rows: updateItems,
    loading: updatesLoading,
    error: updatesError,
    reload: reloadUpdates,
  } = useSheet(sheets.id, sheets.tabs.updates, updates)
  const sortedUpdates = useMemo(
    () =>
      updateItems
        .filter((u) => isActive(u.active))
        .sort((a, b) => {
          const da = Date.parse(a.date)
          const db = Date.parse(b.date)
          if (isNaN(da) && isNaN(db)) return 0
          if (isNaN(da)) return 1
          if (isNaN(db)) return -1
          return db - da
        }),
    [updateItems],
  )

  // Fan project cards, live from the Sheet with the list above as the fallback.
  const { rows: projectRows } = useSheet(sheets.id, sheets.tabs.fanProjects, projects)
  const activeProjects = useMemo(
    () => projectRows.filter((p) => String(p.name ?? '').trim() && isActive(p.active)),
    [projectRows],
  )

  // Live fund ledger from the Sheet. A row is "unitised" when it carries both
  // counts and a per-unit price — for those, `goal` is the cost of ONE banner /
  // bus and `raised` is only the money collected toward the next one, so the
  // row's real total has to add back the units already paid for. Rows without
  // the counts keep the plain lump-sum reading of raised/goal.
  const {
    rows: fundRows,
    loading: fundLoading,
    error: fundError,
    reload: reloadFund,
  } = useSheet(sheets.id, sheets.tabs.fund, fund.ledger)
  const ledger = fundRows
    .filter((r) => r.label)
    .map((r) => {
      const raised = num(r.raised)
      const goal = num(r.goal)
      const numRaised = has(r.num_raised) ? num(r.num_raised) : null
      const numGoal = has(r.num_goal) ? num(r.num_goal) : null
      const unitised = numRaised != null && numGoal != null && numGoal > 0 && goal > 0
      return {
        label: r.label,
        raised,
        goal,
        numRaised,
        numGoal,
        unitised,
        unit: String(r.unit ?? '').trim(), // singular noun: "banner", "bus"
        total: unitised ? numRaised * goal + raised : raised,
        status: String(r.status ?? '').trim().toLowerCase(),
        description: String(r.description ?? '').trim(), // optional blurb under the label
      }
    })

  // "complete" rows are already secured and move to their own list; everything
  // else is still raising, so it drives the Fund Update card and its total.
  const secured = ledger.filter((l) => l.status === 'complete')
  const funding = ledger.filter((l) => l.status !== 'complete')
  const raised = funding.reduce((s, r) => s + r.total, 0)

  // A row without a goal has nothing to fill, so a bar would sit permanently
  // empty at "0%" beside rows that are genuinely progressing. Those rows are
  // still real money, so they're listed as plain amounts instead.
  const tiles = funding.filter((l) => l.unitised || l.goal > 0)
  const untargeted = funding.filter((l) => !l.unitised && l.goal <= 0)

  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      <CityPageHero
        code="Concert Initiative · THE RE:TURN"
        titleLines={['BTS', 'in the City:', 'Manila to Bulacan']}
        subtitle="BIGGER. BETTER. LOUDER. ALL FOR BTS IN MNL."
      />

      {/* 1 — Latest posts / updates carousel */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
              Latest Updates
            </p>
            <h2 className="font-manila text-3xl uppercase leading-tight sm:text-4xl">
              What&rsquo;s new
            </h2>
            <p className="mt-4 text-lg text-city-ink/70">
              The latest posts and announcements from BTS RE:TURN PH. Swipe or use the arrows.
            </p>
          </div>
          {updatesLoading && !sortedUpdates.length ? (
            <div className="flex gap-5 overflow-hidden pb-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} city className="h-72 w-[85%] shrink-0 sm:w-[360px]" />
              ))}
            </div>
          ) : updatesError && !sortedUpdates.length ? (
            <LoadError city onRetry={reloadUpdates} />
          ) : sortedUpdates.length ? (
            <UpdatesCarousel items={sortedUpdates} />
          ) : (
            <p className="text-lg text-city-ink/60">
              No updates posted yet — check back soon.
            </p>
          )}
        </div>
      </section>

      {/* 2 — Fan projects */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
              Fan Projects
            </p>
            <h2 className="font-manila text-3xl uppercase leading-tight sm:text-4xl">
              Help make our fan projects a reality
            </h2>
            <p className="mt-4 text-lg text-city-ink/70">
              Visit BTS RE:TURN PH&rsquo;s official social media accounts for the latest updates on the fan projects for BTS in the City: Manila to Bulacan.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((p) => {
              // Projects with a page of their own become links.
              const link = projectLink(p.link)
              const Card = link ? (link.kind === 'internal' ? Link : 'a') : 'article'
              const linkProps = !link
                ? {}
                : link.kind === 'internal'
                  ? { to: link.href }
                  : { href: link.href, target: '_blank', rel: 'noreferrer' }
              return (
              <Card
                key={p.name}
                {...linkProps}
                className="flex flex-col rounded-2xl border-2 border-city-ink/10 bg-city-cream shadow-sm transition hover:-translate-y-1 hover:border-city-crimson/40 hover:shadow-md"
              >
                {p.image ? (
                  <img
                    src={driveImage(p.image)}
                    alt={p.name}
                    width="800"
                    height="450"
                    loading="lazy"
                    decoding="async"
                    className="aspect-video w-full rounded-t-2xl border-b-2 border-city-ink/10 object-cover"
                  />
                ) : (
                  <CityImagePlaceholder label={p.name} ratio="aspect-video" className="rounded-b-none border-0 border-b-2" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  {/* The target rides alongside the name — it reads as part of the
                      title, and leaves the foot of the card to the call to action. */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h3 className="font-manila text-xl uppercase leading-tight">{p.name}</h3>
                    {p.target && (
                      <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-city-yellow/30 px-3 py-1 font-manila-body text-xs font-bold uppercase tracking-wide text-city-ink">
                        {/* The dart carries the meaning visually; screen readers get
                            the word, since "🎯" alone announces as "direct hit". */}
                        <span aria-hidden="true">🎯</span>
                        <span className="sr-only">Target:</span>
                        {p.target}
                      </p>
                    )}
                  </div>
                  {p.description && (
                    <p className="mt-2 text-sm text-city-ink/70">{p.description}</p>
                  )}
                  {link && (
                    <span className="mt-auto pt-3 font-manila-body text-xs font-bold uppercase tracking-wide text-city-crimson">
                      {ctaLabel(p.button_text)} →
                    </span>
                  )}
                </div>
              </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* 3 — Projects update: what's still raising + what's already secured */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
              Donations
            </p>
            <h2 className="font-manila text-3xl uppercase leading-tight sm:text-4xl">
              Projects update
            </h2>
            <p className="mt-4 text-lg text-city-ink/70">
              Every peso goes straight into the fan projects above. Here&rsquo;s where we stand.
            </p>
          </div>

          {fundLoading && !ledger.length ? (
            <FundSkeleton />
          ) : fundError && !ledger.length ? (
            <LoadError city onRetry={reloadFund} />
          ) : (
          <div className="rounded-2xl border-2 border-city-ink/10 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="mb-5 font-manila text-2xl uppercase leading-tight sm:text-3xl">
              Fund update
            </h3>

            {/* No bar and no overall goal here — the targets that matter are
                per project, and each tile below carries its own. */}
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="font-manila text-4xl uppercase leading-none text-city-crimson sm:text-5xl">
                {peso(raised)}
              </p>
              <p className="font-manila-body text-sm font-semibold uppercase tracking-wide text-city-ink/60">
                total raised
              </p>
            </div>

            {tiles.length > 0 && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Each target is its own tile so uneven content — a blurb here,
                    two rows of pips there — can't drag the neighbouring
                    column's bar out of line. */}
                {tiles.map((l) =>
                  l.unitised ? <UnitTile key={l.label} l={l} /> : <TargetTile key={l.label} l={l} />,
                )}
              </div>
            )}

            {untargeted.length > 0 && (
              <div className="mt-6 rounded-xl border-2 border-city-ink/10">
                <p className="border-b-2 border-city-ink/10 px-4 py-3 font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-ink/60">
                  Also raised
                </p>
                <ul className="divide-y-2 divide-city-ink/5">
                  {untargeted.map((l) => (
                    <li
                      key={l.label}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <span className="font-manila-body text-sm font-bold uppercase tracking-wide">
                          {l.label}
                        </span>
                        {l.description && (
                          <p className="mt-1 text-xs text-city-ink/70">{l.description}</p>
                        )}
                      </div>
                      <span className="font-manila-body text-sm font-semibold text-city-ink/70">
                        {peso(l.raised)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfkfl1kCglDVr_8gzlrla39G17nzM6R-JrYwwzXvaPTv4TCCA/viewform"
                target="_blank"
                rel="noreferrer"
                className="city-btn-primary"
              >
                Donate Now
              </a>
              <a
                href="https://docs.google.com/spreadsheets/d/1-JEUoai_5I69GtLcQdXnzsIRCeq4c1KqZbmk0Hy-UyE/edit?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="city-btn-outline"
              >
                Fund Tracker
              </a>
            </div>

            {/* Projects marked "complete" in the sheet — secured, so no bar needed. */}
            {secured.length > 0 && (
              <div className="mt-10 border-t-2 border-city-ink/10 pt-8">
                <h3 className="mb-5 font-manila text-2xl uppercase leading-tight sm:text-3xl">
                  Other confirmed fan projects
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {secured.map((l) => (
                    <div
                      key={l.label}
                      className="rounded-xl border-2 border-city-ink/10 bg-city-cream p-4"
                    >
                      <p className="font-manila-body text-sm font-bold uppercase tracking-wide">
                        {l.label}
                      </p>
                      {l.description && (
                        <p className="mt-1 text-xs text-city-ink/70">{l.description}</p>
                      )}
                      {l.numRaised != null && l.numGoal != null && (
                        <p className="mt-3 inline-flex w-fit rounded-full bg-city-yellow/30 px-3 py-1 font-manila-body text-xs font-bold uppercase tracking-wide text-city-ink">
                          {l.numRaised.toLocaleString('en-PH')} of{' '}
                          {l.numGoal.toLocaleString('en-PH')} secured
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </section>

      {/* 4 — BANGTANdahan shop highlight */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <div className="overflow-hidden rounded-3xl border-2 border-city-ink/10 bg-city-cream shadow-sm">
            <div
              className="h-6"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #EC1E50 0 32px, #FBF4DA 32px 64px)',
              }}
              aria-hidden
            />
            <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2">
              <div>
                <p className="mb-3 font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
                  Virtual Store
                </p>
                <h2 className="font-manila text-3xl uppercase leading-tight sm:text-4xl">
                  Tara na sa BANGTANdahan!
                </h2>
                <p className="mt-4 text-lg text-city-ink/70">
                  Our virtual ARMY sari-sari store — from shoe laces to concert bags, all in one place! Every purchase funds the fan projects for BTS in the City:
                  Manila to Bulacan.
                </p>
                <Link to="/bangtandahan" className="city-btn-primary mt-6">
                  Visit BANGTANdahan →
                </Link>
              </div>
              <img
                src="/concert/bangtandahan.png"
                alt="BANGTANdahan sari-sari store"
                width="768"
                height="960"
                loading="lazy"
                decoding="async"
                className="mx-auto w-full max-w-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA — become a brand partner */}
      <section className="bg-city-sky py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-manila text-3xl uppercase text-white sm:text-4xl">
              Want to be a part of this once in a lifetime project?
            </h2>
            <p className="mt-3 text-lg text-city-cream">
              Help us make BTS in the City: Manila to Bulacan a reality. Partner with us and be featured on our official channels, fan projects, and more.
            </p>
            <a
              href="mailto:btsreturnphmarketing@gmail.com"
              className="city-btn mt-6 border-2 border-white text-white hover:bg-white hover:text-city-sky"
            >
              Partner with us →
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
