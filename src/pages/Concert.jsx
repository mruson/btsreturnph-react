import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { CityPageHero, CityImagePlaceholder } from '../components/UI'

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
  { name: 'Lamp Post Banners', target: '20 – 60 posts', blurb: 'Purple takeover of the streets leading to the venue.' },
  { name: 'Aerial Banners', target: '2 – 5 flyovers', blurb: 'Sky-high welcome messages during arrival and concert days.' },
  { name: 'Hand Banners (Team Loob)', target: '10,000 – 50,000', blurb: 'Coordinated fan-project banners for inside the arena.' },
  { name: 'Bus Wrap', target: '2 – 8 buses', blurb: 'Full-wrap BTS buses running key Metro Manila routes.' },
  { name: 'Freebie Bags', target: '10,000 – 50,000', blurb: 'Photocards, stickers, and goodies handed out on the day.' },
  { name: 'Lighting Events', target: 'Manila → Nationwide', blurb: 'Synchronized landmark lighting to welcome BTS home.' },
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
        {items.map((u) => (
          <article
            key={u.title}
            className="w-[85%] shrink-0 snap-start rounded-2xl border-2 border-city-ink/10 bg-white shadow-sm sm:w-[360px]"
          >
            <CityImagePlaceholder label="Post image" ratio="aspect-[4/5]" className="rounded-b-none border-0 border-b-2" />
            <div className="p-5">
              <p className="font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
                {u.date}
              </p>
              <h3 className="mt-2 font-manila text-xl uppercase leading-tight">{u.title}</h3>
              <p className="mt-2 text-sm text-city-ink/70">{u.blurb}</p>
            </div>
          </article>
        ))}
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
  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      <CityPageHero
        code="Concert Initiative · RE:LIVE"
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
              The latest posts and announcements for BTS in Manila. Swipe or use the arrows.
            </p>
          </div>
          <UpdatesCarousel items={updates} />
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
              Planned for MOA Arena, SMDC Festival Grounds, and PH Arena. No final venue yet —
              more projects to be added later.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <article
                key={p.name}
                className="flex flex-col rounded-2xl border-2 border-city-ink/10 bg-city-cream shadow-sm transition hover:-translate-y-1 hover:border-city-crimson/40 hover:shadow-md"
              >
                <CityImagePlaceholder label={p.name} ratio="aspect-video" className="rounded-b-none border-0 border-b-2" />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-manila text-xl uppercase leading-tight">{p.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-city-ink/70">{p.blurb}</p>
                  <p className="mt-4 inline-flex w-fit rounded-full bg-city-yellow/30 px-3 py-1 font-manila-body text-xs font-bold uppercase tracking-wide text-city-ink">
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
                {peso(fund.raised)}
              </p>
              <p className="font-manila-body text-sm font-semibold uppercase tracking-wide text-city-ink/60">
                raised of {peso(fund.goal)} goal
              </p>
            </div>
            <div className="mt-4 h-4 overflow-hidden rounded-full bg-city-ink/10">
              <div
                className="h-full rounded-full bg-city-crimson"
                style={{ width: `${pct(fund.raised, fund.goal)}%` }}
              />
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {fund.ledger.map((l) => (
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
              <Link to="/donations" className="city-btn-primary">
                Donate Now
              </Link>
              <Link to="/donors" className="city-btn-outline">
                See Donors
              </Link>
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
                  Our virtual ARMY sari-sari store — photocards, freebies, and paninda
                  tingi-tingi. Every purchase funds the fan projects for BTS in the City:
                  Manila to Bulacan.
                </p>
                <Link to="/bangtandahan" className="city-btn-primary mt-6">
                  Visit BANGTANdahan →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <CityImagePlaceholder label="Paninda" ratio="aspect-square" />
                <CityImagePlaceholder label="Photocards" ratio="aspect-square" className="mt-6" />
                <CityImagePlaceholder label="Freebies" ratio="aspect-square" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA — run a project */}
      <section className="bg-city-sky py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-manila text-3xl uppercase text-white sm:text-4xl">
              Want to run a project?
            </h2>
            <p className="mt-3 text-lg text-city-cream">
              Communities and fanbases across the country are welcome to lead. Connect with
              other ARMYs organizing for BTS in Manila.
            </p>
            <Link
              to="/communities"
              className="city-btn mt-6 border-2 border-white text-white hover:bg-white hover:text-city-sky"
            >
              See Communities →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
