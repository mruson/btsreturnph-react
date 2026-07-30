import { useEffect, useMemo, useState } from 'react'
import { CityPageHero, CityImagePlaceholder, Skeleton, LoadError } from '../components/UI'
import { useSheet, driveImage, num } from '../lib/sheet'
import { sheets } from '../data/site'

const SORTS = [
  { value: 'new', label: 'Bagong Dating' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'az', label: 'Name: A–Z' },
  { value: 'za', label: 'Name: Z–A' },
]

// A product counts as on sale only when the sheet says on_sale is TRUE *and*
// sale_price is filled in. Either one on its own shows no SALE indicator.
function isOnSale(p) {
  const flag = String(p.on_sale ?? '').trim().toLowerCase()
  const on = flag === 'true' || flag === 'yes' || flag === '1'
  return on && String(p.sale_price ?? '').trim() !== ''
}

// What the shopper actually pays — the sale price when on sale, else the price.
const effectivePrice = (p) => num(isOnSale(p) ? p.sale_price : p.price)

function sortProducts(list, sort) {
  const arr = [...list]
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => effectivePrice(a) - effectivePrice(b))
    case 'price-desc':
      return arr.sort((a, b) => effectivePrice(b) - effectivePrice(a))
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
// Live from the "BANGTANdahan" tab: name | price | category | tag | image
// (plus optional on_sale + sale_price, which together add a SALE badge).
//
// Deliberately empty. `useSheet` renders this fallback immediately and only
// swaps in real rows once the fetch resolves, so placeholder items would show
// every visitor products and peso prices that don't exist.
const products = []

// Little candy-colored awning stripe, sari-sari store style.
const awning = {
  backgroundImage:
    'repeating-linear-gradient(90deg, #EC1E50 0 32px, #FBF4DA 32px 64px)',
}

// The shared order form used for every product.
const biliForm =
  'https://docs.google.com/forms/d/e/1FAIpQLScgH64_aiQvRzJH9dEsaaxr-ug4YDFNe-lDq62LwUj0W9ZzPw/viewform'

// Full-screen image viewer with zoom + pan. Click a product photo to open it.
function ImageLightbox({ src, alt, onClose }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useState(() => ({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 }))[0]

  const clampZoom = (z) => Math.min(5, Math.max(1, z))

  // Reset pan whenever we return to fit.
  const setZoomSafe = (next) => {
    const z = clampZoom(next)
    setZoom(z)
    if (z === 1) setPan({ x: 0, y: 0 })
  }

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === '+' || e.key === '=') setZoomSafe(zoom + 0.5)
      if (e.key === '-') setZoomSafe(zoom - 0.5)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [zoom, onClose])

  const onWheel = (e) => {
    e.preventDefault()
    setZoomSafe(zoom + (e.deltaY < 0 ? 0.3 : -0.3))
  }

  const onPointerDown = (e) => {
    if (zoom <= 1) return
    drag.active = true
    drag.startX = e.clientX
    drag.startY = e.clientY
    drag.baseX = pan.x
    drag.baseY = pan.y
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.active) return
    setPan({ x: drag.baseX + (e.clientX - drag.startX), y: drag.baseY + (e.clientY - drag.startY) })
  }
  const onPointerUp = () => {
    drag.active = false
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-city-ink/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      {/* Controls */}
      <div
        className="absolute right-4 top-4 z-10 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setZoomSafe(zoom - 0.5)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 font-manila text-2xl text-city-ink shadow transition hover:bg-white"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setZoomSafe(zoom + 0.5)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 font-manila text-2xl text-city-ink shadow transition hover:bg-white"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 font-manila text-xl text-city-ink shadow transition hover:bg-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={() => setZoomSafe(zoom > 1 ? 1 : 2)}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        draggable={false}
        className="max-h-[85vh] max-w-[90vw] select-none rounded-lg object-contain shadow-2xl"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          cursor: zoom > 1 ? (drag.active ? 'grabbing' : 'grab') : 'zoom-in',
          transition: drag.active ? 'none' : 'transform 0.15s ease-out',
          touchAction: 'none',
        }}
      />

      <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 font-manila-body text-xs text-white/70">
        Scroll or use +/− to zoom · double-click to toggle · drag to pan
      </p>
    </div>
  )
}

export default function Bangtandahan() {
  // Live products from the Google Sheet, falling back to `products`.
  const { rows: items, loading, error, reload } = useSheet(
    sheets.id,
    sheets.tabs.products,
    products,
  )
  const [sort, setSort] = useState('new')
  const sorted = useMemo(() => sortProducts(items, sort), [items, sort])
  const [lightbox, setLightbox] = useState(null) // { src, alt } of the open image

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
Our virtual ARMY sari-sari store — from shoe laces to concert bags, all in one place!
            Every purchase funds the fan projects for BTS in the City: Manila to Bulacan.
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

          {loading && !sorted.length && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border-2 border-city-ink/10 bg-white"
                >
                  <Skeleton city className="aspect-square w-full rounded-none" />
                  <div className="p-4">
                    <Skeleton city className="h-4 w-3/4" />
                    <Skeleton city className="mt-2 h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !sorted.length && <LoadError city onRetry={reload} />}

          {!loading && !error && !sorted.length && (
            <p className="py-8 text-center text-lg text-city-ink/60">
              Wala pang paninda — check back soon!
            </p>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sorted.map((p) => {
              const sale = isOnSale(p)
              return (
                <article
                  key={p.name}
                  className="group flex flex-col overflow-hidden rounded-2xl border-2 border-city-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:border-city-crimson/40 hover:shadow-md"
                >
                  <div className="relative">
                    {p.image ? (
                      <button
                        type="button"
                        onClick={() => setLightbox({ src: driveImage(p.image), alt: p.name })}
                        className="block w-full cursor-zoom-in"
                        aria-label={`Zoom in on ${p.name}`}
                      >
                        <img
                          src={driveImage(p.image)}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          className="aspect-square w-full border-b-2 border-city-ink/10 object-cover"
                        />
                      </button>
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
                    {sale && (
                      <span className="absolute right-3 top-3 rounded-full bg-city-crimson px-3 py-1 font-manila-body text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                        Sale
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="font-manila-body text-[11px] font-bold uppercase tracking-[0.2em] text-city-crimson">
                      {p.category}
                    </p>
                    <h3 className="mt-1 font-manila text-lg uppercase leading-tight">{p.name}</h3>
                    <div className="mt-3 flex flex-1 flex-wrap items-end gap-x-2 gap-y-1">
                      {/* Sari-sari price tag — the sale price takes over when on sale */}
                      <span
                        className={`inline-flex items-center rounded-md px-3 py-1 font-manila text-lg leading-none ${
                          sale ? 'bg-city-crimson text-white' : 'bg-city-yellow text-city-ink'
                        }`}
                      >
                        {showPrice(sale ? p.sale_price : p.price)}
                      </span>
                      {sale && p.price && (
                        <span className="font-manila-body text-sm font-semibold text-city-ink/50 line-through">
                          {showPrice(p.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Striped awning divider */}
      <div className="h-6" style={awning} aria-hidden />

      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}
