// Resizes oversized images in /public down to the size they're actually
// displayed at, and re-encodes them at a sensible quality.
// Run with: npm run images
//
// This is the follow-up to optimize-images.mjs — that one was a one-off
// PNG/JPEG → WebP conversion capped at 1920px wide, which is still far larger
// than anything on this site renders. A 1500×1500 app icon shown in a 200px box
// makes a phone on mobile data download ~7× the pixels it can use.
//
// TARGETS below are 2× the widest CSS box each image appears in, so they stay
// crisp on retina screens. If you change a layout, update the matching entry.
// Formats are preserved — a .png stays a .png — so no source references change.
//
// Safe to re-run: anything already at or under its target is skipped. The
// originals are in git history if you ever need to go back.
import sharp from 'sharp'
import { readdir, stat, rename, unlink } from 'node:fs/promises'
import { join, extname, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const PUBLIC = join(ROOT, 'public')

// Longest prefix wins, so specific paths can override their directory.
const TARGETS = [
  // Nav/footer logo is 44px, but About renders it at max-w-sm (384px).
  ['/logo.png', 768],
  // Browser tab icon. 64px covers the 32px slot on retina.
  ['/favicon.png', 64],

  // About → "The sub-projects" grid, max-w-[220px].
  ['/about/', 440],

  // Voting → app icons, max-w-[200px].
  ['/home/comeback/voting/', 400],
  // Donations → QR codes, max-w-[200px]. These must stay legible, so 3×.
  ['/home/comeback/donations/', 600],
  // Projects → ARMYSANTA pair inside max-w-3xl, 2 columns (~360px each).
  ['/home/comeback/projects/', 720],

  // Home → hero photo, half of a max-w-6xl grid (~556px).
  ['/home/bts-photo.webp', 1120],
  // Home → "The Plan" 4-up grid (~264px each).
  ['/home/', 560],

  // Concert → Communities icons, w-24 (96px).
  ['/concert/communities/', 192],
  // Concert → BANGTANdahan promo, max-w-sm (384px).
  ['/concert/bangtandahan.png', 768],
  // Concert → aspect-video cards in a 3-up grid (~360px), some full-width.
  ['/concert/', 800],
]

function targetFor(webPath) {
  let best = null
  for (const [prefix, width] of TARGETS) {
    if (webPath.startsWith(prefix) && (!best || prefix.length > best[0].length)) {
      best = [prefix, width]
    }
  }
  return best?.[1] ?? null
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}

// Re-encode at the same format. Quality is per-format because the same number
// means different things in each codec.
function encode(pipeline, ext) {
  switch (ext) {
    case '.png':
      // Logos/icons: palette quantisation is where PNG savings actually come from.
      return pipeline.png({ compressionLevel: 9, palette: true, quality: 90 })
    case '.webp':
      return pipeline.webp({ quality: 80 })
    case '.avif':
      return pipeline.avif({ quality: 55 })
    case '.jpg':
    case '.jpeg':
      return pipeline.jpeg({ quality: 82, mozjpeg: true })
    default:
      return null
  }
}

const rows = []
let before = 0
let after = 0

for await (const file of walk(PUBLIC)) {
  const ext = extname(file).toLowerCase()
  const webPath = '/' + relative(PUBLIC, file).split('\\').join('/')

  // The share cards are generated at an exact size by make-og-images.mjs.
  if (webPath.startsWith('/og/')) continue

  const target = targetFor(webPath)
  if (target == null) continue

  const meta = await sharp(file).metadata()
  if (!meta.width) continue

  const size = (await stat(file)).size
  const needsResize = meta.width > target

  const tmp = file + '.tmp'
  const pipeline = needsResize
    ? sharp(file).resize({ width: target, withoutEnlargement: true })
    : sharp(file)

  const encoder = encode(pipeline, ext)
  if (!encoder) continue

  // Take the new width from the encode result, not a fresh metadata() read —
  // sharp caches metadata per path, so re-reading after the rename reports the
  // pre-resize dimensions.
  const info = await encoder.toFile(tmp)
  const newSize = (await stat(tmp)).size

  // Keep the original if re-encoding didn't actually help.
  if (newSize >= size && !needsResize) {
    await unlink(tmp)
    continue
  }
  await rename(tmp, file)

  rows.push([webPath, meta.width, info.width, size, newSize])
  before += size
  after += newSize
}

if (!rows.length) {
  console.log('\n  Nothing to do — every image is already at its target size.\n')
} else {
  const pad = Math.max(...rows.map((r) => r[0].length))
  console.log()
  for (const [p, w0, w1, s0, s1] of rows) {
    const pct = Math.round((1 - s1 / s0) * 100)
    console.log(
      `  ${p.padEnd(pad)}  ${String(w0).padStart(4)}px → ${String(w1).padStart(4)}px   ` +
        `${(s0 / 1024).toFixed(0).padStart(4)} KB → ${(s1 / 1024).toFixed(0).padStart(4)} KB  (−${pct}%)`,
    )
  }
  console.log(
    `\n  ${rows.length} images   ${(before / 1024 / 1024).toFixed(2)} MB → ` +
      `${(after / 1024 / 1024).toFixed(2)} MB   ` +
      `(−${Math.round((1 - after / before) * 100)}%, saved ${((before - after) / 1024 / 1024).toFixed(2)} MB)\n`,
  )
}
