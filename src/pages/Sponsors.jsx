import { CityPageHero, CityImagePlaceholder } from '../components/UI'
import { useSheet, driveImage } from '../lib/sheet'
import { sheets } from '../data/site'

// Fallback shown before the Sheet loads / if it's unreachable.
// Live data comes from the "Sponsors" tab: name | handle | logo | link
const fallback = [
  { name: 'Sponsor Name', handle: '@handle', logo: '', link: '' },
  { name: 'Sponsor Name', handle: '@handle', logo: '', link: '' },
  { name: 'Sponsor Name', handle: '@handle', logo: '', link: '' },
  { name: 'Sponsor Name', handle: '@handle', logo: '', link: '' },
]

export default function Sponsors() {
  const sponsors = useSheet(sheets.id, sheets.tabs.sponsors, fallback)

  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      <CityPageHero
        code="Concert Initiative"
        titleLines={['Meet our', 'Sponsors']}
        subtitle="Thank you to our partners for making our &quot;BTS in the City: Manila to Bulacan&quot; project possible."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sponsors.map((s, i) => {
              const clickable = Boolean(s.link)
              const Wrapper = clickable ? 'a' : 'div'
              return (
                <Wrapper
                  key={`${s.name}-${i}`}
                  {...(clickable ? { href: s.link, target: '_blank', rel: 'noreferrer' } : {})}
                  className={`flex flex-col items-center rounded-2xl border-2 border-city-ink/10 bg-white p-6 text-center shadow-sm transition ${
                    clickable ? 'hover:-translate-y-1 hover:border-city-crimson/40 hover:shadow-md' : ''
                  }`}
                >
                  {s.logo ? (
                    <img src={driveImage(s.logo)} alt={s.name} className="mb-4 h-24 w-auto max-w-full object-contain" />
                  ) : (
                    <CityImagePlaceholder label="Logo" ratio="aspect-square" className="mb-4 w-28" />
                  )}
                  <h3 className="font-manila text-lg uppercase leading-tight">{s.name}</h3>
                  {s.handle && <p className="mt-1 text-sm text-city-ink/60">{s.handle}</p>}
                </Wrapper>
              )
            })}
          </div>

          <p className="mt-10 text-center text-city-ink/70">
            Want to see your brand here?{' '}
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
