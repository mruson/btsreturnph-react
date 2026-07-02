import { CityPageHero, CityImagePlaceholder } from '../components/UI'

// Add real communities/fanbases here (name + link).
const communities = [
  { name: 'Luzon ARMYs', region: 'Luzon', href: '#' },
  { name: 'Visayas ARMYs', region: 'Visayas', href: '#' },
  { name: 'Mindanao ARMYs', region: 'Mindanao', href: '#' },
  { name: 'Metro Manila ARMYs', region: 'NCR', href: '#' },
]

export default function Communities() {
  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      <CityPageHero
        code="Concert Initiative"
        titleLines={['Communities']}
        subtitle="ARMY fanbases and communities across the Philippines organizing together."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {communities.map((c) => (
              <a
                key={c.name}
                href={c.href}
                className="block rounded-2xl border-2 border-city-ink/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-city-crimson/40 hover:shadow-md"
                target="_blank"
                rel="noreferrer"
              >
                <CityImagePlaceholder label="Community logo" ratio="aspect-square" className="mb-4" />
                <h3 className="font-manila text-lg uppercase leading-tight">{c.name}</h3>
                <p className="text-sm text-city-ink/60">{c.region}</p>
              </a>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-city-ink/50">
            Update the community list in <code>src/pages/Communities.jsx</code> with real
            names, regions, and links.
          </p>
        </div>
      </section>
    </div>
  )
}
