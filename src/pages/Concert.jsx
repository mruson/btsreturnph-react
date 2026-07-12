import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CityPageHero, CityImagePlaceholder } from '../components/UI'
import { useSheet, driveImage, num } from '../lib/sheet'
import { sheets } from '../data/site'

// ---------------------------------------------------------------------------
// EDIT ME — placeholder content for the BTS in the City: Manila page.
// ---------------------------------------------------------------------------

// Latest posts / updates shown in the carousel.
const updates = [
  { date: 'Jun 28, 2026', title: 'Venue shortlist announced', blurb: 'MOA Arena, SMDC Festival Grounds, and PH Arena are on the table. Final call soon.' },
  { date: 'Jun 20, 2026', title: 'Lamp post banner sponsors open', blurb: 'Fanbases can now co-sponsor a lamp post banner along the concert route.' },
  { date: 'Jun 12, 2026', title: 'Aerial banner test flight', blurb: 'First trial run booked with a licensed operator — footage coming soon.' },
  { date: 'Jun 05, 2026', title: 'Freebie bag design vote', blurb: 'Three designs are up for a community vote. Cast yours before the deadline!' },
]

// Fan projects for BTS in Manila.
const projects = [
  { name: 'Lamp Post Banners', target: '20 – 60 posts', img: '/concert/lamp-post-banner.webp' },
  { name: 'Aerial Banners', target: '2 – 5 flyovers', img: '/concert/aerial-banner.webp' },
  { name: 'Surprise Fan Projects (Team Loob)', target: '10,000 – 50,000', img: '/concert/hand-banners.webp' },
  { name: 'Bus Wraps', target: '2 – 8 buses', img: '/concert/bus-wrap.webp' },
  { name: 'Concert Kits', target: '10,000 – 50,000', img: '/concert/concert-kit.webp' },
  { name: 'Lighting Events', target: 'Manila → Nationwide', img: '/concert/lighting-events.webp' },
  { name: 'Airport Welcome Project', target: '3 – 10 screens', img: '/concert/airport-welcome.webp' },
]

// Fundraising snapshot.
const fund = {
  currency: '₱',
  raised: 185000,
  goal: 500000,
  ledger: [
    { label: 'Lamp Post Banners', raised: 62000, goal: 150000 },
    { label: 'Aerial Banners', raised: 48000, goal: 120000 },
    { label: 'Freebie Bags', raised: 75000, goal: 230000 },
  ],
}

const peso = (n) => `${fund.currency}${n.toLocaleString('en-PH')}`
const pct = (raised, goal) => Math.min(100, Math.round((raised / goal) * 100))

// ---------------------------------------------------------------------------

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
  // Sorted by date, newest first — so order doesn't depend on sheet row position.
  const updateItems = useSheet(sheets.id, sheets.tabs.updates, updates)
  const sortedUpdates = useMemo(
    () =>
      [...updateItems].sort((a, b) => {
        const da = Date.parse(a.date)
        const db = Date.parse(b.date)
        if (isNaN(da) && isNaN(db)) return 0
        if (isNaN(da)) return 1
        if (isNaN(db)) return -1
        return db - da
      }),
    [updateItems],
  )

  // Live fund ledger from the Sheet; overall raised/goal are summed from rows.
  const fundRows = useSheet(sheets.id, sheets.tabs.fund, fund.ledger)
  const ledger = fundRows
    .filter((r) => r.label)
    .map((r) => ({ label: r.label, raised: num(r.raised), goal: num(r.goal) }))
  const raised = ledger.reduce((s, r) => s + r.raised, 0)
  const goal = ledger.reduce((s, r) => s + r.goal, 0)

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
          <UpdatesCarousel items={sortedUpdates} />
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
            {projects.map((p) => (
              <article
                key={p.name}
                className="flex flex-col rounded-2xl border-2 border-city-ink/10 bg-city-cream shadow-sm transition hover:-translate-y-1 hover:border-city-crimson/40 hover:shadow-md"
              >
                {p.img ? (
                  <img
                    src={p.img}
                    alt={p.name}
                    className="aspect-video w-full rounded-t-2xl border-b-2 border-city-ink/10 object-cover"
                  />
                ) : (
                  <CityImagePlaceholder label={p.name} ratio="aspect-video" className="rounded-b-none border-0 border-b-2" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-manila text-xl uppercase leading-tight">{p.name}</h3>
                  <p className="mt-auto inline-flex w-fit rounded-full bg-city-yellow/30 px-3 py-1 font-manila-body text-xs font-bold uppercase tracking-wide text-city-ink">
                    Target: {p.target}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Donations / fund updates */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
              Donations
            </p>
            <h2 className="font-manila text-3xl uppercase leading-tight sm:text-4xl">
              Fund updates
            </h2>
            <p className="mt-4 text-lg text-city-ink/70">
              Every peso goes straight into the fan projects above. Here&rsquo;s where we stand.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-city-ink/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="font-manila text-4xl uppercase leading-none text-city-crimson sm:text-5xl">
                {peso(raised)}
              </p>
              <p className="font-manila-body text-sm font-semibold uppercase tracking-wide text-city-ink/60">
                raised of {peso(goal)} goal
              </p>
            </div>
            <div className="mt-4 h-4 overflow-hidden rounded-full bg-city-ink/10">
              <div
                className="h-full rounded-full bg-city-crimson"
                style={{ width: `${pct(raised, goal)}%` }}
              />
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {ledger.map((l) => (
                <div key={l.label}>
                  <div className="flex items-baseline justify-between">
                    <span className="font-manila-body text-sm font-bold uppercase tracking-wide">
                      {l.label}
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
                  <p className="mt-1 text-xs text-city-ink/60">
                    {peso(l.raised)} / {peso(l.goal)}
                  </p>
                </div>
              ))}
            </div>

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
          </div>
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
                className="mx-auto w-full max-w-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA — become a sponsor */}
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
