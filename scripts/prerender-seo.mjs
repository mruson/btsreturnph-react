// Writes one static HTML file per route into /dist, each carrying that route's
// own title, description, and share-card tags. Also emits sitemap.xml and
// robots.txt. Runs automatically after `npm run build`.
//
// WHY THIS EXISTS
// ---------------
// This is a single-page app: every URL serves the same index.html and React
// fills in the page in the browser. Facebook, X, Threads, Viber, and Messenger
// do NOT run JavaScript when they unfurl a link — they read the raw HTML and
// stop. So meta tags set by React are invisible to them, and every shared link
// would show the homepage's card no matter which page was shared.
//
// Netlify serves a matching static file before falling back to the SPA rule in
// public/_redirects, so /fanchant hits dist/fanchant/index.html (correct card)
// while an unknown URL still falls through to the app's 404 page.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { routeSeo, defaultSeo, siteUrl } from '../src/data/seo.js'

const ROOT = new URL('..', import.meta.url).pathname
const DIST = join(ROOT, 'dist')

// Old URLs that have since been renamed, as [from, to]. These emit 301s so
// links already out in the wild — posts, bios, printed QR codes — keep working
// and pass their search ranking to the new URL. Never delete a row: the old
// link lives forever on someone's timeline. Keep the paths off routeSeo, or the
// prerendered file would shadow the redirect.
const legacyRoutes = [['/sponsors', '/partners']]

// Escape for use inside a double-quoted HTML attribute.
const attr = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const html = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function headFor({ title, description, url, image, imageAlt, noindex }) {
  return `<meta name="description" content="${attr(description)}" />
    <link rel="canonical" href="${attr(url)}" />
${noindex ? '    <meta name="robots" content="noindex, follow" />\n' : ''}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="BTS RE:TURN PH" />
    <meta property="og:locale" content="en_PH" />
    <meta property="og:title" content="${attr(title)}" />
    <meta property="og:description" content="${attr(description)}" />
    <meta property="og:url" content="${attr(url)}" />
    <meta property="og:image" content="${attr(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${attr(imageAlt)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${attr(title)}" />
    <meta name="twitter:description" content="${attr(description)}" />
    <meta name="twitter:image" content="${attr(image)}" />

    <meta name="theme-color" content="#7B4FE0" />
    <title>${html(title)}</title>`
}

const MARKERS = /<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/

async function run() {
  const template = await readFile(join(DIST, 'index.html'), 'utf8')

  if (!MARKERS.test(template)) {
    console.error(
      '\n  prerender-seo: could not find the <!-- SEO:START --> / <!-- SEO:END -->\n' +
        '  markers in index.html. Share cards were NOT generated.\n',
    )
    process.exit(1)
  }

  const written = []

  for (const [path, entry] of Object.entries(routeSeo)) {
    const title = entry.title || defaultSeo.title
    const description = entry.description || defaultSeo.description
    const image = siteUrl + (entry.image || defaultSeo.image)
    const url = siteUrl + path

    const page = template.replace(
      MARKERS,
      `<!-- SEO:START -->\n    ${headFor({
        title,
        description,
        url,
        image,
        imageAlt: title,
        noindex: entry.noindex,
      })}\n    <!-- SEO:END -->`,
    )

    // "/" is dist/index.html; "/about" is dist/about/index.html.
    const dir = path === '/' ? DIST : join(DIST, path)
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'index.html'), page)
    written.push(path)
  }

  // --- sitemap.xml ---------------------------------------------------------
  const today = new Date().toISOString().slice(0, 10)
  const indexable = Object.entries(routeSeo).filter(([, e]) => !e.noindex)
  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    indexable
      .map(
        ([path]) =>
          `  <url>\n    <loc>${siteUrl}${path}</loc>\n` +
          `    <lastmod>${today}</lastmod>\n` +
          `    <priority>${path === '/' ? '1.0' : '0.8'}</priority>\n  </url>`,
      )
      .join('\n') +
    `\n</urlset>\n`
  await writeFile(join(DIST, 'sitemap.xml'), sitemap)

  // --- robots.txt ----------------------------------------------------------
  await writeFile(
    join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
  )

  // --- _redirects ----------------------------------------------------------
  // Netlify would resolve /voting -> /voting/index.html on its own, but only
  // because unforced redirects lose to existing static files. Spelling the
  // rules out removes the reliance on that ordering: each prerendered route is
  // pinned to its own HTML, and everything else still falls through to the SPA.
  // Rules are matched top-down, so the catch-all must stay last.
  const redirects =
    `# Generated by scripts/prerender-seo.mjs on every build — do not hand-edit.\n` +
    `# Source: public/_redirects (fallback rule) + src/data/seo.js (routes).\n\n` +
    `# Prerendered routes: each serves HTML carrying its own share-card tags,\n` +
    `# so link previews are correct for crawlers, which don't run JavaScript.\n` +
    written
      .filter((p) => p !== '/')
      .map((p) => `${p.padEnd(16)}${`${p}/index.html`.padEnd(28)}200`)
      .join('\n') +
    `\n\n# Renamed routes — 301 so already-shared links and search rankings follow.\n` +
    legacyRoutes
      .map(([from, to]) => `${from.padEnd(16)}${to.padEnd(28)}301`)
      .join('\n') +
    `\n\n# SPA fallback — unknown URLs load the app, which renders the 404 page.\n` +
    `${'/*'.padEnd(16)}${'/index.html'.padEnd(28)}200\n`
  await writeFile(join(DIST, '_redirects'), redirects)

  console.log(
    `\n  prerender-seo: ${written.length} routes + sitemap.xml + robots.txt + _redirects` +
      `\n  base URL: ${siteUrl}\n`,
  )
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
