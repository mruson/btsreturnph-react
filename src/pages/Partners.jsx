import { CityPageHero, Skeleton, LoadError } from '../components/UI'
import { useSheet, driveImage } from '../lib/sheet'
import { sheets } from '../data/site'

// Live data comes from the "Sponsors" tab: name | tier | logo | link
// (the tab keeps its original name — renaming it in the sheet would break this.)
//
// Deliberately empty. `useSheet` renders this immediately and only swaps in the
// real rows once the fetch resolves, so any placeholder here is visible to every
// visitor for a moment — and dummy "Partner Name" cards read as real partners.
// An empty tier list renders nothing at all, which is honest either way: while
// the sheet loads, and if it's ever unreachable.
const fallback = []

// Tier presentation, biggest first. Class strings are written out in full so
// Tailwind picks them up when it scans this file.
const tiers = [
  {
    key: 'platinum',
    label: 'Platinum Brand Partners',
    accent: 'bg-gradient-to-r from-city-ink to-city-ink/60',
    ring: 'border-city-ink/30',
    grid: 'grid gap-8 sm:grid-cols-2',
    card: 'p-10',
    logo: 'h-32 w-auto max-w-full object-contain sm:h-40',
    name: 'font-manila text-2xl uppercase leading-tight sm:text-3xl',
  },
  {
    key: 'gold',
    label: 'Gold Brand Partners',
    accent: 'bg-city-yellow',
    ring: 'border-city-yellow/50',
    grid: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
    card: 'p-8',
    logo: 'h-20 w-auto max-w-full object-contain sm:h-28',
    name: 'font-manila text-xl uppercase leading-tight',
  },
  {
    key: 'silver',
    label: 'Silver Brand Partners',
    accent: 'bg-city-sky',
    ring: 'border-city-sky/40',
    grid: 'grid grid-cols-2 gap-5 lg:grid-cols-4',
    card: 'p-6',
    logo: 'h-16 w-auto max-w-full object-contain sm:h-20',
    name: 'font-manila text-lg uppercase leading-tight',
  },
  {
    key: 'bronze',
    label: 'Bronze Brand Partners',
    accent: 'bg-city-orange',
    ring: 'border-city-orange/40',
    grid: 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5',
    card: 'p-5',
    logo: 'h-12 w-auto max-w-full object-contain sm:h-14',
    name: 'font-manila text-base uppercase leading-tight',
  },
  {
    key: 'in-kind',
    label: 'In-Kind Brand Partners',
    accent: 'bg-city-crimson',
    ring: 'border-city-crimson/40',
    grid: 'grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6',
    card: 'p-4',
    logo: 'h-10 w-auto max-w-full object-contain sm:h-12',
    name: 'font-manila text-sm uppercase leading-tight',
  },
]

// Anything unrecognised or blank in the TIER column lands here, at the bottom.
const untiered = {
  key: 'partners',
  label: 'Our Partners',
  accent: 'bg-city-ink/50',
  ring: 'border-city-ink/20',
  grid: 'grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6',
  card: 'p-4',
  logo: 'h-10 w-auto max-w-full object-contain sm:h-12',
  name: 'font-manila text-sm uppercase leading-tight',
}

// "IN KIND", "in-kind", "Inkind" → "in-kind"; everything else lowercased.
function tierKey(value) {
  const s = String(value ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-')
  return s === 'inkind' ? 'in-kind' : s
}

function SponsorCard({ sponsor, style }) {
  const clickable = Boolean(sponsor.link)
  const Wrapper = clickable ? 'a' : 'div'

  // Card chrome is off for now — logos sit straight on the cream background,
  // since the logo artwork already carries the sponsor's name. To bring the
  // boxes back, restore this as the Wrapper className:
  //   `flex flex-col items-center rounded-2xl border-2 bg-white text-center shadow-sm transition ${style.ring} ${style.card} ${
  //     clickable ? 'hover:-translate-y-1 hover:border-city-crimson/40 hover:shadow-md' : ''
  //   }`
  return (
    <Wrapper
      {...(clickable
        ? { href: sponsor.link, target: '_blank', rel: 'noreferrer' }
        : {})}
      className={`flex flex-col items-center justify-center text-center transition ${style.card} ${
        clickable ? 'hover:scale-105 hover:opacity-90' : ''
      }`}
    >
      {sponsor.logo ? (
        <img
          src={driveImage(sponsor.logo)}
          alt={sponsor.name}
          loading="lazy"
          decoding="async"
          className={style.logo}
        />
      ) : (
        // No logo in the sheet yet — fall back to the name so the slot isn't blank.
        <h3 className={style.name}>{sponsor.name}</h3>
      )}
      {/* Name hidden — redundant with the logo artwork.
      <h3 className={style.name}>{sponsor.name}</h3> */}
    </Wrapper>
  )
}

// Stand-in for the tier sections while the sheet loads: a heading rule plus a
// row of logo-sized blocks, so the page doesn't jump when the real ones land.
function SponsorsSkeleton() {
  return (
    <div className="space-y-14">
      {[0, 1].map((section) => (
        <div key={section}>
          <div className="mb-6 flex items-center gap-4">
            <Skeleton city className="h-7 w-48" />
            <span className="h-1 flex-1 rounded-full bg-city-ink/10" />
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} city className="h-32 w-full sm:h-40" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Sponsors() {
  const { rows: sponsors, loading, error, reload } = useSheet(
    sheets.id,
    sheets.tabs.sponsors,
    fallback,
  )

  const groups = [...tiers, untiered]
    .map((style) => ({
      style,
      rows: sponsors.filter((s) =>
        style === untiered
          ? !tiers.some((t) => t.key === tierKey(s.tier))
          : tierKey(s.tier) === style.key,
      ),
    }))
    .filter((g) => g.rows.length > 0)

  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      <CityPageHero
        code="Concert Initiative"
        titleLines={['Meet our', 'Brand Partners']}
        subtitle="Thank you to our partners for making our &quot;BTS in the City: Manila to Bulacan&quot; project possible."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page space-y-14">
          {loading && !groups.length && <SponsorsSkeleton />}
          {error && !groups.length && <LoadError city onRetry={reload} />}

          {groups.map(({ style, rows }) => (
            <div key={style.key}>
              <div className="mb-6 flex items-center gap-4">
                <h2 className="font-manila text-xl uppercase tracking-wide sm:text-2xl">
                  {style.label}
                </h2>
                <span className={`h-1 flex-1 rounded-full ${style.accent}`} />
              </div>

              <div className={style.grid}>
                {rows.map((s, i) => (
                  <SponsorCard key={`${s.name}-${i}`} sponsor={s} style={style} />
                ))}
              </div>
            </div>
          ))}

          <p className="pt-4 text-center text-xl text-city-ink/70 sm:text-2xl">
            Want to be one of our brand partners?{' '}
            <a
              href="mailto:btsreturnphmarketing@gmail.com"
              className="font-bold text-city-crimson underline"
            >
              Partner with us →
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
