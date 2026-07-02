import { CityPageHero, CityImagePlaceholder } from '../components/UI'

// ---------------------------------------------------------------------------
// EDIT ME — BANGTANdahan products (the virtual sari-sari store).
// ---------------------------------------------------------------------------
const products = [
  { name: 'ARMY Bomb Keychain', price: '₱180', category: 'Paninda', tag: '' },
  { name: 'Bulacan Tour Photocard Set', price: '₱250', category: 'Photocards', tag: 'New' },
  { name: 'Sari-Sari Sticker Sachet', price: '₱90', category: 'Tingi', tag: '' },
  { name: 'RE:TURN Tote Bag', price: '₱350', category: 'Paninda', tag: '' },
  { name: 'Purple Ocean Hand Banner', price: '₱200', category: 'Fan Project', tag: '' },
  { name: 'Manila → Bulacan Fan Fan', price: '₱150', category: 'Paninda', tag: 'Hot' },
  { name: 'Lightstick Ring Set', price: '₱120', category: 'Tingi', tag: '' },
  { name: 'BANGTANdahan Freebie Bag', price: '₱400', category: 'Bundle', tag: 'Limited' },
]

// Little candy-colored awning stripe, sari-sari store style.
const awning = {
  backgroundImage:
    'repeating-linear-gradient(90deg, #EC1E50 0 32px, #FBF4DA 32px 64px)',
}

export default function Bangtandahan() {
  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      <CityPageHero
        code="Concert Initiative · Virtual Store"
        titleLines={['BANGTANdahan']}
        subtitle="Your friendly neighborhood ARMY sari-sari store. Bili na — every purchase funds BTS in the City: Manila to Bulacan!"
        uppercase={false}
      />

      {/* Striped awning divider */}
      <div className="h-6" style={awning} aria-hidden />

      <section className="py-14 sm:py-20">
        <div className="container-page">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
              Tindahan
            </p>
            <h2 className="font-manila text-3xl uppercase leading-tight sm:text-4xl">
              Bili na sa BANGTANdahan!
            </h2>
            <p className="mt-4 text-lg text-city-ink/70">
              A virtual sari-sari store run by PH ARMYs. Grab your paninda tingi-tingi —
              100% of proceeds go to the fan projects for the concert.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <article
                key={p.name}
                className="group flex flex-col overflow-hidden rounded-2xl border-2 border-city-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:border-city-crimson/40 hover:shadow-md"
              >
                <div className="relative">
                  <CityImagePlaceholder
                    label="Product photo"
                    ratio="aspect-square"
                    className="rounded-none border-0 border-b-2"
                  />
                  {p.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-city-sky px-3 py-1 font-manila-body text-xs font-bold uppercase tracking-wide text-white">
                      {p.tag}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-manila-body text-[11px] font-bold uppercase tracking-[0.2em] text-city-crimson">
                    {p.category}
                  </p>
                  <h3 className="mt-1 font-manila text-lg uppercase leading-tight">{p.name}</h3>
                  <div className="mt-3 flex flex-1 items-end justify-between gap-2">
                    {/* Sari-sari price tag */}
                    <span className="inline-flex items-center rounded-md bg-city-yellow px-3 py-1 font-manila text-lg leading-none text-city-ink">
                      {p.price}
                    </span>
                    <button
                      type="button"
                      className="rounded-md bg-city-crimson px-4 py-2 font-manila-body text-xs font-bold uppercase tracking-wide text-white transition hover:bg-city-crimson/90"
                    >
                      Bili
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-city-ink/50">
            Placeholder products — edit the list in <code>src/pages/Bangtandahan.jsx</code>,
            or wire &ldquo;Bili&rdquo; to your real store (Shopify, a Google Form, etc.).
          </p>
        </div>
      </section>

      {/* Striped awning divider */}
      <div className="h-6" style={awning} aria-hidden />
    </div>
  )
}
