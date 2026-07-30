// Generates the brand assets derived from the logo:
//   - the 1200×630 social share cards in /public/og
//   - /public/apple-touch-icon.png, used when someone saves the site to their
//     iOS home screen (iOS ignores the small favicon and would otherwise
//     screenshot the page)
// Run with: npm run og
//
// These are committed to the repo — you only need to re-run this if the logo,
// the palette, or the card copy changes. Output is JPEG on purpose: every
// social platform decodes it, while WebP/AVIF support in link previews is
// still patchy (Viber and some X clients in particular).
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = join(ROOT, 'public', 'og')

const W = 1200
const H = 630

// Fonts: the site's Poppins/Anton aren't installed on most machines, so the
// cards use the system grotesque. The logo already carries the wordmark, so
// the rendered text is only supporting copy.
const SANS = 'Helvetica Neue, Helvetica, Arial, sans-serif'

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// --- Card 1: purple brand card (comeback initiative pages) -----------------
const brandBg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#5A34B0"/>
      <stop offset="45%" stop-color="#7B4FE0"/>
      <stop offset="100%" stop-color="#9E7BF0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <!-- soft light bloom behind the logo, echoing the site's hero gradient -->
  <circle cx="300" cy="315" r="290" fill="#8FC7FF" opacity="0.18"/>
</svg>`)

const brandText = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <text x="600" y="250" font-family="${SANS}" font-size="66" font-weight="700" fill="#ffffff">
    ${esc('BTS RE:TURN PH')}
  </text>
  <text x="600" y="316" font-family="${SANS}" font-size="26" font-weight="600"
        letter-spacing="5" fill="#FFE49E">
    ${esc('STREAM · VOTE · CELEBRATE')}
  </text>
  <text x="600" y="392" font-family="${SANS}" font-size="27" font-weight="400" fill="#ffffff" opacity="0.9">
    ${esc('A Filipino ARMY initiative for the')}
  </text>
  <text x="600" y="430" font-family="${SANS}" font-size="27" font-weight="400" fill="#ffffff" opacity="0.9">
    ${esc('2026 BTS comeback.')}
  </text>
  <rect x="600" y="470" width="86" height="5" rx="2.5" fill="#FF9EC4"/>
</svg>`)

// --- Card 2: Manila city card (concert initiative pages) -------------------
// Mirrors the site's city theme: cyan sky, cream, angled crimson banners.
const cityBg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#1CA9DD"/>
  <circle cx="1010" cy="150" r="200" fill="#FBC01E" opacity="0.22"/>
  <circle cx="140" cy="560" r="170" fill="#F07E27" opacity="0.18"/>
</svg>`)

// The angled crimson title banners are the logo lockup's signature move.
function banner(text, x, y, w, h, rotate, fontSize) {
  return `
  <g transform="rotate(${rotate} ${x + w / 2} ${y + h / 2})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#EC1E50"/>
    <text x="${x + 26}" y="${y + h - Math.round(h * 0.28)}"
          font-family="${SANS}" font-size="${fontSize}" font-weight="700"
          letter-spacing="2" fill="#141414">${esc(text)}</text>
  </g>`
}

const cityText = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <text x="90" y="132" font-family="${SANS}" font-size="24" font-weight="700"
        letter-spacing="8" fill="#FBF4DA">${esc('CONCERT INITIATIVE')}</text>
  ${banner('BTS', 90, 170, 200, 86, -1.5, 58)}
  ${banner('IN THE CITY:', 90, 274, 476, 86, 1.5, 58)}
  ${banner('MANILA TO BULACAN', 90, 378, 742, 86, -1.5, 58)}
  <text x="90" y="536" font-family="${SANS}" font-size="27" font-weight="600"
        letter-spacing="3" fill="#ffffff">${esc('BIGGER. BETTER. LOUDER. ALL FOR BTS IN MNL.')}</text>
</svg>`)

async function build() {
  await mkdir(OUT, { recursive: true })

  const logo = await sharp(join(ROOT, 'public', 'logo.png'))
    .resize(430, 430, { fit: 'inside' })
    .toBuffer()

  await sharp(brandBg)
    .composite([
      { input: logo, left: 90, top: 100 },
      { input: brandText, left: 0, top: 0 },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(join(OUT, 'default.jpg'))

  const smallLogo = await sharp(join(ROOT, 'public', 'logo.png'))
    .resize(190, 190, { fit: 'inside' })
    .toBuffer()

  await sharp(cityBg)
    .composite([
      { input: cityText, left: 0, top: 0 },
      { input: smallLogo, left: 940, top: 380 },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(join(OUT, 'concert.jpg'))

  // iOS home-screen icon. Flattened onto white because iOS renders transparent
  // areas as black, and the logo has a transparent background.
  await sharp(join(ROOT, 'public', 'logo.png'))
    .resize(160, 160, { fit: 'inside' })
    .extend({
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
      background: '#ffffff',
    })
    .flatten({ background: '#ffffff' })
    .png({ compressionLevel: 9, palette: true })
    .toFile(join(ROOT, 'public', 'apple-touch-icon.png'))

  for (const f of ['default.jpg', 'concert.jpg']) {
    const { size } = await sharp(join(OUT, f)).metadata().then(
      async (m) => ({ size: (await sharp(join(OUT, f)).toBuffer()).length, ...m }),
    )
    console.log(`  public/og/${f}  ${W}×${H}  ${(size / 1024).toFixed(0)} KB`)
  }
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
