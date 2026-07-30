// Small reusable building blocks shared across pages.

// --- Google Sheet loading / error states -----------------------------------

// One grey placeholder block. `city` switches to the tint that reads on the
// Manila pages' cream background.
export function Skeleton({ className = '', city = false }) {
  return <div className={`skeleton ${city ? 'skeleton-city' : ''} ${className}`} aria-hidden />
}

// Wraps a section that's driven by a sheet. Shows `skeleton` while loading, a
// retry prompt if the fetch failed and we have nothing to show, otherwise the
// real children.
//
// `hasContent` matters: some tabs have a seeded fallback list, so a failed
// fetch still leaves something worth rendering — in that case we stay quiet
// rather than putting an error box above perfectly good content.
export function SheetSection({ loading, error, reload, hasContent, skeleton, children, city = false }) {
  if (loading && !hasContent) return skeleton
  if (error && !hasContent) return <LoadError onRetry={reload} city={city} />
  return children
}

// Shown when a sheet can't be reached and there's no fallback content. Says
// what happened without blaming the visitor, and offers a way out.
export function LoadError({ onRetry, city = false }) {
  return (
    <div
      role="status"
      className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center ${
        city ? 'border-city-crimson/30 bg-white/50' : 'border-purple/25 bg-purple/[0.03]'
      }`}
    >
      <p className={`font-semibold ${city ? 'text-city-ink' : 'text-ink'}`}>
        We couldn&rsquo;t load this right now.
      </p>
      <p className={`mt-1 text-sm ${city ? 'text-city-ink/70' : 'text-ink/60'}`}>
        Check your connection and try again.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`mt-5 ${city ? 'city-btn-outline' : 'btn-ghost'}`}
        >
          Try again
        </button>
      )}
    </div>
  )
}

// Shown while a code-split page chunk downloads (see App.jsx / routes.jsx).
// The spinner is delayed ~250ms by CSS, so quick navigations — the common case
// once a chunk is cached — show nothing at all rather than a jarring flash.
export function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status">
      <span className="route-spinner" />
      <span className="sr-only">Loading page…</span>
    </div>
  )
}

export function Section({ children, className = '', muted = false }) {
  return (
    <section className={`${muted ? 'bg-purple/[0.03]' : ''} py-16 sm:py-20`}>
      <div className={`container-page ${className}`}>{children}</div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, subtitle, center = false }) {
  return (
    <div className={`${center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} mb-10`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl font-extrabold sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-ink/70">{subtitle}</p>}
    </div>
  )
}

// A styled placeholder that stands in for an image the user will add later.
export function ImagePlaceholder({ label = 'Image', ratio = 'aspect-video', className = '' }) {
  return (
    <div
      className={`${ratio} ${className} flex items-center justify-center overflow-hidden rounded-2xl border border-dashed border-purple/30 bg-gradient-to-br from-purple/10 via-spring-sky/10 to-spring-pink/10`}
    >
      <span className="text-sm font-medium text-purple/60">{label}</span>
    </div>
  )
}

// Compact hero used at the top of inner pages.
export function PageHero({ code, title, subtitle }) {
  return (
    <div className="bg-hero-gradient text-white">
      <div className="container-page py-16 sm:py-20">
        {code && (
          <p className="mb-3 font-display text-sm font-bold uppercase tracking-[0.25em] text-white/80">
            {code}
          </p>
        )}
        <h1 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-white/85">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

export function Badge({ children }) {
  return (
    <span className="inline-block rounded-full bg-purple/10 px-3 py-1 text-xs font-semibold text-purple">
      {children}
    </span>
  )
}

// ============================================================================
// BTS in the City: Manila theme (used only on the Concert Initiative pages)
// ============================================================================

// Cyan hero with the logo's stacked, angled crimson title banners.
export function CityPageHero({ code, titleLines, subtitle, uppercase = true }) {
  return (
    <div className="bg-city-sky">
      <div className="container-page py-16 text-center sm:py-24">
        {code && (
          <p className="mb-6 font-manila-body text-sm font-semibold uppercase tracking-[0.25em] text-city-cream">
            {code}
          </p>
        )}
        <div className="flex max-w-full flex-col items-center gap-1.5">
          {titleLines.map((line, i) => (
            <span
              key={line}
              className={`city-banner max-w-full text-2xl sm:text-4xl md:text-5xl ${
                i % 2 ? 'rotate-1' : '-rotate-1'
              }`}
            >
              {uppercase ? line.toUpperCase() : line}
            </span>
          ))}
        </div>
        {subtitle && (
          <p className="mx-auto mt-7 max-w-2xl font-manila-body text-lg font-medium text-white">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

// Placeholder styled for the Manila palette (dashed crimson on cream).
export function CityImagePlaceholder({ label = 'Image', ratio = 'aspect-video', className = '' }) {
  return (
    <div
      className={`${ratio} ${className} flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-city-crimson/40 bg-city-cream`}
    >
      <span className="font-manila-body text-sm font-semibold uppercase tracking-wide text-city-crimson/70">
        {label}
      </span>
    </div>
  )
}
