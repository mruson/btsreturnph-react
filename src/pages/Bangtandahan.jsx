import { useMemo, useState } from 'react'
import { CityPageHero, CityImagePlaceholder } from '../components/UI'
import { useSheet, driveImage, num } from '../lib/sheet'
import { sheets } from '../data/site'

const SORTS = [
  { value: 'new', label: 'Bagong Dating' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'az', label: 'Name: A–Z' },
  { value: 'za', label: 'Name: Z–A' },
]

function sortProducts(list, sort) {
  const arr = [...list]
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => num(a.price) - num(b.price))
    case 'price-desc':
      return arr.sort((a, b) => num(b.price) - num(a.price))
    case 'az':
      return arr.sort((a, b) => String(a.name).localeCompare(String(b.name)))
    case 'za':
      return arr.sort((a, b) => String(b.name).localeCompare(String(a.name)))
    case 'new': // newest first — assumes new rows are added at the bottom of the sheet
      return arr.reverse()
    default:
      return arr
  }
}

// Show a price with a peso sign. If the cell already has a currency symbol
// (₱ or $), leave it; otherwise treat it as a number and format it.
const showPrice = (v) => {
  const s = String(v ?? '').trim()
  if (!s) return ''
  return /^[₱$]/.test(s) ? s : `₱${num(s).toLocaleString('en-PH')}`
}

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

// The shared order form used for every product.
const biliForm =
  'https://docs.google.com/forms/d/e/1FAIpQLScgH64_aiQvRzJH9dEsaaxr-ug4YDFNe-lDq62LwUj0W9ZzPw/viewform'

export default function Bangtandahan() {
  // Live products from the Google Sheet, falling back to `products`.
  const items = useSheet(sheets.id, sheets.tabs.products, products)
  const [sort, setSort] = useState('new')
  const sorted = useMemo(() => sortProducts(items, sort), [items, sort])

  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      <CityPageHero
        code="Concert Initiative · Virtual Store"
        titleLines={['BANGTANdahan']}
        subtitle="Your all-in-one ARMY sari-sari store. Bili na — every purchase funds BTS in the City: Manila to Bulacan!"
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
            <a href={biliForm} target="_blank" rel="noreferrer" className="city-btn-primary mt-6">
              Bili na! →
            </a>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
            <label
              htmlFor="sort"
              className="font-manila-body text-sm font-bold uppercase tracking-wide text-city-ink/60"
            >
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-md border-2 border-city-ink/15 bg-white px-3 py-2 font-manila-body text-sm font-semibold text-city-ink focus:border-city-crimson focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sorted.map((p) => (
              <article
                key={p.name}
                className="group flex flex-col overflow-hidden rounded-2xl border-2 border-city-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:border-city-crimson/40 hover:shadow-md"
              >
                <div className="relative">
                  {p.image ? (
                    <img
                      src={driveImage(p.image)}
                      alt={p.name}
                      className="aspect-square w-full border-b-2 border-city-ink/10 object-cover"
                    />
                  ) : (
                    <CityImagePlaceholder
                      label="Product photo"
                      ratio="aspect-square"
                      className="rounded-none border-0 border-b-2"
                    />
                  )}
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
                  <div className="mt-3 flex flex-1 items-end">
                    {/* Sari-sari price tag */}
                    <span className="inline-flex items-center rounded-md bg-city-yellow px-3 py-1 font-manila text-lg leading-none text-city-ink">
                      {showPrice(p.price)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Striped awning divider */}
      <div className="h-6" style={awning} aria-hidden />
    </div>
  )
}
