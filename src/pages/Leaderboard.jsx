import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CityPageHero, Skeleton, LoadError } from '../components/UI'
import { useLiveSheet } from '../lib/sheet'
import { liveSettings, rankDonors } from '../lib/live'
import { sheets } from '../data/site'

// ============================================================================
// /leaderboard — top donors and the running total for the current live.
// ============================================================================
// Everything comes from two tabs of the site Google Sheet (see data/site.js):
//
//   Live Leaderboard — alias | amount | bank, one row per donation
//   Live Settings    — show | title | goal, a single row
//
// `show` is the switch. While it's ticked the page reads as live and /concert
// links here; unticked, the link disappears but this page stays up as the final
// results, so anyone holding the URL still sees how it ended.

// How many donors make the board: three on the podium, the rest in the list.
const BOARD_SIZE = 20

const peso = (n) => `₱${n.toLocaleString('en-PH')}`

function BankTag({ bank }) {
  if (!bank) return null
  return (
    <span className="inline-block rounded-full bg-city-ink/10 px-2 py-0.5 font-manila-body text-[10px] font-bold uppercase tracking-wide text-city-ink/60">
      {bank}
    </span>
  )
}

// First place's crown. Inline SVG like the site's other icons, so it's drawn in
// the Manila palette instead of whatever each phone's emoji font looks like.
function Crown({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`fill-city-yellow stroke-city-ink ${className}`}
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-1.8 9H4.8L3 8z" />
      <path d="M5 20.25h14" />
    </svg>
  )
}

// Written out in full so Tailwind's scanner finds every class. `order` puts
// first place in the middle while the DOM stays 1-2-3 for screen readers.
const STEPS = [
  { place: 1, order: 'order-2', height: 'h-32 sm:h-44', block: 'bg-city-yellow text-city-ink' },
  { place: 2, order: 'order-1', height: 'h-24 sm:h-32', block: 'bg-city-sky text-white' },
  { place: 3, order: 'order-3', height: 'h-16 sm:h-24', block: 'bg-city-orange text-white' },
]

function Podium({ donors }) {
  return (
    <ol className="grid grid-cols-3 items-end gap-2 sm:gap-4">
      {STEPS.map((step, i) => {
        const donor = donors[i]
        return (
          <li key={step.place} className={`flex min-w-0 flex-col items-center text-center ${step.order}`}>
            {donor ? (
              <>
                {step.place === 1 && <Crown className="mb-1 h-7 w-7 sm:h-9 sm:w-9" />}
                <p className="w-full break-words font-manila text-sm uppercase leading-tight sm:text-xl">
                  {donor.alias}
                </p>
                <p className="mt-1 font-manila text-base leading-none text-city-crimson sm:text-2xl">
                  {peso(donor.amount)}
                </p>
                <div className="mt-1.5 min-h-[1.25rem]">
                  <BankTag bank={donor.bank} />
                </div>
              </>
            ) : (
              // Fewer than three donors so far — the step stays, as an invitation.
              <p className="font-manila-body text-[11px] font-bold uppercase tracking-wide text-city-ink/40 sm:text-xs">
                Open spot
              </p>
            )}
            <div
              className={`mt-2 flex w-full items-start justify-center rounded-t-xl pt-2 font-manila text-3xl leading-none sm:pt-3 sm:text-5xl ${step.height} ${
                donor ? step.block : 'border-2 border-b-0 border-dashed border-city-ink/20 text-city-ink/25'
              }`}
            >
              <span className="sr-only">Place </span>
              {step.place}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function BoardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton city className="h-44 w-full rounded-2xl" />
      <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
        <Skeleton city className="h-32 w-full" />
        <Skeleton city className="h-44 w-full" />
        <Skeleton city className="h-24 w-full" />
      </div>
      <Skeleton city className="h-64 w-full rounded-2xl" />
    </div>
  )
}

export default function Leaderboard() {
  const board = useLiveSheet(sheets.id, sheets.tabs.leaderboard)
  const config = useLiveSheet(sheets.id, sheets.tabs.liveSettings)

  const settings = useMemo(() => liveSettings(config.rows), [config.rows])
  const { donors, total } = useMemo(() => rankDonors(board.rows), [board.rows])

  const top = donors.slice(0, 3)
  const rest = donors.slice(3, BOARD_SIZE)

  // Width is capped so the bar can't spill out of its track; the label isn't,
  // because "112%" is worth bragging about.
  const percent = settings.goal > 0 ? Math.round((total / settings.goal) * 100) : 0
  const reached = settings.goal > 0 && total >= settings.goal

  const updated = board.updatedAt
    ? new Date(board.updatedAt).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
    : ''

  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      <CityPageHero
        code="Concert Initiative · Live Fundraiser"
        titleLines={['Live Donors', 'Leaderboard']}
        subtitle="Every peso goes straight into the fan projects for BTS in the City: Manila to Bulacan."
      />

      <section className="py-12 sm:py-16">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            {board.loading && !donors.length ? (
              <BoardSkeleton />
            ) : board.error && !donors.length ? (
              <LoadError city onRetry={board.reload} />
            ) : (
              <div className="space-y-10">
                {/* Goal + running total */}
                <div className="rounded-2xl border-2 border-city-ink/10 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    {settings.show ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-city-crimson px-3 py-1 font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-white">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-white motion-reduce:animate-none" />
                        Live now
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-city-ink/10 px-3 py-1 font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-ink/60">
                        Final results
                      </span>
                    )}
                    {settings.show && updated && (
                      <p className="font-manila-body text-xs font-semibold text-city-ink/50">
                        Updated {updated} · refreshes on its own
                      </p>
                    )}
                  </div>

                  <h2 className="mt-4 font-manila text-2xl uppercase leading-tight sm:text-3xl">
                    {settings.title || 'Live fundraiser'}
                  </h2>

                  <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <p className="font-manila text-4xl uppercase leading-none text-city-crimson sm:text-5xl">
                      {peso(total)}
                    </p>
                    <p className="font-manila-body text-sm font-semibold uppercase tracking-wide text-city-ink/60">
                      {settings.goal > 0 ? `raised of ${peso(settings.goal)} goal` : 'raised so far'}
                    </p>
                  </div>

                  {settings.goal > 0 && (
                    <>
                      <div
                        className="mt-5 h-4 overflow-hidden rounded-full bg-city-ink/10"
                        role="progressbar"
                        aria-label="Progress toward the goal"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(100, percent)}
                      >
                        <div
                          className="h-full rounded-full bg-city-crimson transition-[width] duration-700"
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                      <p className="mt-2 font-manila-body text-xs font-bold uppercase tracking-wide text-city-ink/60">
                        {reached ? `Goal reached — ${percent}% 🎉` : `${percent}% of the goal`}
                      </p>
                    </>
                  )}
                </div>

                {donors.length === 0 ? (
                  <p className="rounded-2xl border-2 border-dashed border-city-ink/15 bg-white p-8 text-center text-lg text-city-ink/60">
                    {settings.show
                      ? 'No donations on the board yet — be the first!'
                      : 'No live fundraiser results to show yet — check back soon.'}
                  </p>
                ) : (
                  <>
                    {/* Top 3 */}
                    <div>
                      <p className="mb-6 text-center font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
                        Top donors
                      </p>
                      <Podium donors={top} />
                    </div>

                    {/* 4 → 20 */}
                    {rest.length > 0 && (
                      <ol
                        start={4}
                        className="divide-y-2 divide-city-ink/5 overflow-hidden rounded-2xl border-2 border-city-ink/10 bg-white shadow-sm"
                      >
                        {rest.map((d, i) => (
                          <li key={`${d.alias}-${i}`} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                            <span className="w-8 shrink-0 font-manila text-xl leading-none text-city-ink/40">
                              {i + 4}
                            </span>
                            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="break-words font-manila-body text-sm font-bold uppercase tracking-wide">
                                {d.alias}
                              </span>
                              <BankTag bank={d.bank} />
                            </span>
                            <span className="shrink-0 font-manila text-lg leading-none text-city-crimson">
                              {peso(d.amount)}
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}

                    {donors.length > BOARD_SIZE && (
                      <p className="text-center text-sm text-city-ink/60">
                        Showing the top {BOARD_SIZE} of {donors.length.toLocaleString('en-PH')} donors.
                        Every donation counts toward the total.
                      </p>
                    )}
                  </>
                )}

                <div className="text-center">
                  <Link to="/concert" className="city-btn-outline">
                    ← BTS in Manila
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
