import { num } from './sheet'

// ============================================================================
// LIVE FUNDRAISER — reading the "Live Settings" and "Live Leaderboard" tabs.
// ============================================================================
// Shared by /leaderboard (which shows everything) and /concert (which only
// needs to know whether to show the button).

// Unlike `isActive` in lib/sheet.js, a blank cell here means OFF. That helper
// treats blank as "on" so a product row nobody ticked still shows up; a switch
// that announces a live fundraiser has to fail the other way.
const isOn = (value) => ['true', 'yes', 'y', '1', 'on'].includes(String(value ?? '').trim().toLowerCase())

// The settings tab is a single row: show | title | goal.
//
// Looking for a row that actually has a `show` or `goal` column doubles as a
// wrong-tab guard: gviz answers a missing or misspelled tab name with the
// *first* sheet instead of an error, and those rows have neither column — so
// until the tab exists the live simply reads as off, with no goal.
export function liveSettings(rows) {
  const row = rows.find((r) => r && ('show' in r || 'goal' in r))
  return {
    show: isOn(row?.show),
    title: String(row?.title ?? '').trim(),
    goal: num(row?.goal),
  }
}

// "Maj  U." and "maj u." are the same donor.
const aliasKey = (alias) => alias.toLowerCase().replace(/\s+/g, ' ')

// Rows are one per donation, so the same alias can appear many times. Returns
// donors ranked by what they've given in total, plus the grand total across
// every row — the progress bar counts all of it, not just the names on show.
//
//   { donors: [{ alias, amount, bank }], total }
//
// A row with no alias still counts toward the total, and is listed as its own
// "Anonymous ARMY" entry: lumping every unnamed donation into one donor would
// put a made-up person at the top of the board.
export function rankDonors(rows) {
  const byAlias = new Map()
  const donors = []
  let total = 0

  for (const r of rows) {
    // Same wrong-tab guard as above — rows from another sheet have no `alias`.
    if (!r || !('alias' in r)) continue
    const amount = num(r.amount)
    if (amount <= 0) continue
    total += amount

    const alias = String(r.alias ?? '').trim()
    const bank = String(r.bank ?? '').trim()

    let donor = alias ? byAlias.get(aliasKey(alias)) : null
    if (!donor) {
      donor = { alias: alias || 'Anonymous ARMY', amount: 0, bank: '' }
      donors.push(donor)
      if (alias) byAlias.set(aliasKey(alias), donor)
    }
    donor.amount += amount
    // Rows are appended over time, so the last one seen is the most recent.
    if (bank) donor.bank = bank
  }

  // Array.prototype.sort is stable: on a tie, whoever got on the board first
  // (higher up the sheet) keeps the higher place.
  donors.sort((a, b) => b.amount - a.amount)
  return { donors, total }
}
