import { useCallback, useEffect, useState } from 'react'

// Coerce a sheet cell (e.g. "₱62,000" or "62000") into a plain number.
export function num(value) {
  const n = parseFloat(String(value ?? '').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

// The gviz response hands back the *formatted* cell value, so an unchecked
// checkbox arrives as the string "FALSE" — which is truthy in JS. Anything not
// explicitly falsey counts as active, including a blank cell, so a row nobody
// remembered to tick still shows up rather than silently vanishing.
export function isActive(value) {
  if (value === '' || value == null) return true
  return !['false', 'no', '0', 'n'].includes(String(value).trim().toLowerCase())
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

// Splits CSV text into rows of cells, honouring quoted cells (which may hold
// commas, doubled quotes and line breaks).
function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += c
  }
  if (cell !== '' || row.length) rows.push([...row, cell])
  return rows
}

// A tab named by its gid (the number after #gid= in the tab's URL) instead of
// its name: read through the plain CSV export, which hands back exactly what's
// in each cell.
//
// That matters for a column mixing numbers and text. The gviz endpoint guesses
// one type per column from the majority of its cells and blanks out the rest —
// so in a "section" column of 101, 102 … and "Section A", every "Section A"
// silently came back empty.
//
// `block` reads one table out of a free-form tab (a report with several tables
// stacked down the page): the row holding that title is found by its text, the
// row after it is the header, and the table runs to the first blank row. Found
// by title rather than row number, so rows added above it don't break the read.
// If the title isn't there, the result is empty rather than some other table.
async function fetchSheetByGid(sheetId, gid, block) {
  const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`)
  if (!res.ok) throw new Error(`Sheet export failed (${res.status})`)
  let table = parseCsv(await res.text())
  if (block) {
    const want = block.trim().toLowerCase()
    const title = table.findIndex((cells) => cells.some((c) => c.trim().toLowerCase() === want))
    if (title < 0) return []
    table = table.slice(title + 1)
    const end = table.findIndex((cells, i) => i > 0 && cells.every((c) => c.trim() === ''))
    if (end >= 0) table = table.slice(0, end)
  }
  const [header = [], ...rows] = table
  const keys = header.map((h) => h.trim().toLowerCase())
  return rows
    .map((cells) => Object.fromEntries(keys.map((key, i) => [key, cells[i] ?? ''])))
    .filter((obj) => Object.values(obj).some((v) => v !== ''))
}

// Fetch a Google Sheet tab as an array of row objects keyed by the header row.
// Uses Google's gviz endpoint — no API key, no backend, no database.
// The sheet must be shared as "Anyone with the link — Viewer" (or published).
// `sheetName` may also be { gid } — see fetchSheetByGid for when that's needed.
export async function fetchSheet(sheetId, sheetName) {
  if (sheetName && typeof sheetName === 'object') return fetchSheetByGid(sheetId, sheetName.gid, sheetName.block)
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

const keyFor = (sheetId, sheetName) =>
  `${sheetId}::${typeof sheetName === 'object' ? `gid:${sheetName.gid}:${sheetName.block ?? ''}` : sheetName}`

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

// Polling variant of useSheet, for a tab that changes while people watch it —
// the live fundraiser leaderboard. Differences from useSheet, all on purpose:
//
//   - it re-reads the tab every `intervalMs` instead of trusting the 5-minute
//     cache, so the page moves on its own during a live;
//   - an empty tab is a real answer (a new live starts from a cleared sheet),
//     so there's no fallback to cling to;
//   - a failed refresh keeps the rows already on screen rather than blanking a
//     page that was working a moment ago.
//
// Polling stops while the browser tab is in the background and catches up the
// moment it's looked at again, so a phone left open overnight isn't hitting
// Google every 30 seconds for nobody.
export function useLiveSheet(sheetId, sheetName, intervalMs = 30 * 1000) {
  const key = keyFor(sheetId, sheetName)

  const [state, setState] = useState(() => {
    const hit = cache.get(key)
    return hit
      ? { rows: hit.rows, loading: false, error: null, updatedAt: hit.at }
      : { rows: [], loading: Boolean(sheetId), error: null, updatedAt: null }
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!sheetId) return

    let alive = true
    const load = () => {
      if (document.visibilityState === 'hidden') return
      fetchSheet(sheetId, sheetName).then(
        (data) => {
          const at = Date.now()
          cache.set(key, { rows: data, at })
          if (alive) setState({ rows: data, loading: false, error: null, updatedAt: at })
        },
        (err) => {
          if (alive) setState((s) => ({ ...s, loading: false, error: err }))
        },
      )
    }

    load()
    const timer = setInterval(load, intervalMs)
    document.addEventListener('visibilitychange', load)
    return () => {
      alive = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', load)
    }
  }, [sheetId, sheetName, key, intervalMs, attempt])

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }))
    setAttempt((n) => n + 1)
  }, [])

  return { ...state, reload }
}
