import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSheet, num } from '../lib/sheet'
import { sheets } from '../data/site'
import { fanProjectDays } from '../data/fanProjects'
import SeatmateFinder from '../components/SeatmateFinder'
import {
  TIERS,
  FLOOR_ZONES,
  FLOOR_COLOR,
  STAGE,
  SECTIONS_PER_RING,
  SECTION_GROUPS,
  DEFAULT_SECTION,
  neighbourSection,
  pathPoint,
  sectionSpan,
  findSection,
  seatPosition,
  seatToAcross,
  acrossToSeat,
  MAX_SEAT_NUMBER,
  depthToQueue,
  queueToDepth,
  FLOOR_TICKETS,
  zoneCenter,
  parseSectionRef,
  EVERYONE,
} from '../data/venue'

// ---------------------------------------------------------------------------
// SEAT VIEW — pick a section, see roughly what the stage looks like from it.
// ---------------------------------------------------------------------------
// The stadium itself lives in data/venue.js (measurements) and lib/seatScene.js
// (the 3D drawing). This file is the picker around them.
//
// Layout: the 3D view fills the screen under the navbar, and everything used to
// choose a seat sits in a panel laid over it — a card down the right-hand side
// on a wide screen, a sheet rising from the bottom on a phone. The panel can be
// hidden to see the whole view.
//
// The chosen seat is kept in the URL (?s=110&r=50&p=50) rather than in state,
// so "this is where I'm sitting" is a link you can send to a friend. A link
// with a seat in it opens in that seat; a bare /seat-view opens on the whole
// stadium, ready for a section to be tapped.

const ZOOMS = [1, 2, 3, 5]

// What the headband switch can show: nothing, the headbands availed so far
// (from the sheet), or the goal — every attendee wearing one.
// Which concert days have a fan project the 3D view can show. Days not listed
// still get a tab, marked "soon", until their projects are announced.
const VIEWABLE_PROJECTS = { 'day-1': ['headbands'] }

// The site's logo, for the corner of saved pictures. Loaded once, on first save;
// if it can't be loaded the picture goes out without it.
let logoImage = null
const loadLogo = () => {
  if (!logoImage) {
    logoImage = new Promise((resolve) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => resolve(null)
      image.src = '/logo.png'
    })
  }
  return logoImage
}

// How a day with the headband project is shown: the headbands availed so far,
// or the goal of everyone wearing one.
const HEADBAND_VIEWS = [
  ['current', 'Current'],
  ['all', 'Goal'],
]

// The 3D view (and three.js with it) is most of this page's weight, so it's
// loaded separately: the panel and seat map are usable while it arrives.
const loadScene = () => import('../lib/seatScene')

// Tailwind's `lg` breakpoint: from here up the panel is a side card.
const WIDE = '(min-width: 1024px)'
// How much of the view the side card covers: its 22rem width plus its 1rem margin.
const PANEL_COVERS = 368

// Shared shape of the small buttons along the top of the 3D view.
const chip = 'whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wide transition'

// A 0–100 query value, falling back when it's missing or junk.
const percent = (value, fallback) => {
  const n = Number(value)
  return value !== null && value !== '' && Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback
}

const points = (list) => list.map(([x, z]) => `${x.toFixed(1)},${z.toFixed(1)}`).join(' ')

// Outline of one bleacher section on the 2D map: along its front row, then
// back along its last row.
function sectionOutline(tier, number) {
  const { from, to } = sectionSpan(number)
  const back = tier.offset + tier.rows * tier.depth
  const steps = 4
  const front = []
  const rear = []
  for (let i = 0; i <= steps; i++) {
    const s = from + ((to - from) * i) / steps
    const a = pathPoint(s, tier.offset)
    const b = pathPoint(s, back)
    front.push([a.x, a.z])
    rear.unshift([b.x, b.z])
  }
  return points([...front, ...rear])
}

// The clickable seat map. Pointer-only on purpose — it's 96 small targets, so
// keyboard and screen-reader users get the dropdown beside it instead.
function SeatMap({ selected, seat, onSelect }) {
  const sections = useMemo(
    () =>
      TIERS.flatMap((tier) =>
        Array.from({ length: SECTIONS_PER_RING }, (_, i) => {
          const number = i + 1
          const label = pathPoint(sectionSpan(number).center, tier.offset + (tier.rows * tier.depth) / 2)
          return { id: String(tier.base + number), color: tier.color, outline: sectionOutline(tier, number), label }
        }),
      ),
    [],
  )

  return (
    <svg viewBox="-126 -88 252 176" className="w-full select-none" aria-hidden="true">
      {FLOOR_ZONES.map((zone) => (
        <polygon
          key={zone.id}
          points={points(zone.outline)}
          fill={zone.id === selected ? '#FBC01E' : FLOOR_COLOR}
          stroke="#141414"
          strokeWidth={zone.id === selected ? 1 : 0}
          className="cursor-pointer"
          onClick={() => onSelect(zone.id)}
        />
      ))}

      {FLOOR_ZONES.map((zone) => {
        const [x, z] = zoneCenter(zone)
        return (
          <text
            key={zone.id}
            x={x}
            y={z + 3.5}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#141414"
            pointerEvents="none"
          >
            {zone.name.slice(-1)}
          </text>
        )
      })}

      <g stroke="#141414" strokeLinecap="butt">
        {STAGE.arms.map(([x, z]) => {
          const length = Math.hypot(x, z)
          // Unit vector across the runway, for its cross-piece.
          const cx = (-z / length) * (STAGE.crossLength / 2)
          const cz = (x / length) * (STAGE.crossLength / 2)
          const mx = x * STAGE.crossAt
          const mz = z * STAGE.crossAt
          return (
            <g key={`${x},${z}`} strokeWidth={STAGE.armWidth}>
              <line x1="0" y1="0" x2={x} y2={z} />
              <line x1={mx - cx} y1={mz - cz} x2={mx + cx} y2={mz + cz} />
            </g>
          )
        })}
      </g>
      <circle r={STAGE.radius} fill="#141414" />
      <text y="1.6" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#FBF4DA">
        STAGE
      </text>

      {sections.map((s) => (
        <g key={s.id} className="cursor-pointer" onClick={() => onSelect(s.id)}>
          <polygon
            points={s.outline}
            fill={s.id === selected ? '#FBC01E' : s.color}
            stroke="#141414"
            strokeWidth={s.id === selected ? 1 : 0}
          />
          <text
            x={s.label.x}
            y={s.label.z + 1.5}
            textAnchor="middle"
            fontSize="4.2"
            fontWeight="700"
            fill={s.id === selected ? '#141414' : '#ffffff'}
          >
            {s.id}
          </text>
        </g>
      ))}

      {seat && (
        <circle cx={seat.x} cy={seat.z} r="2.6" fill="#EC1E50" stroke="#ffffff" strokeWidth="1" pointerEvents="none" />
      )}
    </svg>
  )
}

function Slider({ label, from, to, value, onChange }) {
  return (
    <label className="block">
      <span className="font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
        {label}
      </span>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-city-crimson"
      />
      <span className="flex justify-between text-xs font-semibold uppercase tracking-wide text-city-ink/60">
        <span>{from}</span>
        <span>{to}</span>
      </span>
    </label>
  )
}

// Row buttons for a bleacher section, front row first.
//
// ASSUMPTION: rows are numbered 1 upward from the front. If tickets turn out to
// use letters, or count from the back, this is the one place to change it.
function RowPicker({ rows, value, onChange }) {
  return (
    <div>
      <span className="font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
        Row
      </span>
      <div className="mt-2 grid grid-cols-6 gap-1.5">
        {Array.from({ length: rows }, (_, i) => i + 1).map((row) => (
          <button
            key={row}
            type="button"
            onClick={() => onChange(row)}
            aria-pressed={row === value}
            aria-label={`Row ${row}`}
            className={`rounded-lg border-2 py-2 text-sm font-bold transition ${
              row === value
                ? 'border-city-crimson bg-city-crimson text-white'
                : 'border-city-ink/15 hover:border-city-crimson/50'
            }`}
          >
            {row}
          </button>
        ))}
      </div>
      <span className="mt-1.5 flex justify-between text-xs font-semibold uppercase tracking-wide text-city-ink/60">
        <span>1 = front row</span>
        <span>{rows} = back row</span>
      </span>
    </div>
  )
}

// Seat number as printed on the ticket. What's typed is kept as a draft so a
// half-entered number ("36" on the way to "369") isn't rejected mid-keystroke;
// the view only moves once the number is one this section actually holds.
function SeatInput({ value, onSeat }) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => setDraft(String(value)), [value])

  return (
    <label className="block">
      <span className="font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">Seat</span>
      <input
        type="number"
        inputMode="numeric"
        min="1"
        max={MAX_SEAT_NUMBER}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          const n = Number(e.target.value)
          if (Number.isInteger(n) && n >= 1 && n <= MAX_SEAT_NUMBER) onSeat(n)
        }}
        className="mt-2 w-full rounded-lg border-2 border-city-ink/15 bg-white px-3 py-2.5 font-semibold"
      />
      <span className="mt-1.5 block text-xs font-semibold text-city-ink/60">
        The number on your ticket. Its exact spot in the section is our estimate.
      </span>
    </label>
  )
}

// Ticket type and Queue No. for a floor zone. The ticket prints the number as a
// bare "No. 000015", which is why the field spells out what it is.
//
// A queue number is finer than the 0–100 depth the URL keeps, so several
// numbers share one depth. The typed number is therefore left alone as long as
// it still describes the current depth, and only replaced when the depth is
// changed from somewhere else (the slider, a tap on the floor, a new zone).
function QueueInput({ zone, ticket, depth, onChange }) {
  const toDepth = (ticketId, n) => Math.round(queueToDepth(zone, ticketId, n) * 100)
  const [draft, setDraft] = useState(() => String(depthToQueue(zone, depth / 100).number))
  useEffect(() => {
    setDraft((current) => {
      const n = Number(current)
      return current !== '' && n >= 1 && toDepth(ticket, n) === depth
        ? current
        : String(depthToQueue(zone, depth / 100).number)
    })
    // `toDepth` only depends on the zone.
  }, [zone, ticket, depth])

  const { name, count } = FLOOR_TICKETS.find((t) => t.id === ticket)
  const beyond = Number(draft) > count

  return (
    <div>
      <span className="font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
        Ticket
      </span>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {FLOOR_TICKETS.map((t) => (
          <button
            key={t.id}
            type="button"
            // Keeps the number that's typed in: Soundcheck #300 becomes Floor Standing #300.
            onClick={() => onChange({ t: t.id, r: toDepth(t.id, Number(draft) || 1), p: 50 })}
            aria-pressed={t.id === ticket}
            className={`rounded-lg border-2 px-2 py-2 text-sm font-bold transition ${
              t.id === ticket
                ? 'border-city-crimson bg-city-crimson text-white'
                : 'border-city-ink/15 hover:border-city-crimson/50'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <label className="mt-5 block">
        <span className="font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson">
          Queue No.
        </span>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            const n = Number(e.target.value)
            // A queue number says how early you got in, not where along the
            // barricade you went, so typing one puts you in the middle of the
            // zone: number 1 is the centre of the barricade.
            if (e.target.value !== '' && n >= 1) onChange({ t: ticket, r: toDepth(ticket, n), p: 50 })
          }}
          className="mt-2 w-full rounded-lg border-2 border-city-ink/15 bg-white px-3 py-2.5 font-semibold"
        />
        <span className={`mt-1.5 block text-xs font-semibold ${beyond ? 'text-city-crimson' : 'text-city-ink/60'}`}>
          {beyond
            ? `We've assumed about ${count.toLocaleString('en-PH')} ${name} tickets per zone, so this is the view from the back of that group.`
            : 'Use the sliders below to move to where you plan to stand.'}
        </span>
      </label>
    </div>
  )
}

// The section picker, styled like the rest of the panel rather than the
// browser's own dropdown. The list opens in place, pushing the panel's
// contents down instead of floating over them: the panel scrolls, and a list
// floating inside it would be cut off at its edge on a phone.
//
// Keyboard: arrows move, Home/End jump, Enter or Space picks, Escape closes,
// and typing a section number ("2", "23", "233") jumps to it.
function SectionPicker({ groups, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(value)
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const typed = useRef({ text: '', at: 0 })
  const options = useMemo(() => groups.flatMap((g) => g.options), [groups])
  const current = options.find((o) => o.id === value)

  // Opening starts on the chosen section, scrolled into the middle of the list.
  useEffect(() => {
    if (!open) return undefined
    setActive(value)
    const close = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open, value])
  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector(`[data-id="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const pick = (id) => {
    onChange(id)
    setOpen(false)
  }

  const onKeyDown = (e) => {
    const at = options.findIndex((o) => o.id === active)
    const move = (to) => {
      e.preventDefault()
      if (!open) setOpen(true)
      setActive(options[Math.max(0, Math.min(options.length - 1, to))].id)
    }
    if (e.key === 'ArrowDown') return move(at + 1)
    if (e.key === 'ArrowUp') return move(at - 1)
    if (e.key === 'Home') return move(0)
    if (e.key === 'End') return move(options.length - 1)
    if (e.key === 'Escape' && open) {
      e.preventDefault()
      setOpen(false)
      return undefined
    }
    if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault()
      pick(active)
      return undefined
    }
    // Type-ahead: digits build up a section number, a letter picks a floor zone.
    if (/^[0-9a-d]$/i.test(e.key)) {
      const now = Date.now()
      const text = (now - typed.current.at < 900 ? typed.current.text : '') + e.key.toUpperCase()
      typed.current = { text, at: now }
      const match = options.find((o) => o.id.startsWith(text) || o.id === `F${text}`)
      if (match) move(options.indexOf(match))
    }
    return undefined
  }

  return (
    <div ref={rootRef} className="mt-2">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls="section-list"
        aria-activedescendant={open ? `section-${active}` : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={onKeyDown}
        className={`flex w-full items-center justify-between rounded-lg border-2 bg-white px-3 py-2.5 text-left font-semibold transition ${
          open ? 'border-city-crimson' : 'border-city-ink/15 hover:border-city-ink/40'
        }`}
      >
        <span>{current?.name}</span>
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 text-city-crimson transition ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          id="section-list"
          role="listbox"
          aria-label="Section"
          className="mt-1.5 max-h-64 overflow-y-auto rounded-lg border-2 border-city-ink/15 bg-white py-1 shadow-sm"
        >
          {groups.map((group) => (
            <li key={group.label} role="presentation">
              <p className="sticky top-0 bg-city-cream px-3 py-1.5 font-manila-body text-[11px] font-bold uppercase tracking-[0.2em] text-city-crimson">
                {group.label}
              </p>
              <ul role="presentation">
                {group.options.map((o) => (
                  <li
                    key={o.id}
                    id={`section-${o.id}`}
                    data-id={o.id}
                    role="option"
                    aria-selected={o.id === value}
                    onPointerEnter={() => setActive(o.id)}
                    onClick={() => pick(o.id)}
                    className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm font-semibold ${
                      o.id === active ? 'bg-city-crimson/10' : ''
                    } ${o.id === value ? 'text-city-crimson' : ''}`}
                  >
                    {o.name}
                    {o.id === value && <span aria-hidden="true">✓</span>}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function SeatView() {
  const [params, setParams] = useSearchParams()
  const id = findSection(params.get('s')) ? params.get('s') : DEFAULT_SECTION
  const depth = percent(params.get('r'), 50)
  const across = percent(params.get('p'), 50)
  const [mode, setMode] = useState(() => (params.get('s') ? 'seat' : 'overview'))
  const [night, setNight] = useState(true)
  const [crowd, setCrowd] = useState(true)
  // The ARMY Bombs the crowd holds. Only meaningful with the crowd shown.
  const [bombs, setBombs] = useState(true)

  // The SUGA lighted headband fan project: how many headbands are where, live
  // from the sheet. A row can name one section, a floor zone, or a whole tier.
  // Rows that don't name a place and a count are skipped — which also covers
  // the tab not existing, when Google answers with a different tab's rows
  // instead of an error.
  const { rows: headbandRows } = useSheet(sheets.id, sheets.tabs.headbands, [])
  const headbandCounts = useMemo(() => {
    const counts = {}
    for (const row of headbandRows) {
      const section = parseSectionRef(row.section)
      // The count is whichever column mentions headbands ("Availed Headbands").
      const column = Object.keys(row).find((key) => key.includes('headband'))
      const count = Math.round(num(row[column]))
      if (section && count > 0) counts[section] = (counts[section] ?? 0) + count
    }
    return counts
  }, [headbandRows])
  const headbandTotal = Object.values(headbandCounts).reduce((sum, n) => sum + n, 0)
  // The concert day whose fan projects are shown, kept in the link as ?d=2.
  // Choosing a day IS switching its fan projects on: picking Day 1 lights the
  // headbands straight away, and picking it again switches them back off. No
  // day chosen means nothing extra in the view.
  const day = fanProjectDays.find((d) => d.id === `day-${params.get('d')}`) ?? null
  const dayProjects = (day && VIEWABLE_PROJECTS[day.id]) ?? []
  const setDay = (next) => {
    const query = new URLSearchParams(params)
    if (!next || next.id === day?.id) query.delete('d')
    else query.set('d', next.id.replace('day-', ''))
    if (next && next.id !== day?.id) {
      setHeadbands('current')
      // The headbands read best on their own, so the ARMY Bombs go off when a
      // headband day is picked (and come back with any other choice). The
      // switch can still bring them back alongside.
      setBombs(!VIEWABLE_PROJECTS[next.id]?.includes('headbands'))
    } else setBombs(true)
    setParams(query, { replace: true })
  }

  // 'current' or 'all' — see HEADBAND_VIEWS. Shown whenever the chosen day is
  // the one with the headband project; picking that day starts on 'current'.
  const [headbandChoice, setHeadbands] = useState('current')
  const headbands = dayProjects.includes('headbands') ? headbandChoice : 'off'
  const shownHeadbands = headbands === 'all' ? EVERYONE : headbandCounts
  const [hovered, setHovered] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [failed, setFailed] = useState(false)
  // Fetched ahead of time, so the first save doesn't wait on it.
  useEffect(() => {
    loadLogo()
  }, [])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  // The last picture made by "save this view", while it's being shown.
  const [savedImage, setSavedImage] = useState(null)
  // The panel starts open where there's room beside it, and closed on a phone,
  // where it would cover half the view before you'd seen any of it.
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches)
  const [panelOpen, setPanelOpen] = useState(wide)
  useEffect(() => {
    const query = window.matchMedia(WIDE)
    const onChange = () => setWide(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const section = findSection(id)
  const seat = useMemo(() => seatPosition(id, depth / 100, across / 100), [id, depth, across])
  const distance = Math.round(Math.hypot(seat.x, seat.z))

  // `replace` so dragging a slider doesn't stack up a history entry per step.
  const update = (next) => {
    const merged = { s: id, r: depth, p: across, ...next }
    const query = { s: merged.s, r: String(merged.r), p: String(merged.p) }
    if (params.get('d')) query.d = params.get('d')
    // The seat number as printed on the ticket. It goes with the seat: kept
    // while the row or position changes, dropped when the section does or when
    // a new spot is picked by tapping (`n: null`).
    const n = 'n' in next ? next.n : merged.s === id ? params.get('n') : null
    if (n) query.n = String(n)
    // On the floor the link also says which line you're in. Unless a ticket type
    // was chosen outright, it's whichever line stands at that depth — so
    // dragging the slider or tapping the floor moves you between the two.
    const target = findSection(merged.s)
    if (target?.kind === 'floor') query.t = next.t ?? depthToQueue(target.zone, merged.r / 100).ticket
    setParams(query, { replace: true })
    setCopied(false)
  }

  const canvasRef = useRef(null)
  const frameRef = useRef(null)
  const sceneRef = useRef(null)

  // The scene is created once but its callbacks need this render's `update`,
  // so they're read through a ref that's refreshed every render.
  const handlers = useRef({})
  handlers.current = {
    // Tapping a spot in 3D sits you exactly there.
    onPick: ({ id: s, depth: r, across: p }) => {
      update({ s, r: Math.round(r * 100), p: Math.round(p * 100), n: null })
      setMode('seat')
    },
    onHover: setHovered,
    onZoom: setZoom,
  }

  // What the scene should be showing, kept current for the moment it finishes
  // loading — by then the seat or mode may already have been changed.
  const latest = useRef({})
  // How much of the view the panel is hiding. The side card is a fixed width;
  // the phone sheet is as tall as its contents (up to a limit), so it's measured.
  const panelRef = useRef(null)
  const [sheetHeight, setSheetHeight] = useState(0)
  useEffect(() => {
    const panel = panelRef.current
    if (!panel || wide) {
      setSheetHeight(0)
      return undefined
    }
    const observer = new ResizeObserver(() => setSheetHeight(panel.offsetHeight))
    observer.observe(panel)
    return () => observer.disconnect()
  }, [wide, panelOpen])
  const covered = { right: wide && panelOpen ? PANEL_COVERS : 0, bottom: panelOpen ? sheetHeight : 0 }
  latest.current = { seat, id, mode, zoom, night, crowd, bombs, covered, shownHeadbands, headbands }

  useEffect(() => {
    const canvas = canvasRef.current
    let scene
    let observer
    let gone = false

    loadScene()
      .then(({ createSeatScene }) => {
        // Left the page while it was loading.
        if (gone) return
        const now = latest.current
        scene = createSeatScene(canvas, {
          mode: now.mode,
          night: now.night,
          crowd: now.crowd,
          onPick: (spot) => handlers.current.onPick(spot),
          onHover: (s) => handlers.current.onHover(s),
          onZoom: (z) => handlers.current.onZoom(z),
        })
        sceneRef.current = scene
        scene.setCovered(now.covered.right, now.covered.bottom)
        scene.setZoom(now.zoom)
        scene.setSeat(now.seat, now.id)
        scene.setBombs(now.bombs)
        scene.setHeadbands(now.shownHeadbands)
        scene.setHeadbandsShown(now.headbands !== 'off')
        observer = new ResizeObserver(() => scene.resize())
        observer.observe(canvas)
      })
      // The download failed, or there's no WebGL (old device, or the browser
      // has it switched off).
      .catch(() => setFailed(true))
      .finally(() => {
        if (!gone) setLoading(false)
      })

    return () => {
      gone = true
      observer?.disconnect()
      scene?.dispose()
      sceneRef.current = null
    }
    // Created once; later changes go through the effects below.
  }, [])

  // Each of these is a no-op until the scene has loaded; it picks the current
  // values up from `latest` when it does.
  useEffect(() => {
    sceneRef.current?.setSeat(seat, id)
  }, [seat, id])
  useEffect(() => {
    sceneRef.current?.setMode(mode)
  }, [mode])
  useEffect(() => {
    sceneRef.current?.setZoom(zoom)
  }, [zoom])
  useEffect(() => {
    sceneRef.current?.setNight(night)
  }, [night])
  useEffect(() => {
    sceneRef.current?.setCrowd(crowd)
  }, [crowd])
  useEffect(() => {
    sceneRef.current?.setBombs(bombs)
  }, [bombs])
  useEffect(() => {
    sceneRef.current?.setHeadbands(shownHeadbands)
  }, [shownHeadbands])
  useEffect(() => {
    sceneRef.current?.setHeadbandsShown(headbands !== 'off')
  }, [headbands])
  useEffect(() => {
    sceneRef.current?.setCovered(covered.right, covered.bottom)
  }, [covered.right, covered.bottom])

  // Not every browser can put an element fullscreen (iPhone Safari can't), so
  // the button only appears where it will work.
  const [canFullscreen, setCanFullscreen] = useState(false)
  useEffect(() => setCanFullscreen(Boolean(document.fullscreenEnabled)), [])
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else frameRef.current?.requestFullscreen?.().catch(() => {})
  }

  // The current view as a picture with the seat written across the bottom,
  // downloaded straight away.
  const saveImage = async () => {
    const view = sceneRef.current?.snapshot()
    if (!view) return
    const { width, height } = view
    const picture = document.createElement('canvas')
    picture.width = width
    picture.height = height
    const ink = picture.getContext('2d')
    ink.drawImage(view, 0, 0)

    // Sized off the shorter side, so the caption reads the same on a phone
    // screenshot as on a wide desktop one.
    const unit = Math.min(width, height) / 20
    const pad = unit * 0.8
    const shade = ink.createLinearGradient(0, height - unit * 7.5, 0, height)
    shade.addColorStop(0, 'rgba(20, 20, 20, 0)')
    shade.addColorStop(0.45, 'rgba(20, 20, 20, 0.85)')
    shade.addColorStop(1, 'rgba(20, 20, 20, 0.95)')
    ink.fillStyle = shade
    ink.fillRect(0, height - unit * 7.5, width, unit * 7.5)

    const line = (text, size, font, colour, y) => {
      ink.font = `${font} ${size}px ${font.includes('400') ? 'Anton' : 'Barlow'}, system-ui, sans-serif`
      ink.fillStyle = colour
      ink.fillText(text, pad, y, width - pad * 2)
    }
    // The site's mark in the top-left corner: logo, name and a crimson rule.
    const logo = await loadLogo()
    const mark = unit * 1.6
    const markX = pad
    const markY = pad * 0.8
    if (logo) ink.drawImage(logo, markX, markY, mark, mark)
    const nameX = logo ? markX + mark + unit * 0.35 : markX
    ink.textBaseline = 'middle'
    ink.font = `800 ${unit * 0.72}px Poppins, system-ui, sans-serif`
    ink.fillStyle = '#ffffff'
    ink.shadowColor = 'rgba(0, 0, 0, 0.6)'
    ink.shadowBlur = unit * 0.3
    ink.fillText('BTS RE:TURN PH', nameX, markY + mark * 0.38)
    ink.font = `600 ${unit * 0.36}px Barlow, system-ui, sans-serif`
    ink.fillStyle = '#FBC01E'
    ink.fillText('SEAT VIEW · BTS IN THE CITY: MANILA TO BULACAN', nameX, markY + mark * 0.78)
    ink.shadowBlur = 0
    ink.fillStyle = '#EC1E50'
    ink.fillRect(0, 0, width, Math.max(3, unit * 0.12))

    ink.textBaseline = 'alphabetic'
    line(section.name.toUpperCase(), unit * 1.5, '400', '#FBF4DA', height - unit * 3.9)
    line(
      floor ? `${ticket.name} · ${section.zone.side}` : `${section.tierName} · Row ${row} · Seat ${seatNumber}`,
      unit * 0.72,
      '700',
      '#FBC01E',
      height - unit * 2.85,
    )
    line(`About ${distance} m from centre stage`, unit * 0.6, '600', '#FBF4DA', height - unit * 2.05)
    // Says what the pink lights are, when they're in the picture.
    if (headbands !== 'off') {
      line(
        headbands === 'all'
          ? `SUGA lighted headbands · ${day.label} goal: everyone wearing one`
          : `SUGA lighted headbands · ${headbandTotal.toLocaleString('en-PH')} ${day.label} attendees availed so far`,
        unit * 0.5,
        '700',
        '#ff7ab8',
        height - unit * 1.45,
      )
    }
    line(
      'Fan-made estimate, not an official view · btsreturnph.com/seat-view',
      unit * 0.45,
      '500',
      'rgba(251, 244, 218, 0.7)',
      height - unit * 0.9,
    )

    const name = `seat-view-${seatSummary.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`
    // The picture is put on screen first; the download starts only once it has
    // appeared (see startDownload). Doing it the other way round breaks on
    // iPhone: Safari treats a download as the page starting to navigate away
    // and abandons any image still loading, so the picture came up empty.
    setSavedImage({ url: picture.toDataURL('image/jpeg', 0.9), name, downloaded: false, tries: 0 })
  }

  // Downloads the picture being shown, once.
  const startDownload = () => {
    if (!savedImage || savedImage.downloaded) return
    setSavedImage({ ...savedImage, downloaded: true })
    const link = document.createElement('a')
    link.href = savedImage.url
    link.download = savedImage.name
    link.click()
  }

  // The picture didn't load. Try it once more before giving up on showing it —
  // and download it either way, since that never depended on the preview.
  const retryOrGiveUp = () => {
    if (savedImage.tries < 1) {
      setTimeout(() => setSavedImage((image) => image && { ...image, tries: image.tries + 1 }), 400)
      return
    }
    setSavedImage((image) => image && { ...image, broken: true })
  }
  useEffect(() => {
    if (savedImage?.broken) startDownload()
    // Only when the picture is given up on.
  }, [savedImage?.broken])

  const closeSavedImage = () => setSavedImage(null)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      // Clipboard blocked — the address bar already has the same link.
    }
  }

  const floor = section.kind === 'floor'
  // The URL keeps depth as a percentage (the floor has no rows), so a row
  // number is converted on the way in and out. Both directions round to the
  // nearest row, so picking row 7 always reads back as row 7.
  const rows = floor ? 0 : section.tier.rows
  const row = floor ? null : Math.round((depth / 100) * (rows - 1)) + 1
  const setRow = (next) => update({ r: Math.round(((next - 1) / (rows - 1)) * 100) })
  // The ticket's own seat number if one was typed in (kept in the link as ?n=),
  // otherwise our estimate for wherever the seat has been placed.
  const typedSeat = Number(params.get('n'))
  const ticketSeat = Number.isInteger(typedSeat) && typedSeat >= 1 && typedSeat <= MAX_SEAT_NUMBER ? typedSeat : null
  const seatNumber = floor ? null : ticketSeat ?? acrossToSeat(section.number, across / 100)
  // A link without a (valid) ticket type falls back to the line at that depth.
  const ticket = floor
    ? (FLOOR_TICKETS.find((t) => t.id === params.get('t')) ?? FLOOR_TICKETS.find((t) => t.id === depthToQueue(section.zone, depth / 100).ticket))
    : null

  const overlayButton = 'rounded-full bg-city-ink/75 text-city-cream transition hover:bg-city-ink'
  const fieldLabel = 'font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson'
  const seatSummary = floor
    ? `${section.name} · ${ticket.name}`
    : `${section.name} · Row ${row} · Seat ${seatNumber}`

  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      {/* Fills the screen under the 4rem navbar. On a phone it stops a little
          short: the view swallows every touch, so the strip of page left below
          is what you drag to scroll down to the footer. */}
      <div
        ref={frameRef}
        className="relative h-[calc(100dvh-7.5rem)] min-h-[26rem] overflow-hidden bg-city-ink lg:h-[calc(100dvh-4rem-1px)]"
      >
        <h1 className="sr-only">Seat View — BTS WORLD TOUR ARIRANG in Bulacan</h1>
        {/* Focusable, so the keyboard can drive it — see onKey in the scene. */}
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="3D view of the stadium. Arrow keys look around, plus and minus zoom, 0 faces the stage."
          className="absolute inset-0 block h-full w-full cursor-grab touch-none outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-city-yellow active:cursor-grabbing"
        />
        {loading && (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center font-manila text-xl uppercase tracking-wide text-city-cream/80">
            Loading the stadium…
          </p>
        )}
        {failed && (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-city-cream">
            Your browser couldn&rsquo;t start the 3D view. The seat map still shows where your section is.
          </p>
        )}

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-2">
          <div className="pointer-events-auto flex flex-wrap gap-1.5">
            <div className="flex overflow-hidden rounded-full bg-city-ink/75">
              {[
                ['overview', 'Stadium'],
                ['seat', 'My seat'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  aria-pressed={mode === value}
                  className={`${chip} ${mode === value ? 'bg-city-yellow text-city-ink' : 'text-city-cream hover:bg-city-ink'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* On/off switches, lit while on. One word each so the whole row
                fits across a phone. */}
            {/* ARMY Bombs can only be switched while the crowd holding them is
                shown; with the crowd off it's dimmed and reads as off. */}
            {[
              ['Night', night, setNight, true],
              ['Crowd', crowd, setCrowd, true],
              ['ARMY Bombs', bombs && crowd, setBombs, crowd],
            ].map(([label, on, set, enabled]) => (
              <button
                key={label}
                type="button"
                onClick={() => set(!on)}
                disabled={!enabled}
                aria-pressed={on}
                className={`${chip} whitespace-nowrap rounded-full disabled:cursor-not-allowed disabled:opacity-40 ${
                  on ? 'bg-city-cream text-city-ink' : overlayButton
                }`}
              >
                {label}
              </button>
            ))}
            {canFullscreen && (
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Fullscreen"
                className={`${chip} ${overlayButton}`}
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
                </svg>
              </button>
            )}
          </div>
          {/* With the sheet open on a phone, the half of the view that's left is
              too small to spend on a label the sheet already repeats. */}
          {(wide || !panelOpen) && (
            <div className="rounded-lg bg-city-ink/75 px-3 py-2 text-city-cream">
              <p className="font-manila text-lg uppercase leading-none">{section.name}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-city-cream/80">
                {section.tierName}
                {row && ` · Row ${row} · Seat ${seatNumber}`}
                {floor && ` · ${ticket.name} · ${section.zone.side}`} · about {distance} m from centre stage
              </p>
            </div>
          )}
          {/* Where a tap would take you — mouse only, a finger has no hover. */}
          {hovered && hovered !== id && (
            <p className="whitespace-nowrap rounded-full bg-city-yellow px-3 py-1 text-xs font-bold uppercase tracking-wide text-city-ink">
              Sit in {findSection(hovered).name}
            </p>
          )}
        </div>

        {/* Raised on a phone to clear the closed panel's bar along the bottom. */}
        <div className="absolute bottom-[4.5rem] left-3 flex flex-wrap gap-1.5 lg:bottom-4">
          {mode === 'seat' && (
            <button
              type="button"
              onClick={() => sceneRef.current?.faceStage()}
              aria-label="Face the stage"
              title="Face the stage"
              className={`flex h-9 w-9 items-center justify-center ${overlayButton}`}
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="8" r="4.5" />
                <path d="M8 1v3M8 12v3M1 8h3M12 8h3" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={saveImage}
            aria-label="Save this view as an image"
            title="Save this view as an image"
            className={`flex h-9 w-9 items-center justify-center ${overlayButton}`}
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 5.5h2.5L6 3.5h4l1.5 2H14v7.5H2z" strokeLinejoin="round" />
              <circle cx="8" cy="9" r="2.4" />
            </svg>
          </button>
          {mode === 'seat' &&
            [
              [-1, '‹', 'Section to your left'],
              [1, '›', 'Section to your right'],
            ].map(([direction, arrow, label]) => (
              <button
                key={direction}
                type="button"
                onClick={() => update({ s: neighbourSection(id, direction) })}
                aria-label={label}
                className={`h-9 w-9 text-lg font-bold leading-none ${overlayButton}`}
              >
                {arrow}
              </button>
            ))}
          {mode === 'seat'
            ? ZOOMS.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoom(z)}
                  aria-pressed={zoom === z}
                  className={`h-9 w-9 rounded-full text-xs font-bold transition ${
                    zoom === z ? 'bg-city-yellow text-city-ink' : 'bg-city-ink/75 text-city-cream hover:bg-city-ink'
                  }`}
                >
                  {z}×
                </button>
              ))
            : [
                [1 / 1.3, '−', 'Move further away'],
                [1.3, '+', 'Move closer'],
              ].map(([factor, sign, label]) => (
                <button
                  key={sign}
                  type="button"
                  onClick={() => sceneRef.current?.zoomBy(factor)}
                  aria-label={label}
                  className={`h-9 w-9 text-lg font-bold leading-none ${overlayButton}`}
                >
                  {sign}
                </button>
              ))}
        </div>

        {savedImage && (
          <div
            role="dialog"
            aria-label="Your saved view"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-city-ink/90 p-5"
            onClick={closeSavedImage}
          >
            <img
              // Remounted for the second try, so the browser loads it afresh.
              key={savedImage.tries}
              src={savedImage.url}
              onLoad={startDownload}
              alt={`The view from ${seatSummary}`}
              // Sized against the screen, not the box it's in, and never allowed
              // to shrink: iPhone Safari squashes a flex-column image with a
              // percentage height down to a sliver.
              className="h-auto max-h-[50dvh] w-auto max-w-full shrink-0 rounded-xl border-2 border-city-cream/20"
              onClick={(e) => e.stopPropagation()}
              // If the browser can't show it after all, say so rather than
              // leaving an empty box with the alt text in it.
              onError={retryOrGiveUp}
              hidden={savedImage.broken}
            />
            <p className="max-w-sm text-center text-sm text-city-cream">
              {savedImage.broken
                ? 'Your picture should be in your downloads. This browser couldn’t show it here — use Download again if nothing was saved.'
                : 'Your picture should be in your downloads. If nothing was saved, press and hold the picture (or right-click it) and choose to save it.'}
            </p>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <a
                href={savedImage.url}
                download={savedImage.name}
                className="rounded-full border-2 border-city-cream px-5 py-2 text-sm font-bold uppercase tracking-wide text-city-cream transition hover:bg-city-cream hover:text-city-ink"
              >
                Download again
              </a>
              <button
                type="button"
                onClick={closeSavedImage}
                className="rounded-full bg-city-yellow px-5 py-2 text-sm font-bold uppercase tracking-wide text-city-ink"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {panelOpen ? (
          // On a phone the sheet stops at half the view, so there's always some
          // stage left to watch while you change things, and the seat map moves
          // to the end: the fields you type into come first.
          <div
            ref={panelRef}
            className="absolute inset-x-0 bottom-0 flex max-h-[50%] flex-col overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl lg:inset-x-auto lg:bottom-4 lg:right-4 lg:top-4 lg:max-h-none lg:w-[22rem] lg:rounded-2xl [&>*]:shrink-0"
          >
            {/* Pinned to the top of the panel, so Hide is always in reach however
                far down the panel has been scrolled. */}
            <div className="sticky -top-5 z-10 -mx-5 -mt-5 flex items-center justify-between gap-3 border-b border-city-ink/10 bg-white px-5 py-4">
              <h2 className="font-manila text-2xl uppercase leading-none">Find your seat</h2>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="rounded-full border-2 border-city-ink/15 px-3 py-1 text-xs font-bold uppercase tracking-wide transition hover:border-city-ink"
              >
                Hide
              </button>
            </div>

            <div className="mt-4">
              <span className={fieldLabel}>Section</span>
              <SectionPicker
                groups={SECTION_GROUPS}
                value={id}
                onChange={(s) => {
                  update({ s })
                  setMode('seat')
                }}
              />
            </div>

            <div className="order-last mt-6 lg:order-none lg:mt-4">
              <SeatMap
                selected={id}
                seat={seat}
                onSelect={(s) => {
                  update({ s })
                  setMode('seat')
                }}
              />
              <p className="mt-1 text-center text-xs text-city-ink/60">Tap a section on the map to jump there.</p>
            </div>

            <div className="mt-5 space-y-5">
              {floor && <QueueInput zone={section.zone} ticket={ticket.id} depth={depth} onChange={update} />}
              {floor ? (
                <Slider
                  label="How far from the stage"
                  from="Barricade"
                  to="Back of zone"
                  value={depth}
                  onChange={(r) => update({ r })}
                />
              ) : (
                <RowPicker rows={rows} value={row} onChange={setRow} />
              )}
              {floor ? (
                <Slider
                  label="Position in the zone"
                  from="Left"
                  to="Right"
                  value={across}
                  onChange={(p) => update({ p })}
                />
              ) : (
                <SeatInput
                  value={seatNumber}
                  onSeat={(n) => update({ n, p: Math.round(seatToAcross(section.number, n) * 100) })}
                />
              )}
            </div>

            {/* Fan projects, one tab per concert day. A day without a project
                the 3D view can show yet says so instead. */}
            <div className="mt-6 rounded-xl border-2 border-[#ff4fa8]/40 bg-[#ff4fa8]/5 p-4">
              <p className={fieldLabel}>Fan projects</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {fanProjectDays.map((d) => {
                  const ready = Boolean(VIEWABLE_PROJECTS[d.id])
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDay(d)}
                      aria-pressed={d.id === day?.id}
                      className={`rounded-lg border-2 px-1 py-1.5 text-xs font-bold leading-tight transition ${
                        d.id === day?.id
                          ? 'border-city-ink bg-city-ink text-city-cream'
                          : 'border-city-ink/15 bg-white hover:border-city-ink/40'
                      }`}
                    >
                      {d.label}
                      <span className="block text-[10px] font-semibold opacity-70">{ready ? d.date : 'Soon'}</span>
                    </button>
                  )
                })}
              </div>

              {/* The headband view's two ways of looking, right under the days. */}
              {dayProjects.includes('headbands') && headbandTotal > 0 && (
                <>
                    <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                      {HEADBAND_VIEWS.map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setHeadbands(value)}
                          aria-pressed={headbands === value}
                          className={`rounded-lg border-2 px-1 py-2 text-xs font-bold leading-tight transition ${
                            headbands === value
                              ? 'border-[#ff4fa8] bg-[#ff4fa8] text-white'
                              : 'border-city-ink/15 bg-white hover:border-[#ff4fa8]/60'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {headbands === 'all' && (
                      <p className="mt-2 text-xs text-city-ink/60">
                        The goal: every attendee wearing one, in the stands and on the floor.
                      </p>
                    )}
                </>
              )}

              {dayProjects.includes('headbands') && headbandTotal > 0 ? (
                <div className="mt-4">
                  <p className="mt-1 font-bold">SUGA lighted headbands</p>
                  <p className="mt-1 text-sm text-city-ink/70">
                    {headbandTotal.toLocaleString('en-PH')} {day.label} attendees availed so far.{' '}
                    <Link to="/fan-projects" className="font-semibold text-city-crimson underline">
                      About the project
                    </Link>
                  </p>
                  <Link
                    to="/bangtandahan"
                    className="mt-3 block rounded-full bg-city-ink px-5 py-2 text-center text-sm font-bold uppercase tracking-wide text-city-cream transition hover:bg-city-crimson"
                  >
                    Get your headband
                  </Link>
                </div>
              ) : day ? (
                <p className="mt-4 text-sm text-city-ink/70">
                  {day.label} fan projects are coming soon. Check back here to see them light up the stadium.{' '}
                  <Link to="/fan-projects" className="font-semibold text-city-crimson underline">
                    Fan projects
                  </Link>
                </p>
              ) : (
                <p className="mt-3 text-sm text-city-ink/70">Pick a day to see its fan projects light up the stadium.</p>
              )}
            </div>

            <Link
              to="/fanchant"
              className="mt-3 flex items-center justify-between rounded-xl border-2 border-city-ink/10 bg-city-cream px-4 py-3 text-sm font-bold transition hover:border-city-crimson/40"
            >
              <span>
                Practice the fanchants
                <span className="block text-xs font-normal text-city-ink/60">Lyrics and chants for the ARIRANG setlist</span>
              </span>
              <span aria-hidden="true" className="text-city-crimson">
                →
              </span>
            </Link>

            {/* Bleacher seats only: the floor has no seats to sit beside. Keyed
                on the seat, so changing seat starts the finder afresh. */}
            {!floor && (
              <SeatmateFinder
                key={`${id}-${row}-${seatNumber}`}
                section={id}
                row={row}
                seat={seatNumber}
                day={day ? Number(day.id.replace('day-', '')) : null}
              />
            )}

            <button
              type="button"
              onClick={copyLink}
              className="mt-6 w-full rounded-full border-2 border-city-ink px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition hover:bg-city-ink hover:text-city-cream"
            >
              {copied ? 'Link copied' : 'Copy link to this seat'}
            </button>
            <button
              type="button"
              onClick={saveImage}
              disabled={loading || failed}
              className="mt-2 w-full rounded-full bg-city-crimson px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-city-ink disabled:opacity-50"
            >
              Save this view as an image
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-full bg-white px-5 py-3 text-left text-sm font-bold shadow-xl lg:inset-x-auto lg:bottom-auto lg:right-4 lg:top-4"
          >
            <span className="truncate">{seatSummary}</span>
            <span className="shrink-0 uppercase tracking-wide text-city-crimson">Change seat</span>
          </button>
        )}
      </div>

      <section className="py-8">
        <div className="container-page max-w-3xl space-y-3 text-sm text-city-ink/70">
          <p>
            {mode === 'seat'
              ? 'Drag to look around, pinch or scroll to zoom, and tap any other section to move there. The seven figures on the stage are life-size; 1× is about what your phone camera sees.'
              : 'Drag to spin the stadium, pinch or scroll to move closer, and tap any section to sit there. The red pin is your current seat.'}{' '}
            On a keyboard: click the view, then use the arrow keys to look around, + and − to zoom, and 0 to face
            the stage.
          </p>
          <p>
            <strong className="text-city-ink">This is a fan-made estimate, not an official view.</strong>{' '}
            Section numbers and the stage shape follow the official seat map, which is itself only a guide
            and not to scale. Distances, row counts and the steepness of the stands are estimates. The
            screens and towers over the stage are sized by eye from fan photos of earlier shows, and the
            crowd is only there to give a sense of looking over heads. Railings aren&rsquo;t shown. Always
            follow your ticket and the staff on site. Not affiliated with BTS, BIGHIT MUSIC, HYBE, Live
            Nation or the venue.
          </p>
        </div>
      </section>
    </div>
  )
}
