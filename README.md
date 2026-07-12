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

### Optimize images before shipping (saves Netlify bandwidth credits)

Bandwidth is the one thing that scales with visitors and eats [Netlify
credits](#how-netlify-credits-work-read-this-first), so large images are expensive at scale. After adding new
images to `public/`, run the optimizer:

```bash
node scripts/optimize-images.mjs
```

It resizes anything wider than 1920px, converts every image over ~200 KB to **WebP** (quality
82), deletes the bulky original, and rewrites the `.png`/`.jpeg` references in `src/` and
`index.html` to point at the new `.webp` files. Small icons, logos, the favicon, and QR codes
are left untouched. Review the printed before/after table, then `npm run preview` to eyeball the
result before committing.

> The one-time pass on the original assets cut `dist/` from **34 MB to ~6 MB (−83%)**. The
> script uses [`sharp`](https://sharp.pixelplumbing.com/) (a dev dependency); tweak `MAX_WIDTH`,
> `QUALITY`, or `SIZE_THRESHOLD` at the top of the file if you need different trade-offs.

## Deploying (Netlify)

The site is hosted on **Netlify**, connected to this GitHub repo. Build settings live in
[`netlify.toml`](netlify.toml) (`npm run build` → `dist`), and `public/_redirects` handles
client-side routing. To point **btsreturnph.com** here, add it as a custom domain in Netlify
and update the domain's DNS once you're happy with the site.

### How Netlify credits work (read this first)

Netlify's free tier gives **300 credits/month**, and **each build on Netlify's servers costs
15 credits** — about **20 builds/month** before all sites pause until the next cycle. Bandwidth
and compute also draw from the same 300 credits. The key insight: **a credit is only charged
when the build runs _on Netlify_.** If you build locally and upload the finished files, there's
no build credit. That gives you two ways to deploy.

### Workflow A — Auto-deploy from `main` (simplest, default)

Netlify watches `main` and builds it for you. In the Netlify UI, under
**Build & deploy → Branches and deploy contexts**:

- **Production branch:** `main`
- **Branch deploys:** `None` (only `main` builds)
- **Deploy Previews:** `None`

So **only a push/merge to `main` triggers a build (15 credits).** Day-to-day work happens on
**`staging`**, which never builds:

```bash
# on the staging branch — pushing here does NOT build (free)
git add -A && git commit -m "…"
git push

# ship to production — this merge triggers the auto-build (15 credits)
git checkout main && git merge staging && git push
git checkout staging      # back to working branch
```

**Best if you deploy a few times a month.** Your live site always matches `main` automatically,
and you never run a deploy command. Batch changes into one merge instead of merging every small
fix, so you don't burn 15 credits per typo.

### Workflow B — Manual CLI deploy (saves credits if you deploy often)

Build **on your own machine** and upload the finished `dist/` — Netlify never builds, so **no
build credit** is charged (bandwidth only). To use this, first **turn off auto-deploy** in the
Netlify UI (**Build & deploy → Continuous deployment → stop builds**), otherwise your merge to
`main` _also_ triggers an auto-build and you pay the 15 credits anyway — defeating the purpose.

```bash
npm i -g netlify-cli && netlify login   # first time only

# still merge to main so the repo stays the source of truth — this is
# just git/GitHub and costs ZERO Netlify credits (auto-build is off)
git checkout main && git merge staging && git push
git checkout staging

# then publish the locally-built files
npm run build
netlify deploy --dir=dist               # → a draft preview URL (free)
netlify deploy --dir=dist --prod        # publish to production (free — local build)
```

**Best if you deploy more than ~20 times a month.** Trade-off: it's manual, and your live site
only updates when you remember to run the command — so keep merging to `main` to preserve
history even though the deploy itself is separate.

> **Don't mix A and B.** With auto-deploy on, a CLI `--prod` deploy just republishes what the
> auto-build already shipped — you pay 15 credits _and_ deploy twice. Pick one workflow.

### Previewing staging changes (free)

Staging has no Netlify URL, so preview it locally — neither costs build credits:

```bash
npm run dev        # live, hot-reloading → http://localhost:5173
npm run preview    # production build, exactly as it'll deploy
```

Need a **shareable** hosted link without shipping to production? Build locally and upload a draft
(works regardless of which workflow you're on — the build ran on your machine):

```bash
npm run build
netlify deploy --dir=dist               # → a temporary draft preview URL (free)
```

> Tip: add `[skip ci]` to a commit message to skip the build even on `main`.

## Notes

- Content was recreated from the public live site; wording is a faithful paraphrase.
  Review each page and adjust copy as you like.
- Colors: BTS purple + a bright "spring" accent palette, defined in `tailwind.config.js`.
