// One-off image optimizer: resizes oversized photos and converts large images
// to WebP, then rewrites their references in src/ and index.html.
// Run with: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { readdir, stat, readFile, writeFile, unlink } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PUBLIC = join(ROOT, 'public');
const MAX_WIDTH = 1920;        // no web use needs wider than this
const QUALITY = 82;            // WebP quality — visually lossless for photos
const SIZE_THRESHOLD = 200_000; // only convert files larger than ~200 KB
const CONVERTIBLE = new Set(['.png', '.jpg', '.jpeg']);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const mapping = {}; // "/about/core.png" -> "/about/core.webp"
const rows = [];
let before = 0, after = 0;

for await (const file of walk(PUBLIC)) {
  const ext = extname(file).toLowerCase();
  if (!CONVERTIBLE.has(ext)) continue;
  const size = (await stat(file)).size;
  if (size < SIZE_THRESHOLD) continue;

  const out = file.slice(0, -ext.length) + '.webp';
  await sharp(file)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);
  const newSize = (await stat(out)).size;
  await unlink(file);

  const webRef = '/' + relative(PUBLIC, file).split('\\').join('/');
  const newRef = webRef.slice(0, -ext.length) + '.webp';
  mapping[webRef] = newRef;
  before += size; after += newSize;
  rows.push([webRef, size, newSize]);
}

// Rewrite references across source files + index.html
const srcFiles = [];
for await (const f of walk(join(ROOT, 'src'))) {
  if (/\.(jsx?|tsx?)$/.test(f)) srcFiles.push(f);
}
srcFiles.push(join(ROOT, 'index.html'));

let edits = 0;
for (const f of srcFiles) {
  let text;
  try { text = await readFile(f, 'utf8'); } catch { continue; }
  let changed = text;
  for (const [oldRef, newRef] of Object.entries(mapping)) {
    changed = changed.split(oldRef).join(newRef);
  }
  if (changed !== text) { await writeFile(f, changed); edits++; }
}

// Report
const kb = (n) => (n / 1024).toFixed(0) + ' KB';
rows.sort((a, b) => b[1] - a[1]);
console.log('\nConverted files:');
for (const [ref, o, n] of rows) {
  const pct = (100 * (1 - n / o)).toFixed(0);
  console.log(`  ${ref}\n     ${kb(o)} -> ${kb(n)}  (-${pct}%)`);
}
console.log(`\n${rows.length} images converted, ${edits} source files updated.`);
console.log(`Total: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB ` +
  `(-${(100 * (1 - after / before)).toFixed(0)}%)`);
