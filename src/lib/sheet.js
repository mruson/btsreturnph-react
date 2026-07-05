import { useEffect, useState } from 'react'

// Coerce a sheet cell (e.g. "₱62,000" or "62000") into a plain number.
export function num(value) {
  const n = parseFloat(String(value ?? '').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

// Normalize an image cell value into a usable <img src>. Accepts a Google Drive
// share link, an "open?id="/"uc?id=" link, or a bare Drive file ID, and turns it
// into a direct thumbnail URL. Any other URL or local path is returned unchanged.
export function driveImage(value) {
  if (!value) return value
  const s = String(value).trim()

  // Non-Drive URL (http…) or local path (/concert/…) — use as-is.
  if (!/drive\.google\.com/.test(s) && !/^[-\w]{25,}$/.test(s)) return s

  const id =
    s.match(/\/d\/([-\w]{20,})/)?.[1] ||
    s.match(/[?&]id=([-\w]{20,})/)?.[1] ||
    (/^[-\w]{25,}$/.test(s) ? s : '')

  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000` : s
}

// Fetch a Google Sheet tab as an array of row objects keyed by the header row.
// Uses Google's gviz endpoint — no API key, no backend, no database.
// The sheet must be shared as "Anyone with the link — Viewer" (or published).
export async function fetchSheet(sheetId, sheetName) {
  const url =
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq` +
    `?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheetName)}`

  const res = await fetch(url)
  const text = await res.text()

  // Response is wrapped like: /*O_o*/ google.visualization.Query.setResponse({...});
  const json = JSON.parse(
    text.replace(/^[\s\S]*?setResponse\(/, '').replace(/\);?\s*$/, ''),
  )

  const keys = json.table.cols.map((c) => (c.label || c.id || '').trim().toLowerCase())

  return json.table.rows
    .map((row) => {
      const obj = {}
      row.c.forEach((cell, i) => {
        const key = keys[i]
        if (key) obj[key] = cell ? (cell.f != null ? cell.f : cell.v) : ''
      })
      return obj
    })
    // Drop fully-empty trailing rows.
    .filter((obj) => Object.values(obj).some((v) => v !== '' && v != null))
}

// React hook: returns `fallback` immediately, then swaps in live sheet data
// once it loads. Silently keeps the fallback if the sheet isn't set up or the
// fetch fails, so the page always renders.
export function useSheet(sheetId, sheetName, fallback = []) {
  const [rows, setRows] = useState(fallback)

  useEffect(() => {
    if (!sheetId) return
    let alive = true
    fetchSheet(sheetId, sheetName)
      .then((data) => {
        if (alive && data.length) setRows(data)
      })
      .catch(() => {
        /* keep fallback on any error */
      })
    return () => {
      alive = false
    }
  }, [sheetId, sheetName])

  return rows
}
