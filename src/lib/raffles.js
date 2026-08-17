import { useCallback, useEffect, useState } from 'react'
import { SUPABASE_URL, isSupabaseConfigured, supabaseHeaders } from '../data/supabase'
import { driveImage } from './sheet'
import { safeUrl } from './safeUrl'

// ============================================================================
// RAFFLES — reading the `raffles` table.
// ============================================================================
// Plain fetch against PostgREST rather than the Supabase SDK: the public raffle
// page needs one GET, and pulling ~45 KB of client library into the bundle every
// visitor downloads to save a few lines is a bad trade. The admin dashboard,
// which needs auth and realtime, uses the SDK — see lib/supabaseClient.js.
//
// Raffle content is world-readable by policy (it's a public web page). Entries
// are a different table with different rules; nothing here can reach them.

const RAFFLES_ENDPOINT = `${SUPABASE_URL}/rest/v1/raffles`

// --- Row → view model ------------------------------------------------------

// Split a multi-line field into clean items, tolerating "1." / "-" / "•"
// prefixes someone typed by hand.
export function splitLines(value) {
  return String(value ?? '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:\d+[.)]|[-•*])\s*/, '').trim())
    .filter(Boolean)
}

// Winner name, optionally followed by a link: "Maj U. | https://x.com/…".
function parseWinnerLine(line) {
  const [name, ...rest] = String(line).split('|')
  const url = rest.join('|').trim()
  return { name: name.trim(), url: /^https?:\/\//i.test(url) ? url : '' }
}

function winnerList(row) {
  const snapshot = Array.isArray(row.winner_entries) ? row.winner_entries : []
  if (snapshot.length) {
    return snapshot
      // The snapshot is admin-written but its `proof` came from an entrant, so
      // it gets the same treatment as anything else typed by a stranger.
      .map((w) => ({ name: String(w?.name || '').trim(), url: safeUrl(w?.proof) || '' }))
      .filter((w) => w.name)
  }
  return String(row.winners || '')
    .split(/\r?\n/)
    .map(parseWinnerLine)
    .filter((w) => w.name)
}

const asDate = (value) => {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function toRaffle(row) {
  return {
    id: row.id,
    slug: String(row.slug || '').trim(),
    title: String(row.title || '').trim(),
    // Selects the campaign theme; see data/campaigns.js.
    campaign: String(row.campaign || '').trim(),
    blurb: String(row.blurb || '').trim(),
    sponsor: String(row.sponsor || '').trim(),
    // Admins usually paste a Drive share link; driveImage turns those into a
    // direct thumbnail and passes ordinary URLs through untouched.
    sponsorLogo: driveImage(row.sponsor_logo_url),
    image: driveImage(row.image_url),
    prize: splitLines(row.prize),
    mechanics: splitLines(row.mechanics),
    // Real timestamps from the database — no wall-clock parsing needed here.
    opens: asDate(row.opens),
    closes: asDate(row.closes),
    announcement: String(row.announcement || '').trim(),
    // Winners come from one of two places, in this order:
    //
    //   winner_entries — the snapshot written when an admin marks entries as
    //     winners in the dashboard. Carries each winner's post URL, so their
    //     name can link to it without anybody retyping a link.
    //   winners (text) — the manual field, still supported. One winner per line;
    //     add "| https://..." after a name to make that name a link.
    //
    // Both normalise to [{ name, url }] so the page renders them identically.
    winners: winnerList(row),
    note: String(row.note || '').trim(),
    proofLabel: String(row.proof_label || '').trim(),
    retired: row.active === false,
    // One entry per social platform (up to four) rather than one in total.
    // Enforced in the database; this copy is only for what the page says.
    perPlatform: row.one_entry_per_platform === true,
  }
}

// upcoming → open → closed → ended.
//
// "closed" is the gap between entries closing and winners being drawn, which can
// be days. The raffle stays on the page through it so everyone who entered still
// sees where they stand. Filling in `winners` promotes it to "ended" and sends it
// to the archive, so a raffle nobody drew keeps asking to be finished.
//
// A raffle with no closing time never ends — treat it as open, so a half-filled
// row still lets people enter rather than showing a dead page.
export function statusOf(raffle, now) {
  if (raffle.retired) return 'ended'
  if (raffle.opens && now < raffle.opens.getTime()) return 'upcoming'
  if (raffle.closes && now >= raffle.closes.getTime()) {
    return raffle.winners.length ? 'ended' : 'closed'
  }
  return 'open'
}

// --- Fetching --------------------------------------------------------------

// PostgREST filter. encodeURIComponent matters — a slug is user-authored, and an
// unescaped value could otherwise alter the query string.
export async function fetchRaffleBySlug(slug) {
  const url =
    `${RAFFLES_ENDPOINT}?select=*&limit=1` +
    `&slug=eq.${encodeURIComponent(slug)}`
  const res = await fetch(url, { headers: supabaseHeaders })
  if (!res.ok) throw new Error(`Supabase responded ${res.status}: ${await res.text()}`)
  const rows = await res.json()
  return rows[0] || null
}

export async function fetchRaffles() {
  const res = await fetch(`${RAFFLES_ENDPOINT}?select=*&order=created_at.desc`, {
    headers: supabaseHeaders,
  })
  if (!res.ok) throw new Error(`Supabase responded ${res.status}: ${await res.text()}`)
  return res.json()
}

// One raffle by slug — for /raffle/:slug, which needs exactly one.
//
// The detail page used to reuse useRaffles() and filter client-side, which meant
// every visit to the most-shared page on the site downloaded all seven raffles
// including their full mechanics and prize text. Fetching one cuts that payload
// by roughly seven times, and it's the page that takes the traffic when a raffle
// is announced.
export function useRaffle(slug) {
  const [state, setState] = useState({
    raffle: null,
    loading: Boolean(slug) && isSupabaseConfigured,
    error: null,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({ raffle: null, loading: false, error: new Error('Supabase not configured') })
      return
    }
    if (!slug) {
      setState({ raffle: null, loading: false, error: null })
      return
    }

    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))

    fetchRaffleBySlug(slug).then(
      (row) => {
        if (!alive) return
        // A missing slug is a legitimate outcome (mistyped URL), not an error —
        // the page renders its not-found panel from `raffle === null`.
        setState({ raffle: row ? toRaffle(row) : null, loading: false, error: null })
      },
      (error) => {
        if (!alive) return
        console.error('Loading raffle failed:', error)
        setState({ raffle: null, loading: false, error })
      },
    )

    return () => {
      alive = false
    }
  }, [slug, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return { ...state, reload }
}

// React hook for the index, which genuinely needs them all.
export function useRaffles() {
  const [state, setState] = useState({
    raffles: [],
    loading: isSupabaseConfigured,
    error: null,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({ raffles: [], loading: false, error: new Error('Supabase not configured') })
      return
    }

    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))

    fetchRaffles().then(
      (rows) => {
        if (!alive) return
        setState({ raffles: rows.map(toRaffle), loading: false, error: null })
      },
      (error) => {
        if (!alive) return
        console.error('Loading raffles failed:', error)
        setState({ raffles: [], loading: false, error })
      },
    )

    return () => {
      alive = false
    }
  }, [attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return { ...state, reload }
}
