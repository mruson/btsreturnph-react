import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPH } from '../lib/datetime'
import { statusOf, useRaffles } from '../lib/raffles'
import {
  Bar,
  CampaignHero,
  RaffleCard,
  RaffleLoadError,
  SectionHead,
  SponsorCredit,
  panel,
} from '../components/RaffleUI'
import Countdown from '../components/Countdown'
import { CampaignTheme, useCampaignData } from '../lib/campaignTheme'

// ============================================================================
// /raffle — the index for the primary sponsored campaign.
// ============================================================================
// One card per giveaway, grouped by what you can do about it: enter now, wait,
// or read the result. Each links to /raffle/:slug, which is the page people
// actually share — a link to a specific member's giveaway keeps meaning after
// that giveaway closes, where a link to this index would quietly start showing
// something else.
//
// Every raffle appears here. There's no "featured one raffle and hide the rest"
// logic any more, which was the old page's most fragile part: a closed raffle
// awaiting its draw used to be able to bury a raffle that was open.

// A live giveaway gets a wide card with its countdown rather than a slot in the
// grid — it's the one thing on this page anybody can act on right now.
function FeaturedRaffle({ raffle }) {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className="grid gap-0 sm:grid-cols-[minmax(0,15rem)_1fr]">
        {raffle.image ? (
          <img
            src={raffle.image}
            alt=""
            loading="lazy"
            className="h-full w-full border-b border-[color:var(--rf-border)] object-cover sm:border-b-0 sm:border-r"
          />
        ) : (
          <div className="flex min-h-[10rem] items-center justify-center border-b border-[color:var(--rf-border)] bg-[var(--rf-panel)] sm:border-b-0 sm:border-r">
            <span className="font-[family-name:var(--rf-font-display)] text-xl uppercase text-[color:var(--rf-faint)]">Open now</span>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <span className="inline-block rounded-full bg-[var(--rf-accent)] px-4 py-1.5 font-[family-name:var(--rf-font-body)] text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--rf-accent-text)]">
            Raffle open
          </span>
          <h3 className="mt-4 font-[family-name:var(--rf-font-display)] text-3xl uppercase leading-none text-[color:var(--rf-text)] sm:text-4xl">
            {raffle.title}
          </h3>
          {raffle.blurb && <p className="mt-3 text-[color:var(--rf-muted)]">{raffle.blurb}</p>}
          <SponsorCredit raffle={raffle} compact />

          {raffle.closes && (
            <Countdown
              to={raffle.closes.getTime()}
              label="Raffle closes in"
              className="mt-6"
            />
          )}

          <Link
            to={`/raffle/${raffle.slug}`}
            className="mt-6 inline-block rounded-md bg-[var(--rf-accent)] px-6 py-3 font-[family-name:var(--rf-font-body)] text-sm font-bold uppercase tracking-wide text-[color:var(--rf-accent-text)] transition hover:opacity-90"
          >
            Sali na — enter this raffle →
          </Link>
        </div>
      </div>
    </div>
  )
}

function IndexSkeleton() {
  return (
    <div className="space-y-6">
      <Bar className="h-48 w-full" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Bar className="h-64 w-full" />
        <Bar className="h-64 w-full" />
        <Bar className="h-64 w-full" />
      </div>
    </div>
  )
}

export default function Raffles() {
  const { raffles, loading, error, reload } = useRaffles()
  // No slug: the campaign flagged `is_primary` is the one /raffle lands on.
  const campaign = useCampaignData()

  // Bumped when the "opens in" countdown hits zero, which re-runs the grouping
  // below so the raffle moves itself from Opening soon into Ongoing — nobody has
  // to reload the page at the moment a giveaway goes live.
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((t) => t + 1), [])

  const { open, upcoming, past } = useMemo(() => {
    const now = Date.now()
    const all = raffles.filter((r) => r.title && r.slug)
    return {
      open: all.filter((r) => statusOf(r, now) === 'open'),
      upcoming: all
        .filter((r) => statusOf(r, now) === 'upcoming')
        .sort((a, b) => (a.opens?.getTime() || 0) - (b.opens?.getTime() || 0)),
      // "closed" (entries done, winners pending) sits here too — the card says
      // so, and it's honest: you can't enter it any more.
      past: all
        .filter((r) => ['closed', 'ended'].includes(statusOf(r, now)))
        .sort((a, b) => (b.closes?.getTime() || 0) - (a.closes?.getTime() || 0)),
    }
    // `tick` is the whole point of this dependency — it re-reads the clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raffles, tick])

  // Everything you can't enter right now, in one list with its status attached
  // so the cards can label themselves. Soonest-opening first, then most recently
  // closed — `upcoming` and `past` are already sorted that way individually.
  const rest = useMemo(() => {
    const now = Date.now()
    return [
      ...upcoming.map((raffle) => ({ raffle, status: 'upcoming' })),
      // The real status, so a drawn raffle reads "Winners announced" rather than
      // sharing the "Raffle closed" chip with one that's still awaiting its draw.
      ...past.map((raffle) => ({ raffle, status: statusOf(raffle, now) })),
    ]
  }, [upcoming, past])

  const nothingAtAll = !loading && !error && !open.length && !upcoming.length && !past.length

  return (
    <CampaignTheme campaign={campaign}>
      <CampaignHero />

      <section className="py-14 sm:py-20">
        <div className="container-page space-y-16">
          {loading && !raffles.length && <IndexSkeleton />}
          {error && !raffles.length && <RaffleLoadError onRetry={reload} />}

          {nothingAtAll && (
            <div className="rounded-2xl border border-dashed border-[color:var(--rf-border-strong)] bg-[var(--rf-panel)] px-6 py-16 text-center">
              <p className="font-[family-name:var(--rf-font-display)] text-2xl uppercase leading-none text-[color:var(--rf-text)]">
                Coming soon
              </p>
              <p className="mx-auto mt-3 max-w-md text-[color:var(--rf-soft)]">
                Seven giveaways, one for each member&rsquo;s birthday. Follow us on socials
                so you don&rsquo;t miss the first one.
              </p>
            </div>
          )}

          {/* --- Open now --- */}
          {(open.length > 0 || (!nothingAtAll && !loading && !error)) && (
            <div>
              <SectionHead
                eyebrow="Enter now"
                title="Ongoing raffles"
                count={open.length || null}
              />
              <div className="mt-8 space-y-6">
                {open.length > 0 ? (
                  open.map((r) => <FeaturedRaffle key={r.slug} raffle={r} />)
                ) : (
                  <div className="rounded-2xl border border-dashed border-[color:var(--rf-border-strong)] bg-[var(--rf-panel)] px-6 py-12 text-center">
                    <p className="font-[family-name:var(--rf-font-display)] text-xl uppercase leading-none text-[color:var(--rf-text)]">
                      Come back soon
                    </p>
                    <p className="mx-auto mt-3 max-w-md text-sm text-[color:var(--rf-soft)]">
                      {upcoming.length
                        ? 'The next giveaway is already lined up.'
                        : 'Follow us on socials so you don’t miss the next one.'}
                    </p>

                    {/* `upcoming` is sorted soonest-first, and a raffle only counts
                        as upcoming when it has an opening time — so [0].opens is
                        always there to count down to. */}
                    {upcoming.length > 0 && (
                      <div className="mt-7 border-t border-[color:var(--rf-border)] pt-7">
                        <Countdown
                          to={upcoming[0].opens.getTime()}
                          label={`${upcoming[0].title} opens in`}
                          onComplete={refresh}
                          className="flex flex-col items-center"
                        />
                        <Link
                          to={`/raffle/${upcoming[0].slug}`}
                          className="mt-5 inline-block font-[family-name:var(--rf-font-body)] text-xs font-bold uppercase tracking-wide text-[color:var(--rf-soft)] underline-offset-4 transition hover:text-[color:var(--rf-text)] hover:underline"
                        >
                          Check the mechanics so you&rsquo;re ready →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- Everything else: one grid, status carried by the cards ---
              Upcoming and past used to be separate sections, which duplicated
              what each card already says twice (the chip, and the date line) and
              left a half-empty row whenever the series was lopsided — all
              upcoming at the start, all past at the end. One grid always fills
              its rows. Upcoming sorts first, so anything you can still prepare
              for comes before history. */}
          {rest.length > 0 && (
            <div>
              <SectionHead title="All raffles" count={rest.length} />
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map(({ raffle, status }) => (
                  <RaffleCard
                    key={raffle.slug}
                    raffle={raffle}
                    status={status}
                    formatDate={(x) =>
                      status === 'upcoming'
                        ? x.opens
                          ? `Opens ${formatPH(x.opens)}`
                          : 'Opening date to be announced'
                        : x.winners.length
                          ? `Drawn · closed ${formatPH(x.closes, { withTime: false })}`
                          : 'Closed · winners not yet posted'
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </CampaignTheme>
  )
}
