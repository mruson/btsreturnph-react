# BTS RE:TURN PH — React

A React rebuild of [btsreturnph.com](https://www.btsreturnph.com/), the grassroots
Filipino ARMY initiative for BTS's 2026 comeback. Built with **Vite + React + Tailwind CSS**
so it's fast to run, easy to edit, and simple to deploy anywhere.

## Run it locally

```bash
npm install      # first time only
npm run dev      # start the dev server → http://localhost:5173
```

Other commands:

```bash
npm run build    # production build into /dist
npm run preview  # preview the production build locally
```

## How it's organized

```
src/
  data/site.js        ← ALL editable content lives here (start here!)
  components/          ← Navbar, Footer, Layout, shared UI pieces
  pages/               ← one file per page/route
  App.jsx              ← routes (URL → page)
public/                ← static files: favicon, images you add, _redirects
```

## Editing content (no coding needed for most changes)

Most of the site is driven by **`src/data/site.js`**. Open it to change:

- **Navigation menu** — the `nav` array
- **Social media links** — the `socials` array
- **Donation channels** (G-Cash / Maya / PayPal) — `donationChannels`
- **Donate / tracker button links** — `donationLinks` (currently `#` placeholders)
- **Voting apps & categories** — `votingPlatforms`
- **Concert fan-project targets** — `concertProjects`
- **The four RE: sub-projects** — `subProjects`

Page-specific placeholder lists (donors, communities, shop products) live at the top of
their own files in `src/pages/`.

## Adding real images

The design currently uses styled **placeholders** (dashed boxes labeled "Image").
To use real images:

1. Drop image files into `public/` (e.g. `public/logo.png`).
2. Replace an `<ImagePlaceholder ... />` with a normal `<img src="/logo.png" alt="..." />`.

## Deploying

The build output (`/dist`) is a static site. Any of these work with zero config:

- **Netlify / Vercel** — connect the repo; build command `npm run build`, publish dir `dist`.
  The included `public/_redirects` handles client-side routing on Netlify.
- **GitHub Pages** — serve `/dist` (add a `vite.config.js` `base` if not at the domain root).

To point your existing domain (btsreturnph.com) here, update its DNS/nameservers to the
new host once deployed.

## Notes

- Content was recreated from the public live site; wording is a faithful paraphrase.
  Review each page and adjust copy as you like.
- Colors: BTS purple + a bright "spring" accent palette, defined in `tailwind.config.js`.
