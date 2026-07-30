import { useCallback, useEffect, useState } from 'react'

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

// --- Cache -----------------------------------------------------------------
// Without this, every visit to a page refetches its tab from Google — including
// when you navigate away and back. Rows are shared per tab across components,
// so the two useSheet calls on /about hit the network once each, not twice.
const cache = new Map() // key -> { rows, at }
const inflight = new Map() // key -> Promise, so parallel mounts share one request

const CACHE_MS = 5 * 60 * 1000 // re-fetch at most once every 5 minutes

const keyFor = (sheetId, sheetName) => `${sheetId}::${sheetName}`

// Drop everything cached — used by the retry button, which should always go to
// the network rather than replay a failure.
export function clearSheetCache() {
  cache.clear()
  inflight.clear()
}

// React hook for one sheet tab.
//
//   const { rows, loading, error, reload } = useSheet(id, 'Sponsors', [])
//
// `rows` is `fallback` until real data arrives, so a page always renders. Use
// `loading` to show a skeleton instead of an empty section, and `error` to tell
// people the data didn't load rather than silently showing nothing.
export function useSheet(sheetId, sheetName, fallback = []) {
  const key = keyFor(sheetId, sheetName)

  // Seed from cache when we already have this tab — navigating back to a page
  // then shows its data immediately, with no skeleton flash.
  const [state, setState] = useState(() => {
    const hit = cache.get(key)
    return hit
      ? { rows: hit.rows, loading: false, error: null }
      : { rows: fallback, loading: Boolean(sheetId), error: null }
  })

  // Bumped by reload() to re-run the effect.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!sheetId) {
      setState((s) => ({ ...s, loading: false }))
      return
    }

    const hit = cache.get(key)
    if (hit && Date.now() - hit.at < CACHE_MS) {
      setState({ rows: hit.rows, loading: false, error: null })
      return
    }

    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))

    let request = inflight.get(key)
    if (!request) {
      request = fetchSheet(sheetId, sheetName)
      inflight.set(key, request)
      // Clear the slot however it settles, so a failure isn't cached forever.
      request.finally(() => {
        if (inflight.get(key) === request) inflight.delete(key)
      })
    }

    request.then(
      (data) => {
        // An empty result usually means the tab is missing or misnamed rather
        // than genuinely empty, so keep the fallback — matching the original
        // behaviour, which pages like /about rely on for their seeded lists.
        if (data.length) cache.set(key, { rows: data, at: Date.now() })
        if (!alive) return
        setState((s) => ({
          rows: data.length ? data : s.rows,
          loading: false,
          error: null,
        }))
      },
      (err) => {
        if (!alive) return
        setState((s) => ({ rows: s.rows, loading: false, error: err }))
      },
    )

    return () => {
      alive = false
    }
  }, [sheetId, sheetName, key, attempt])

  const reload = useCallback(() => {
    cache.delete(key)
    inflight.delete(key)
    setAttempt((n) => n + 1)
  }, [key])

  return { rows: state.rows, loading: state.loading, error: state.error, reload }
}
