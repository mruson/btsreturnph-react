// ============================================================================
// CAMPAIGN THEMES — what a sponsored series LOOKS like.
// ============================================================================
// The campaigns themselves — name, tagline, sponsor, logo, which theme they use
// — live in the `campaigns` table, so whoever runs a campaign can change them
// without a developer. This file holds only the design, because a palette and a
// background composition need design work and a deploy either way.
//
// A campaign row's `theme` column is a key into THEMES below.
//
// HOW A THEME WORKS
// -----------------
// Every colour is a CSS custom property set on the page wrapper. The components
// never name a colour — they say `text-[color:var(--rf-muted)]` — so adding a
// campaign means adding an object below and nothing else. No component edits, no
// conditional classes, no `theme === 'galaxy'` branches anywhere.
//
// WHY THE THEME ISN'T IN THE DATABASE
// -----------------------------------
// It's tempting to give sponsors colour pickers, but a look is more than three
// hex values — it's the background composition, the panel treatment, the type.
// Storing arbitrary CSS in a table and injecting it is fragile and unsafe.
//
// TO ADD A THEME
// --------------
//   1. Add an entry to THEMES below with its own `vars` (copy one, change values).
//   2. Select it from the Theme dropdown when creating the campaign in the
//      dashboard — no other code change anywhere.
//
// Tailwind scans this file (content glob covers src/**/*.js), so class strings
// written here are generated like any other.

// --- Shared background recipes ---------------------------------------------

// One generated SVG star tile rather than an image file: no extra request, a few
// hundred bytes, and it repeats seamlessly down a page of any height. Built once
// from a seeded sequence so the pattern is identical on every render and reload
// — a starfield that reshuffled as you navigated would read as a glitch.
const STAR_TILE = (() => {
  let seed = 1337
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)

  const stars = Array.from({ length: 110 }, () => {
    const x = (rnd() * 600).toFixed(1)
    const y = (rnd() * 600).toFixed(1)
    const r = (rnd() * 1.15 + 0.25).toFixed(2)
    const o = (rnd() * 0.65 + 0.18).toFixed(2)
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${o}"/>`
  }).join('')

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'>${stars}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
})()

const galaxyBackdrop = {
  backgroundColor: '#07040f',
  backgroundImage: [
    'radial-gradient(1200px 600px at 15% -10%, rgba(124,58,237,0.35), transparent 70%)',
    'radial-gradient(900px 500px at 85% 5%, rgba(219,39,119,0.22), transparent 70%)',
    'radial-gradient(1000px 700px at 50% 110%, rgba(56,189,248,0.14), transparent 70%)',
    STAR_TILE,
  ].join(', '),
  backgroundRepeat: 'no-repeat, no-repeat, no-repeat, repeat',
}

// --- Campaigns --------------------------------------------------------------

export const THEMES = {
  galaxy: {
    label: 'Galaxy (dark starfield)',
    // Which .skeleton-* variant reads on this surface (see index.css).
    skeleton: 'skeleton-dark',
    backdrop: galaxyBackdrop,

    vars: {
      // Type family, so a campaign can bring its own voice without touching a
      // single component. Both faces are already loaded by index.html.
      '--rf-font-display': '"Anton", ui-sans-serif, system-ui, sans-serif',
      '--rf-font-body': '"Barlow", ui-sans-serif, system-ui, sans-serif',
      // Type. Three tones is enough: primary, supporting, and small print.
      '--rf-text': '#ffffff',
      '--rf-muted': 'rgba(255,255,255,0.72)',
      '--rf-soft': 'rgba(255,255,255,0.55)',
      '--rf-faint': 'rgba(255,255,255,0.38)',
      // Lines and surfaces.
      '--rf-border': 'rgba(255,255,255,0.10)',
      '--rf-border-strong': 'rgba(255,255,255,0.28)',
      '--rf-panel': 'rgba(255,255,255,0.04)',
      '--rf-panel-hover': 'rgba(255,255,255,0.07)',
      '--rf-input': 'rgba(255,255,255,0.06)',
      // The one high-contrast pair, used by primary buttons and the "open" chip.
      '--rf-accent': '#ffffff',
      '--rf-accent-text': '#07040f',
      // Quieter chip fills for the states you can't act on.
      '--rf-chip': 'rgba(255,255,255,0.14)',
      '--rf-chip-dim': 'rgba(255,255,255,0.08)',
      // Backing for anything that sits on top of a prize photo, where the
      // translucent fills above would disappear against a bright image.
      '--rf-scrim': 'rgba(7,4,15,0.66)',
      // Errors. Red carries meaning, but "red on near-black" and "red on cream"
      // are not the same red, so the campaign picks its own.
      '--rf-danger': '#fecdd3',
      '--rf-danger-bg': 'rgba(239,68,68,0.10)',
      '--rf-danger-border': 'rgba(248,113,113,0.40)',
    },
  },

  // ---------------------------------------------------------------------------
  // EXAMPLE — a light theme, to show the shape. Uncomment and it appears in the
  // Theme dropdown in the dashboard immediately.
  //
  // daylight: {
  //   label: 'Daylight (light)',
  //   skeleton: '',                       // the default light tint
  //   backdrop: { backgroundColor: '#faf7ff' },
  //   vars: {
  //     '--rf-font-display': '"Poppins", ui-sans-serif, sans-serif',
  //     '--rf-font-body': '"Inter", ui-sans-serif, sans-serif',
  //     '--rf-text': '#1B1440',
  //     '--rf-muted': 'rgba(27,20,64,0.72)',
  //     '--rf-soft': 'rgba(27,20,64,0.55)',
  //     '--rf-faint': 'rgba(27,20,64,0.40)',
  //     '--rf-border': 'rgba(27,20,64,0.12)',
  //     '--rf-border-strong': 'rgba(27,20,64,0.30)',
  //     '--rf-panel': '#ffffff',
  //     '--rf-panel-hover': '#ffffff',
  //     '--rf-input': '#ffffff',
  //     '--rf-accent': '#7B4FE0',
  //     '--rf-accent-text': '#ffffff',
  //     '--rf-chip': 'rgba(123,79,224,0.15)',
  //     '--rf-chip-dim': 'rgba(27,20,64,0.08)',
  //     '--rf-scrim': 'rgba(255,255,255,0.85)',
  //     '--rf-danger': '#b91c1c',
  //     '--rf-danger-bg': 'rgba(239,68,68,0.06)',
  //     '--rf-danger-border': 'rgba(185,28,28,0.30)',
  //   },
  // },
}

export const DEFAULT_THEME = 'galaxy'

export const themeKeys = Object.keys(THEMES)

// An unknown theme key renders in the default look rather than as an unstyled
// page — a campaign misconfigured in the dashboard should look slightly wrong,
// never broken.
export const themeFor = (key) => THEMES[String(key || '').trim()] || THEMES[DEFAULT_THEME]

// Used before the campaigns table has loaded, and if it can't be reached. Keeps
// the page styled and readable rather than flashing unstyled content.
export const FALLBACK_CAMPAIGN = {
  slug: 'seven-with-you',
  name: 'Seven With You',
  tagline: 'A series of ARMY giveaways for each BTS member\u2019s birthday.',
  eyebrow: 'Concert Initiative · ARMY Giveaways',
  sponsor: '',
  sponsorLogo: '',
  theme: DEFAULT_THEME,
}
