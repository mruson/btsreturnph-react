import { Link } from 'react-router-dom'
import { useCampaign, useSkeletonVariant } from '../lib/campaignTheme'

// ============================================================================
// RAFFLE UI — chrome shared by the series index and the giveaway pages.
// ============================================================================
// Campaign-agnostic on purpose. Nothing here names a colour or a font: every
// value comes from a CSS custom property that lib/campaignTheme.jsx sets from
// data/campaigns.js. That's what lets a new sponsor bring their own look without
// a single edit in this file.
//
// Deliberately NOT the "BTS in the City: Manila" theme the rest of the Concert
// Initiative wears — sponsored campaigns get their own identity.

// Glass panel — the dark-theme equivalent of the white cards on the other pages.
export const panel =
  'rounded-2xl border border-[color:var(--rf-border)] bg-[var(--rf-panel)] backdrop-blur-sm'

export function CampaignHero({ raffle, back = false }) {
  const campaign = useCampaign()

  // A raffle naming its own sponsor wins on its own page; otherwise the campaign's
  // sponsor shows. That's what puts the logo on the series index too, where there
  // is no raffle to read it from.
  const credit =
    raffle?.sponsor || raffle?.sponsorLogo
      ? raffle
      : { sponsor: campaign.sponsor, sponsorLogo: campaign.sponsorLogo }

  return (
    <header className="relative overflow-hidden border-b border-[color:var(--rf-border)]">
      <div
        className={`container-page relative text-center ${
          back ? 'py-10 sm:py-14' : 'py-16 sm:py-24'
        }`}
      >
        {back ? (
          <Link
            to="/raffle"
            className="font-[family-name:var(--rf-font-body)] text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--rf-soft)] underline-offset-4 transition hover:text-[color:var(--rf-text)] hover:underline"
          >
            ← All {campaign.name} raffles
          </Link>
        ) : (
          <p className="font-[family-name:var(--rf-font-body)] text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--rf-soft)]">
            {campaign.eyebrow}
          </p>
        )}
        <h1
          className={`mt-5 font-[family-name:var(--rf-font-display)] uppercase leading-none tracking-wide text-[color:var(--rf-text)] ${
            back ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-6xl md:text-7xl'
          }`}
        >
          {campaign.name}
        </h1>
        {!back && (
          <p className="mx-auto mt-6 max-w-2xl font-[family-name:var(--rf-font-body)] text-lg text-[color:var(--rf-muted)]">
            {campaign.tagline}
          </p>
        )}
        {/* The sponsor rides in the header, so the brand backing the current
            giveaway sits with the series name rather than down in the body. */}
        <SponsorCredit raffle={credit} center />
      </div>
    </header>
  )
}



// Chips carry weight through fill rather than hue, since campaign type is a
// single colour: solid accent shouts, translucent murmurs.
//
// `overlay` is the variant that sits on top of a prize photo. The translucent
// fills can't be reused there — 8% white over a bright poster leaves white text
// on nothing — so those states switch to the campaign's scrim, which is opaque
// enough to read over any image. "Open" keeps its solid accent, so the
// solid-means-actionable hierarchy survives the move.
const STATUS_CHIPS = {
  upcoming: {
    label: 'Opens soon',
    className: 'bg-[var(--rf-chip)] text-[color:var(--rf-text)] ring-1 ring-[color:var(--rf-border-strong)]',
    overlay: 'bg-[var(--rf-scrim)] text-[color:var(--rf-text)] ring-1 ring-[color:var(--rf-border-strong)] backdrop-blur-md',
  },
  open: {
    label: 'Raffle open',
    className: 'bg-[var(--rf-accent)] text-[color:var(--rf-accent-text)]',
    overlay: 'bg-[var(--rf-accent)] text-[color:var(--rf-accent-text)] shadow-lg',
  },
  // Drawn and announced. Reads as a result rather than an absence, which is why
  // it gets its own label instead of sharing "Raffle closed".
  ended: {
    label: 'Winners announced',
    className: 'bg-[var(--rf-chip)] text-[color:var(--rf-text)] ring-1 ring-[color:var(--rf-border-strong)]',
    overlay: 'bg-[var(--rf-scrim)] text-[color:var(--rf-text)] ring-1 ring-[color:var(--rf-border-strong)] backdrop-blur-md',
  },
  closed: {
    label: 'Raffle closed',
    className: 'bg-[var(--rf-chip-dim)] text-[color:var(--rf-soft)] ring-1 ring-[color:var(--rf-border)]',
    overlay: 'bg-[var(--rf-scrim)] text-[color:var(--rf-muted)] ring-1 ring-[color:var(--rf-border-strong)] backdrop-blur-md',
  },
}

export function StatusChip({ status, overlay = false }) {
  const chip = STATUS_CHIPS[status]
  if (!chip) return null
  return (
    <span
      className={`inline-block rounded-full px-4 py-1.5 font-[family-name:var(--rf-font-body)] text-[11px] font-bold uppercase tracking-[0.2em] ${
        overlay ? chip.overlay : chip.className
      }`}
    >
      {chip.label}
    </span>
  )
}

// A credit line under the title rather than a panel — it reads as part of the
// title ("Raffle Trial 2, sponsored by Visa") instead of competing with it.
//
// The logo carries the name when there is one, so we don't print "VISA" beside
// the Visa logo. Renders nothing when both columns are blank.
// `compact` is the archive-card size — same credit, scaled down to sit on a card
// without shouting over the raffle's own title.


export function SponsorCredit({ raffle, compact = false, center = false }) {
  if (!raffle?.sponsor && !raffle?.sponsorLogo) return null
  return (
    <p
      className={`flex flex-wrap items-center ${center ? 'justify-center' : ''} ${
        compact ? 'mt-2.5 gap-x-2.5 gap-y-1.5' : 'mt-7 gap-x-3 gap-y-2'
      }`}
    >
      <span
        className={`font-[family-name:var(--rf-font-body)] font-bold uppercase tracking-[0.2em] text-[color:var(--rf-soft)] ${
          compact ? 'text-[9px]' : 'text-[11px]'
        }`}
      >
        Sponsored by
      </span>
      {raffle.sponsorLogo ? (
        // No plate behind the mark — it sits straight on the starfield. That does
        // mean a dark-on-transparent logo will read poorly here, so ask sponsors
        // for a white or light version of their mark for this page.
        <img
          src={raffle.sponsorLogo}
          alt={raffle.sponsor || 'Sponsor'}
          loading="lazy"
          className={`w-auto object-contain ${
            compact ? 'h-6 max-w-[100px]' : 'h-9 max-w-[160px]'
          }`}
        />
      ) : (
        <span
          className={`font-[family-name:var(--rf-font-display)] uppercase leading-none text-[color:var(--rf-text)] ${
            compact ? 'text-sm' : 'text-lg'
          }`}
        >
          {raffle.sponsor}
        </span>
      )}
    </p>
  )
}


// Which .skeleton-* tint reads depends on the campaign's surface, so the variant
// is part of the campaign rather than hard-coded here (see index.css).
export function Bar({ className }) {
  const skeleton = useSkeletonVariant()
  return <div className={`skeleton ${skeleton} ${className}`} aria-hidden />
}

// UI.jsx's LoadError is cream-and-crimson, i.e. Manila-theme only. This is the
// campaign-themed twin.
export function RaffleLoadError({ onRetry }) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-dashed border-[color:var(--rf-border-strong)] bg-[var(--rf-panel)] px-6 py-10 text-center"
    >
      <p className="font-[family-name:var(--rf-font-display)] text-xl uppercase leading-none text-[color:var(--rf-text)]">
        We couldn&rsquo;t load this right now
      </p>
      <p className="mt-2 text-sm text-[color:var(--rf-soft)]">Check your connection and try again.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-md border border-[color:var(--rf-border-strong)] px-5 py-2.5 font-[family-name:var(--rf-font-body)] text-xs font-bold uppercase tracking-wide text-[color:var(--rf-text)] transition hover:bg-[var(--rf-panel-hover)]"
        >
          Try again
        </button>
      )}
    </div>
  )
}

// The count sits on the TITLE's baseline, not the eyebrow's. Wrapping both in
// one `items-baseline` row aligned it to the eyebrow instead, which left it
// floating above and to the right of the heading, attached to nothing.
export function SectionHead({ eyebrow, title, count }) {
  return (
    <div>
      {eyebrow && (
        <p className="mb-3 font-[family-name:var(--rf-font-body)] text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--rf-soft)]">
          {eyebrow}
        </p>
      )}
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h2 className="font-[family-name:var(--rf-font-display)] text-3xl uppercase leading-tight text-[color:var(--rf-text)] sm:text-4xl">
          {title}
        </h2>
        {count != null && (
          <span className="font-[family-name:var(--rf-font-body)] text-sm text-[color:var(--rf-faint)]">
            {count} {count === 1 ? 'raffle' : 'raffles'}
          </span>
        )}
      </div>
    </div>
  )
}

// One card per giveaway on the index. The whole card is the link — a small
// "view" affordance on a card this size would just be a smaller target.
export function RaffleCard({ raffle, status, formatDate }) {
  const campaign = useCampaign()
  return (
    <Link
      to={`/raffle/${raffle.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--rf-border)] bg-[var(--rf-panel)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-[color:var(--rf-border-strong)] hover:bg-[var(--rf-panel-hover)]"
    >
      {/* `relative` so the status chip can sit on the image's top-right corner
          rather than taking a line of its own under the title. */}
      <div className="relative">
        {raffle.image ? (
          <img
            src={raffle.image}
            alt=""
            loading="lazy"
            className="aspect-video w-full border-b border-[color:var(--rf-border)] object-cover"
          />
        ) : (
          // Keeps cards the same height whether or not a raffle has a photo.
          <div className="flex aspect-video w-full items-center justify-center border-b border-[color:var(--rf-border)] bg-[var(--rf-panel)]">
            <span className="font-[family-name:var(--rf-font-display)] text-2xl uppercase text-[color:var(--rf-faint)]">
              {campaign.name}
            </span>
          </div>
        )}
        <span className="absolute right-3 top-3">
          <StatusChip status={status} overlay />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-[family-name:var(--rf-font-display)] text-xl uppercase leading-tight text-[color:var(--rf-text)]">
          {raffle.title}
        </h3>
        {formatDate && (
          <p className="mt-1.5 font-[family-name:var(--rf-font-body)] text-xs font-bold uppercase tracking-wide text-[color:var(--rf-soft)]">
            {formatDate(raffle)}
          </p>
        )}
        {raffle.winners.length > 0 ? (
          <div className="mt-3">
            <p className="font-[family-name:var(--rf-font-body)] text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--rf-soft)]">
              Winners
            </p>
            {/* Names only, never links: the whole card is already a <Link>, and a
                nested anchor is invalid HTML. The clickable version is on the
                detail page. */}
            <p className="mt-1 line-clamp-2 text-sm text-[color:var(--rf-text)]">
              {raffle.winners.map((w) => w.name).join(', ')}
            </p>
          </div>
        ) : (
          raffle.prize.length > 0 && (
            <p className="mt-3 text-sm text-[color:var(--rf-muted)]">
              {raffle.prize.join(' · ')}
            </p>
          )
        )}
        <SponsorCredit raffle={raffle} compact />
        <span className="mt-auto pt-4 font-[family-name:var(--rf-font-body)] text-xs font-bold uppercase tracking-wide text-[color:var(--rf-soft)] transition group-hover:text-[color:var(--rf-text)]">
          View raffle →
        </span>
      </div>
    </Link>
  )
}
