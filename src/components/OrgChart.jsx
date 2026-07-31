import { useEffect, useState } from 'react'
import { driveImage, isActive } from '../lib/sheet'
import { DEPARTMENTS, PM_DEPT } from '../data/team'

// --- Sheet value helpers ---------------------------------------------------

// "MARKETING & SPONSORSHIPS", " marketing  &  sponsorships " → same key.
const norm = (v) => String(v ?? '').trim().toUpperCase().replace(/\s+/g, ' ')

// Rows for one department, honouring `active`. Display order is sheet order —
// to move a fanbase up its column, drag its row up in the tab.
function membersOf(rows, dept) {
  return rows.filter((r) => norm(r.dept) === norm(dept) && isActive(r.active))
}

// Only http(s) links are allowed through to href. The sheet is editable by
// several people, so a pasted `javascript:` URL shouldn't become a live link.
function safeHref(value) {
  const s = String(value ?? '').trim()
  if (!s) return ''
  try {
    return /^https?:$/.test(new URL(s).protocol) ? s : ''
  } catch {
    // Not an absolute URL — assume a bare domain like "instagram.com/x".
    return /^[\w-]+(\.[\w-]+)+\//.test(s) ? `https://${s}` : ''
  }
}

// --- Pieces ----------------------------------------------------------------

// Circular fanbase logo. A Drive file that isn't shared publicly comes back as
// an HTML "request access" page with a 200, which the browser can't decode —
// that still fires onError, so the purple heart stands in for it.
function Avatar({ logo, name, link, size = 'h-14 w-14' }) {
  const src = driveImage(logo)
  const href = safeHref(link)
  const [failed, setFailed] = useState(false)

  // The sheet swaps in over the fallback after mount, so a new URL gets a retry.
  useEffect(() => setFailed(false), [src])

  // With a link, the whole cell becomes the target — logo and name together, so
  // the tap area is usable on mobile and it still works when the logo failed to
  // load and the heart is standing in for it.
  const Wrapper = href ? 'a' : 'div'

  return (
    <Wrapper
      {...(href ? { href, target: '_blank', rel: 'noreferrer' } : {})}
      className={`flex flex-col items-center text-center ${
        href ? 'group transition hover:-translate-y-0.5' : ''
      }`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`${size} rounded-full bg-white object-cover ring-2 ring-purple/40 transition group-hover:ring-purple`}
        />
      ) : (
        <div
          aria-hidden="true"
          className={`${size} flex items-center justify-center rounded-full bg-purple/10 text-2xl leading-none ring-2 ring-purple/25 transition group-hover:ring-purple`}
        >
          💜
        </div>
      )}
      {/* Two lines reserved for the same reason as the department heading: with
          a full roster there are several rows of logos per column, and a
          one-line name next to a two-line one would stagger every row below. */}
      <p
        className={`mt-1.5 min-h-[1.75rem] text-[11px] font-semibold leading-tight text-ink/80 ${
          href ? 'group-hover:text-purple group-hover:underline' : ''
        }`}
      >
        {name}
      </p>
    </Wrapper>
  )
}

function DeptBox({ label, members, tone = 'dept' }) {
  const isPm = tone === 'pm'
  return (
    <div
      className={`rounded-2xl px-4 py-4 ${
        isPm ? 'bg-purple/15 ring-1 ring-purple/25' : 'bg-purple/[0.07] ring-1 ring-purple/15'
      }`}
    >
      {/* Every heading reserves two lines and bottom-aligns inside them, so a
          name that wraps ("Marketing & Sponsorships") doesn't push its column's
          logos a line lower than its neighbours'. min-h rather than a fixed h
          so a three-line name would grow instead of clipping. */}
      <div className="mb-4 flex min-h-[2.1rem] items-end justify-center">
        <h4 className="text-center font-display text-[11px] font-extrabold uppercase tracking-[0.12em] text-purple-dark">
          {label}
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-4">
        {members.map((m, i) => (
          <Avatar key={`${m.fanbase}-${i}`} logo={m.logo} name={m.fanbase} link={m.link} />
        ))}
      </div>
    </div>
  )
}

// --- Chart -----------------------------------------------------------------

// Written out in full (not built by string maths) so Tailwind's scanner finds
// them. A department with no active rows is dropped, so the count can vary.
const COL_CLASS = {
  1: { grid: 'lg:grid-cols-1', bus: 'grid-cols-1' },
  2: { grid: 'lg:grid-cols-2', bus: 'grid-cols-2' },
  3: { grid: 'lg:grid-cols-3', bus: 'grid-cols-3' },
  4: { grid: 'lg:grid-cols-4', bus: 'grid-cols-4' },
  5: { grid: 'lg:grid-cols-5', bus: 'grid-cols-5' },
  6: { grid: 'lg:grid-cols-6', bus: 'grid-cols-6' },
}

export function CoreTeamChart({ rows }) {
  const pm = membersOf(rows, PM_DEPT)
  const depts = DEPARTMENTS.map((d) => ({ ...d, members: membersOf(rows, d.key) })).filter(
    (d) => d.members.length > 0,
  )

  if (!pm.length && !depts.length) return null

  const line = 'bg-purple/30'
  const cols = COL_CLASS[depts.length] ?? COL_CLASS[5]

  return (
    <div className="mx-auto mt-8 max-w-5xl text-left">
      {/* The chart starts at Project Managers — no logo node above it. */}
      {pm.length > 0 && (
        <div className="flex justify-center">
          <div className="w-full max-w-xs">
            <DeptBox label="Project Managers" members={pm} tone="pm" />
          </div>
        </div>
      )}

      {/* PM → bus drop */}
      {depts.length > 0 && (
        <div className="relative mx-auto hidden h-6 lg:block">
          <span className={`absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 ${line}`} />
        </div>
      )}

      {/* Horizontal bus with one drop per department. Built as a grid that
          mirrors the department grid below, so the drops line up with the box
          centres no matter how many departments there are. Each cell paints its
          own half of the bus and overhangs the gap-4 gutter to meet its
          neighbour. */}
      {depts.length > 1 && (
        <div className={`relative hidden h-6 gap-4 lg:grid ${cols.bus}`}>
          {depts.map((d, i) => (
            <div key={d.key} className="relative">
              <span
                className={`absolute top-0 h-0.5 ${line} ${
                  i === 0
                    ? 'left-1/2 -right-4'
                    : i === depts.length - 1
                      ? '-left-4 right-1/2'
                      : '-left-4 -right-4'
                }`}
              />
              <span className={`absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 ${line}`} />
            </div>
          ))}
        </div>
      )}

      {/* Departments. Stacks on mobile, where the connectors are hidden. */}
      {/* mt-4 gives breathing room on mobile, where the connectors are hidden
          and the PM box would otherwise sit flush against the departments. */}
      <div className={`mt-4 grid gap-4 sm:grid-cols-2 lg:mt-0 ${cols.grid}`}>
        {depts.map((d) => (
          <DeptBox key={d.key} label={d.label} members={d.members} />
        ))}
      </div>
    </div>
  )
}

// Flat grid from the "media_partners" tab — no hierarchy, just logo and name.
// Requiring a non-empty `partner` doubles as a wrong-tab guard: gviz answers a
// misspelled tab name with the *first* sheet instead of an error, and those rows
// have no `partner` column, so they all drop out rather than rendering as a wall
// of nameless avatars.
export function MediaPartners({ rows }) {
  const partners = rows.filter((r) => String(r.partner ?? '').trim() && isActive(r.active))
  if (!partners.length) return null

  return (
    <div className="mx-auto mt-8 grid max-w-4xl grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
      {partners.map((p, i) => (
        <Avatar
          key={`${p.partner}-${i}`}
          logo={p.logo}
          name={p.partner}
          link={p.link}
          size="h-16 w-16"
        />
      ))}
    </div>
  )
}
