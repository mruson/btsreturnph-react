// Date helpers for sheet-driven deadlines.
//
// Everything on this site is announced in Philippine time — "closes August 15,
// 11:59 PM" means 11:59 PM in Manila whether you're reading it in Cebu, Dubai,
// or Toronto. A bare `new Date('2026-08-15 23:59')` would instead be read in
// the *visitor's* timezone, so an ARMY abroad would see the raffle close hours
// early or late. These helpers pin every parsed value to UTC+08:00.

const PH_OFFSET_HOURS = 8

// Build a Date from Philippine wall-clock parts. Subtracting the offset inside
// Date.UTC is safe even when it goes negative — it just rolls into the day before.
function phDate(y, month, d, h, min) {
  return new Date(Date.UTC(y, month - 1, d, h - PH_OFFSET_HOURS, min))
}

// Parse a date cell into a Date, or null if it's blank or unreadable.
//
// Accepts, in order of preference:
//   2026-08-15T23:59+08:00  — explicit offset, used as-is
//   2026-08-15 23:59        — PH wall clock (recommended format for the sheet)
//   2026-08-15              — PH midnight, or 23:59 with { endOfDay: true }
//   8/15/2026 11:59:00 PM   — what Sheets sends when the cell is a real date
//
// `endOfDay` matters for closing times: a raffle whose sheet says it closes on
// "2026-08-15" should run *through* the 15th, not end as the 15th begins.
export function parsePH(value, { endOfDay = false } = {}) {
  if (value == null) return null
  const s = String(value).trim()
  if (!s) return null

  const fallbackH = endOfDay ? 23 : 0
  const fallbackMin = endOfDay ? 59 : 0

  // Already carries a timezone (trailing Z or ±HH:MM) — the string is unambiguous.
  if (/(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(s)) {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? null : d
  }

  // ISO-ish: 2026-08-15, 2026-08-15 23:59, 2026-08-15T23:59
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?/)
  if (m) {
    const hasTime = m[4] != null
    return phDate(
      +m[1],
      +m[2],
      +m[3],
      hasTime ? +m[4] : fallbackH,
      hasTime ? +m[5] : fallbackMin,
    )
  }

  // Sheets' own date formatting: 8/15/2026, or 8/15/2026 11:59:00 PM
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp])?)?/)
  if (m) {
    const hasTime = m[4] != null
    let h = hasTime ? +m[4] : fallbackH
    // 12-hour clock: 12 AM is hour 0, and PM adds 12 to everything but 12 PM.
    if (hasTime && m[6]) {
      const pm = m[6].toLowerCase() === 'p'
      if (h === 12) h = pm ? 12 : 0
      else if (pm) h += 12
    }
    return phDate(+m[3], +m[1], +m[2], h, hasTime ? +m[5] : fallbackMin)
  }

  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

// Format a Date for a <input type="datetime-local">, in Philippine wall-clock
// time — "2026-08-15T23:59".
//
// The input element has no timezone concept: it shows and returns whatever
// local-looking string you give it. So an admin editing from Manila and one
// editing from Toronto must both see PH time, or a deadline shifts by half a
// day depending on who last touched it. Pair this with parsePH() on the way
// back in and the round trip is stable regardless of who's typing.
//
// hourCycle 'h23' matters: the default can render midnight as "24", which the
// input silently rejects.
export function toPHInputValue(date) {
  if (!date) return ''
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const get = (type) => parts.find((p) => p.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

// Render a Date the way it reads in Manila, e.g. "Aug 15, 2026, 11:59 PM".
// Forcing the timezone keeps the printed date matching the countdown beside it.
export function formatPH(date, { withTime = true } = {}) {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(date)
}
