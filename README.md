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

## Deploying (Netlify)

The site is hosted on **Netlify**, connected to this GitHub repo. Build settings live in
[`netlify.toml`](netlify.toml) (`npm run build` → `dist`), and `public/_redirects` handles
client-side routing. To point **btsreturnph.com** here, add it as a custom domain in Netlify
and update the domain's DNS once you're happy with the site.

### Branch workflow (to save build credits)

Netlify only builds the **`main`** branch. In the Netlify UI, under
**Build & deploy → Branches and deploy contexts**, we set:

- **Production branch:** `main`
- **Branch deploys:** `None` (only `main` builds)
- **Deploy Previews:** `None`

So **only a push/merge to `main` triggers a build.** Do day-to-day work on **`staging`**:

```bash
# on the staging branch — pushing here does NOT build (free)
git add -A && git commit -m "…"
git push

# ship to production (uses one build credit)
git checkout main && git merge staging && git push
git checkout staging      # back to working branch
```

### Previewing staging changes (free)

Staging has no Netlify URL, so preview it one of these ways — neither costs build credits:

```bash
npm run dev        # live, hot-reloading → http://localhost:5173
npm run preview    # production build, exactly as it'll deploy
```

Need a **shareable** hosted link? Build locally and upload with the Netlify CLI — pre-built
uploads don't consume build minutes (the build ran on your machine):

```bash
npm i -g netlify-cli && netlify login   # first time only
npm run build
netlify deploy --dir=dist               # → a draft preview URL (free)
netlify deploy --dir=dist --prod        # publish to production (free — local build)
```

> Tip: add `[skip ci]` to a commit message to skip the build even on `main`.

## Notes

- Content was recreated from the public live site; wording is a faithful paraphrase.
  Review each page and adjust copy as you like.
- Colors: BTS purple + a bright "spring" accent palette, defined in `tailwind.config.js`.
