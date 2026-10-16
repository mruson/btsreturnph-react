import { SUPABASE_URL, supabaseHeaders, isSupabaseConfigured } from '../data/supabase'

// ============================================================================
// SEATMATE FINDER — talking to Supabase.
// ============================================================================
// The table is closed to the public; the page can only call the three
// functions defined in supabase/seatmates.sql. Plain fetch, like the raffle
// form: three POSTs don't justify the Supabase SDK in every visitor's download.

export const PLATFORMS = ['X', 'Threads', 'Instagram', 'TikTok']

// Profile links. Handles are limited to letters, numbers, dots and underscores
// (checked here and again by the database), so they're safe in a URL.
const PROFILE = {
  X: (h) => `https://x.com/${h}`,
  Threads: (h) => `https://www.threads.net/@${h}`,
  Instagram: (h) => `https://www.instagram.com/${h}`,
  TikTok: (h) => `https://www.tiktok.com/@${h}`,
}
export const HANDLE_PATTERN = /^[A-Za-z0-9._]{1,30}$/
export const profileUrl = (platform, handle) =>
  HANDLE_PATTERN.test(handle) && PROFILE[platform] ? PROFILE[platform](handle) : null

// What people paste: "@name", "name", or a whole profile link.
export function cleanHandle(value) {
  const text = String(value ?? '').trim()
  const fromLink = text.match(/(?:x|twitter|threads|instagram|tiktok)\.(?:com|net)\/@?([A-Za-z0-9._]+)/i)?.[1]
  return (fromLink ?? text).replace(/^@+/, '')
}

// Messages for the errors the database raises on purpose.
const REASONS = {
  already_registered:
    'That handle is already saved for this seat from another device. Use “Remove me” on the device you first used, or message us to have it removed.',
  seat_not_in_section: 'That seat number isn’t in this section. Check your ticket and try again.',
}

async function rpc(name, body) {
  if (!isSupabaseConfigured) throw new Error('The seatmate finder isn’t set up yet.')
  let res
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Couldn’t reach the seatmate finder. Check your connection and try again.')
  }
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    // 404: the functions haven't been set up in this Supabase project yet.
    if (res.status === 404) throw new Error('The seatmate finder isn’t available yet. Please check back soon.')
    throw new Error(REASONS[detail.message] ?? 'Something went wrong saving your seat. Please try again.')
  }
  return res.json()
}

// Each browser keeps the private key for every seat it has saved, so it can
// check again or remove itself later. Only ever in this browser: lose it
// (another phone, cleared data) and an admin has to remove the entry.
const storageKey = ({ day, section, row, seat }) => `seatmate:${day}:${section}:${row}:${seat}`

export function savedEntry(seat) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(seat)) ?? 'null')
  } catch {
    return null
  }
}

function remember(seat, entry) {
  try {
    if (entry) localStorage.setItem(storageKey(seat), JSON.stringify(entry))
    else localStorage.removeItem(storageKey(seat))
  } catch {
    // Private mode or blocked storage: it still works, just not across visits.
  }
}

function newKey() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Saves the seat and returns its seatmates: [{ seat, name, handle, platform }].
export async function findSeatmates(seat, { name, handle, platform }) {
  const key = savedEntry(seat)?.key ?? newKey()
  const result = await rpc('find_seatmates', {
    p_day: seat.day,
    p_section: Number(seat.section),
    p_row: seat.row,
    p_seat: seat.seat,
    p_name: name,
    p_handle: handle,
    p_platform: platform,
    p_key: key,
  })
  remember(seat, { id: result.id, key, name, handle, platform })
  return result.seatmates
}

// The seatmates of a seat this browser has already saved, or null if that
// entry no longer exists (removed by an admin, say).
export async function checkSeatmates(seat) {
  const entry = savedEntry(seat)
  if (!entry) return null
  const result = await rpc('my_seatmates', { p_id: entry.id, p_key: entry.key })
  if (!result) remember(seat, null)
  return result?.seatmates ?? null
}

export async function removeSeatmate(seat) {
  const entry = savedEntry(seat)
  if (entry) await rpc('remove_seatmate', { p_id: entry.id, p_key: entry.key })
  remember(seat, null)
}
