// ============================================================================
// VENUE MODEL — Philippine Sports Stadium, as laid out for BTS WORLD TOUR
// 'ARIRANG' IN BULACAN. Feeds both the 2D picker and the 3D view on /seat-view.
// ============================================================================
// Everything here is traced from the official seat map, which itself says it
// "serves only as a guide" and "is not a scaled representation of the stage".
// What the map does give us reliably:
//   - two rings of 46 sections each: Bleachers 1 (101–146) inside, Bleachers 2
//     (201–246) outside, numbered the same way round
//   - 110/210 sit mid-way along one long side, 133/233 opposite, and the short
//     ends are split between 121|122 and 144|145
//   - a round centre stage with four diagonal runways, each with a cross-piece
//   - four standing zones between the runways
//
// What it does NOT give us — and what is therefore an estimate you should tune
// once real numbers are known — is every measurement in metres below: the size
// of the bowl, how many rows each tier has, how steep it is, how long the
// runways are. Change the constants; the map and the 3D view both follow.
//
// Coordinates are metres on the ground: +x is right and +z is DOWN on the seat
// map (so 110 is at +z, 133 at −z). Height is handled by the 3D scene.

export const SECTIONS_PER_RING = 46

// Front-row frontage of one section. The bowl is a rounded rectangle whose
// perimeter is exactly 46 of these: 9 along each long side, 2 along each short
// end, and 6 around each corner — which is how the sections fall on the map.
const U = 11
const HX = 4.5 * U // half of a long straight
const HZ = 1 * U // half of a short straight
const R = (12 * U) / Math.PI // corner radius: a quarter circle 6 sections long
export const PERIMETER = SECTIONS_PER_RING * U

// Aisle between neighbouring sections, as a fraction of a section's width.
const AISLE = 0.06

// `offset` is how far back from the front row a tier starts, `y` how high its
// first row sits, `depth`/`rise` the size of one step.
//
// 12 rows a tier is the organisers' estimate of the stadium's maximum. It also
// squares with the capacity: 92 sections × 12 rows × about 20 seats is roughly
// 22,000 against the published 25,000. Bleachers 2 starts 3.4 m behind and
// 2.7 m above the last row of Bleachers 1 — if you change the row count again,
// move its `offset` and `y` to keep that gap.
export const TIERS = [
  { id: 'b1', name: 'Bleachers 1', base: 100, color: '#C9A0F5', rows: 12, depth: 0.85, rise: 0.42, offset: 0, y: 1.6 },
  { id: 'b2', name: 'Bleachers 2', base: 200, color: '#4A8DBF', rows: 12, depth: 0.85, rise: 0.55, offset: 13.6, y: 9.3 },
]

export const FLOOR_COLOR = '#FF8A93'

// The four standing zones are lettered clockwise from the top of the seat map:
// A north (133 side), B east (144–145), C south (110), D west (121–122). The
// lettering comes from the organisers and from tickets ("SOUNDCHECK B"); the
// official map itself doesn't label them, and colours VIP Soundcheck and Floor
// Standing the same.
//
// `outline` is the whole zone. `front` is the part of that outline with a
// barricade facing the stage or a runway — everything except the back — listed
// left to right as seen by someone in the zone facing the stage. In B and D
// that's the two runway sides meeting at the point nearest the stage; in A and
// C it's a runway side, the stretch facing the centre stage, and the other
// runway side. Where you stand is measured from this line (see zoneField).
export const FLOOR_ZONES = [
  {
    id: 'FA',
    name: 'Floor A',
    side: '133 side',
    outline: [[20, -25], [-20, -25], [-48, -46], [48, -46]],
    front: [[48, -46], [20, -25], [-20, -25], [-48, -46]],
  },
  {
    id: 'FB',
    name: 'Floor B',
    side: '144–145 side',
    outline: [[24, 0], [54, -28], [66, -28], [76, -16], [76, 16], [66, 28], [54, 28]],
    front: [[54, 28], [24, 0], [54, -28]],
  },
  {
    id: 'FC',
    name: 'Floor C',
    side: '110 side',
    outline: [[-20, 25], [20, 25], [48, 46], [-48, 46]],
    front: [[-48, 46], [-20, 25], [20, 25], [48, 46]],
  },
  {
    id: 'FD',
    name: 'Floor D',
    side: '121–122 side',
    outline: [[-24, 0], [-54, 28], [-66, 28], [-76, 16], [-76, -16], [-66, -28], [-54, -28]],
    front: [[-54, -28], [-24, 0], [-54, 28]],
  },
]

// Runways run from the centre to each `arms` point; `crossAt` is how far along
// (0–1) the cross-piece sits.
export const STAGE = {
  radius: 12,
  height: 2.2,
  arms: [[42, 30], [-42, 30], [-42, -30], [42, -30]],
  armWidth: 4.5,
  crossAt: 0.55,
  crossLength: 12,
}

// What hangs over the centre stage, estimated from fan photos of earlier
// ARIRANG shows — none of this is on the seat map, and every number is a guess
// at scale. It matters for views more than anything else on the stage: the
// towers are the one thing that can stand between a seat and the members.
//   - four truss towers on the edge of the centre stage, one where each runway
//     leaves it, so the view from the middle of each floor zone runs between two
//   - big screens hung from them, well above head height: one between each
//     pair of towers, facing a floor zone, and a wing running outward from
//     each tower above its runway, showing a picture on both sides. From any
//     side you see a screen straight ahead with a wing angled in toward you on
//     either side of it.
//   - a lighting grid under the screens
export const RIG = {
  towerAt: 13,
  towerWidth: 1.8,
  towerHeight: 22,
  wingLength: 13,
  screenBottom: 14,
  screenHeight: 8,
  gridHeight: 12.8,
}

// The two long sides are roofed and the ends are open — taken from photos and a
// fan-made 3D model of the stadium. Each span is [from, to] along the front-row
// line (see pathPoint): the full straight plus three sections into each corner,
// centred on 110 and on 133.
export const ROOF_SPANS = [
  [-7.5 * U, 7.5 * U],
  [15.5 * U, 30.5 * U],
]

// Eye height above whatever you're sitting or standing on.
const EYE_SEATED = 1.15
// Someone about 1.6 m tall — in the middle of the crowd the 3D view draws, so
// floor views look between heads rather than over them.
const EYE_STANDING = 1.5

// A point on the front-row line, `s` metres round from the middle of 110 in
// the direction the section numbers climb, pushed `offset` metres back into the
// stands. Returns the outward direction too.
export function pathPoint(s, offset = 0) {
  let t = ((s % PERIMETER) + PERIMETER) % PERIMETER
  const quarter = (Math.PI * R) / 2
  const corner = (cx, cz, from) => {
    const a = from + t / R
    const nx = Math.cos(a)
    const nz = Math.sin(a)
    return { x: cx + (R + offset) * nx, z: cz + (R + offset) * nz, nx, nz }
  }
  const edge = HZ + R + offset
  const side = HX + R + offset

  if (t < HX) return { x: -t, z: edge, nx: 0, nz: 1 }
  t -= HX
  if (t < quarter) return corner(-HX, HZ, Math.PI / 2)
  t -= quarter
  if (t < 2 * HZ) return { x: -side, z: HZ - t, nx: -1, nz: 0 }
  t -= 2 * HZ
  if (t < quarter) return corner(-HX, -HZ, Math.PI)
  t -= quarter
  if (t < 2 * HX) return { x: -HX + t, z: -edge, nx: 0, nz: -1 }
  t -= 2 * HX
  if (t < quarter) return corner(HX, -HZ, (3 * Math.PI) / 2)
  t -= quarter
  if (t < 2 * HZ) return { x: side, z: -HZ + t, nx: 1, nz: 0 }
  t -= 2 * HZ
  if (t < quarter) return corner(HX, HZ, 0)
  t -= quarter
  return { x: HX - t, z: edge, nx: 0, nz: 1 }
}

// Where a section number (1–46) sits along the front-row line.
export function sectionSpan(number) {
  const center = (number - 10) * U
  const half = (U * (1 - AISLE)) / 2
  return { from: center - half, to: center + half, center }
}

// Every pickable place, in the order the dropdown lists them.
export const SECTION_GROUPS = [
  {
    label: 'Floor · Soundcheck and Standing',
    options: FLOOR_ZONES.map((z) => ({ id: z.id, name: `${z.name} (${z.side})` })),
  },
  ...TIERS.map((tier) => ({
    label: tier.name,
    options: Array.from({ length: SECTIONS_PER_RING }, (_, i) => ({
      id: String(tier.base + i + 1),
      name: `Section ${tier.base + i + 1}`,
    })),
  })),
]

export const DEFAULT_SECTION = '110'

// Looks a section id up: { kind: 'stand', tier, number } for the bleachers,
// { kind: 'floor', zone } for a standing zone, null for anything else.
export function findSection(id) {
  const zone = FLOOR_ZONES.find((z) => z.id === id)
  if (zone) return { kind: 'floor', zone, name: zone.name, tierName: 'Floor' }
  const n = Number(id)
  const tier = TIERS.find((t) => n > t.base && n <= t.base + SECTIONS_PER_RING)
  if (!tier || !Number.isInteger(n)) return null
  return { kind: 'stand', tier, number: n - tier.base, name: `Section ${n}`, tierName: tier.name }
}

const mix = (a, b, t) => a + (b - a) * t

export function insidePolygon(polygon, x, z) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i]
    const [xj, zj] = polygon[j]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

// How many metres a point on the floor is behind the nearest stretch of its
// zone's barricade.
function behindFront(zone, x, z) {
  const { front } = zone
  let nearest = Infinity
  for (let i = 0; i < front.length - 1; i++) {
    const [ax, az] = front[i]
    const [bx, bz] = front[i + 1]
    const t = Math.min(1, Math.max(0, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / ((bx - ax) ** 2 + (bz - az) ** 2)))
    nearest = Math.min(nearest, Math.hypot(x - (ax + (bx - ax) * t), z - (az + (bz - az) * t)))
  }
  return nearest
}

// How much being off to the side counts against a spot, next to being further
// from the barricade: standing 10 m along the rail from its centre is rated the
// same as standing 1.5 m behind the centre. It's what makes queue number 1 the
// middle of the barricade rather than anywhere on it. A GUESS at how a crowd
// behaves — nearer 0 and early numbers string out along the whole rail, higher
// and they bunch up behind the centre.
const CENTRE_PULL = 0.15

// The point of a zone's barricade nearest the centre stage: the best spot in
// the zone, and where the first person through the gate is assumed to go.
function frontCentre(zone) {
  let best = zone.front[0]
  for (let i = 0; i < zone.front.length - 1; i++) {
    const [ax, az] = zone.front[i]
    const [bx, bz] = zone.front[i + 1]
    const t = Math.min(1, Math.max(0, -(ax * (bx - ax) + az * (bz - az)) / ((bx - ax) ** 2 + (bz - az) ** 2)))
    const point = [ax + (bx - ax) * t, az + (bz - az) * t]
    if (Math.hypot(...point) < Math.hypot(...best)) best = point
  }
  return best
}

// A zone as a grid of standing spots half a metre apart. Each has a `back`
// score — metres behind the barricade, plus a little for being off-centre (see
// CENTRE_PULL) — and an `along`: how far across the zone it is from left (0)
// to right (1) as you face the stage. Positions on the floor are looked up in
// this rather than calculated, because the zones aren't simple shapes.
//
// `spots` is sorted best first, which is the order the zone is assumed to fill
// in: the middle of the barricade, then outward along it and back from it. So
// "a quarter of the way through the list" is where the crowd reaches once a
// quarter of the ticket holders are in.
const fields = new Map()
function zoneField(zone) {
  if (fields.has(zone.id)) return fields.get(zone.id)
  const best = frontCentre(zone)
  const score = (x, z) => behindFront(zone, x, z) + CENTRE_PULL * Math.hypot(x - best[0], z - best[1])
  const xs = zone.outline.map((p) => p[0])
  const zs = zone.outline.map((p) => p[1])
  const spots = []
  for (let x = Math.min(...xs) + 0.25; x < Math.max(...xs); x += 0.5) {
    for (let z = Math.min(...zs) + 0.25; z < Math.max(...zs); z += 0.5) {
      if (insidePolygon(zone.outline, x, z)) spots.push({ x, z, back: score(x, z) })
    }
  }
  spots.sort((a, b) => a.back - b.back)

  const center = [
    spots.reduce((sum, s) => sum + s.x, 0) / spots.length,
    spots.reduce((sum, s) => sum + s.z, 0) / spots.length,
  ]
  // "Right", for someone at the middle of the zone looking at the centre stage.
  const reach = Math.hypot(center[0], center[1])
  const right = [center[1] / reach, -center[0] / reach]
  const sideways = (x, z) => x * right[0] + z * right[1]
  const offsets = spots.map((s) => sideways(s.x, s.z))
  const leftmost = Math.min(...offsets)
  const width = Math.max(...offsets) - leftmost
  const along = (x, z) => Math.min(1, Math.max(0, (sideways(x, z) - leftmost) / width))
  spots.forEach((s) => {
    s.along = along(s.x, s.z)
  })

  const field = { spots, center, width, along, score, deepest: spots[spots.length - 1].back }
  fields.set(zone.id, field)
  return field
}

// The middle of a zone as [x, z], for putting its letter on.
export const zoneCenter = (zone) => zoneField(zone).center

// Where your eyes are. `depth` runs 0 (front row / closest to the stage) to 1
// (back row / furthest from it); `across` runs 0 (far left as you face the
// stage) to 1 (far right).
export function seatPosition(id, depth, across) {
  const section = findSection(id)
  if (!section) return null

  if (section.kind === 'floor') {
    // The spot whose place in the crowd and left-to-right position come
    // closest to what was asked for. Place in the crowd counts double: deep in a zone
    // there may be no spot as far left or right as requested, and it's better
    // to slide sideways than to move someone forward or back in the crowd.
    const field = zoneField(section.zone)
    const back = depth * field.deepest
    let best = field.spots[0]
    let bestCost = Infinity
    for (const spot of field.spots) {
      const cost = 4 * (spot.back - back) ** 2 + ((spot.along - across) * field.width) ** 2
      if (cost < bestCost) {
        bestCost = cost
        best = spot
      }
    }
    return { x: best.x, y: EYE_STANDING, z: best.z }
  }

  const { tier, number } = section
  const { from, to } = sectionSpan(number)
  // Facing the field, section numbers climb to your left.
  const s = mix(to, from, across)
  const row = Math.round(depth * (tier.rows - 1))
  const p = pathPoint(s, tier.offset + (row + 0.5) * tier.depth)
  return { x: p.x, y: tier.y + row * tier.rise + EYE_SEATED, z: p.z }
}

// The reverse of seatPosition for a standing zone: the depth/across of a point
// on the ground.
export function floorSpotAt(zone, x, z) {
  const field = zoneField(zone)
  return { depth: Math.min(1, field.score(x, z) / field.deepest), across: field.along(x, z) }
}

// The section one step to your left (-1) or right (+1) as you face the stage,
// wrapping round the ring. On the floor it steps through the four zones.
export function neighbourSection(id, direction) {
  const section = findSection(id)
  if (!section) return id
  if (section.kind === 'floor') {
    const i = FLOOR_ZONES.indexOf(section.zone)
    return FLOOR_ZONES[(i - direction + FLOOR_ZONES.length) % FLOOR_ZONES.length].id
  }
  // Section numbers climb to your left.
  const number = ((section.number - 1 - direction + SECTIONS_PER_RING) % SECTIONS_PER_RING) + 1
  return String(section.tier.base + number)
}

// --- Seat numbers -----------------------------------------------------------
// Worked out from two real tickets, one in each tier:
//   Bleachers 1, section 116, row 2, seats 368–369
//   Bleachers 2, section 232, row 1, seats 759–760
// Seat numbers that high can't restart in each section. They fit if every row
// is numbered once round the whole ring, starting in section x01, with 24 seats
// to a section — 361–384 in x16, 745–768 in x32. For each ticket on its own, 24
// is the only whole number of seats per section that lands the pair in the
// right section, and the two tickets are 16 sections and a corner apart.
//
// Still not known: which way the numbers run within a section. They're assumed
// to climb the same way the section numbers do — to your left as you face the
// stage. Nor is it confirmed that row 1 is the front row.
export const SEATS_PER_SECTION = 24

// The seat numbers a section holds, by the theory above.
export function seatRange(number) {
  const first = (number - 1) * SEATS_PER_SECTION + 1
  return { first, last: first + SEATS_PER_SECTION - 1 }
}

// Seat number → `across` (0 left … 1 right), or null if that seat isn't in the
// section — which is also how a ticket that breaks the theory shows itself.
export function seatToAcross(number, seat) {
  const { first, last } = seatRange(number)
  if (!Number.isInteger(seat) || seat < first || seat > last) return null
  return 1 - (seat - first + 0.5) / SEATS_PER_SECTION
}

export function acrossToSeat(number, across) {
  const index = Math.min(SEATS_PER_SECTION, Math.max(1, Math.ceil((1 - across) * SEATS_PER_SECTION)))
  return seatRange(number).first + index - 1
}

// --- Queue numbers ----------------------------------------------------------
// The floor has no seats. A ticket carries a queue number — your place in line
// at the gate — and the floor fills from the stage outward, so a low number
// ends up near the barricade and a high one further back.
//
// Each zone has two lines, let in in this order: Soundcheck first, then Floor
// Standing. The counts are the organisers' working figures PER ZONE, not
// official ones — change them here and every queue number shifts to match.
// Someone at Floor Standing #1 therefore stands behind all 2,500 Soundcheck
// holders, and the last Floor Standing holder is at the back of the zone.
export const FLOOR_TICKETS = [
  { id: 'sc', name: 'Soundcheck', count: 2500 },
  { id: 'fs', name: 'Floor Standing', count: 4000 },
]

const ZONE_CAPACITY = FLOOR_TICKETS.reduce((sum, t) => sum + t.count, 0)

// How far back (0–1) queue number `n` of a ticket type stands. The crowd is
// assumed to fill each zone evenly, best spots first (see zoneField): number 1
// takes the middle of the barricade, the next hundred or so spread along the
// rest of the rail, and everyone after stands behind them.
// A number above that type's count is treated as its last one — for Floor
// Standing, that's the very back of the zone.
export function queueToDepth(zone, ticketId, n) {
  let ahead = 0
  for (const ticket of FLOOR_TICKETS) {
    if (ticket.id === ticketId) {
      ahead += Math.min(Math.max(1, n), ticket.count)
      break
    }
    ahead += ticket.count
  }
  const { spots, deepest } = zoneField(zone)
  const reached = Math.min(spots.length - 1, Math.floor((ahead / ZONE_CAPACITY) * spots.length))
  return spots[reached].back / deepest
}

// The reverse: which line, and roughly which number in it, stands at `depth`.
export function depthToQueue(zone, depth) {
  const { spots, deepest } = zoneField(zone)
  // How many spots are at least this close to the barricade (binary search).
  let low = 0
  let high = spots.length
  while (low < high) {
    const middle = (low + high) >> 1
    if (spots[middle].back <= depth * deepest) low = middle + 1
    else high = middle
  }
  let place = Math.min(ZONE_CAPACITY, Math.max(1, Math.round((low / spots.length) * ZONE_CAPACITY)))
  for (const ticket of FLOOR_TICKETS) {
    if (place <= ticket.count) return { ticket: ticket.id, number: place }
    place -= ticket.count
  }
  const last = FLOOR_TICKETS[FLOOR_TICKETS.length - 1]
  return { ticket: last.id, number: last.count }
}

// --- Sections as people write them -------------------------------------------
// Turns what someone might type in a spreadsheet cell into a section id, or
// null if it isn't one:
//   "116", "Section 116", "Bleacher 1 116"   → that bleacher section
//   "A", "Section A", "Floor A", "Soundcheck B" → that floor zone
//   "Bleachers 1", "Bleachers 2"             → the whole tier ('b1' / 'b2'),
//                                              for numbers not broken down further
export function parseSectionRef(value) {
  const text = String(value ?? '').trim()
  const number = text.match(/(\d{3})\s*$/)?.[1]
  if (number && findSection(number)) return number
  const tier = text.match(/^bleachers?\s*([12])$/i)?.[1]
  if (tier) return `b${tier}`
  const letter = text.match(/(?:^|[^a-z])([a-d])$/i)?.[1]
  return letter ? `F${letter.toUpperCase()}` : null
}

// What to call whatever parseSectionRef returned.
export function sectionRefName(ref) {
  return TIERS.find((t) => t.id === ref)?.name ?? findSection(ref)?.name ?? null
}

// Where `count` people are, for lighting some of them up: seats in a bleacher
// section, standing spots in a floor zone, or — given a tier ('b1' / 'b2') —
// seats scattered across every section of it. The same people are picked every
// time for the same place, so a refresh of the numbers doesn't reshuffle the
// stadium. Each is [x, y, z] at about head height.
export function peopleIn(ref, count) {
  if (count <= 0) return []
  const seatsOf = (tier, number) => {
    const { from, to } = sectionSpan(number)
    const seats = []
    for (let row = 0; row < tier.rows; row++) {
      for (let seat = 0; seat < SEATS_PER_SECTION; seat++) {
        const p = pathPoint(from + ((to - from) * (seat + 0.5)) / SEATS_PER_SECTION, tier.offset + (row + 0.55) * tier.depth)
        seats.push([p.x, tier.y + row * tier.rise + EYE_SEATED, p.z])
      }
    }
    return seats
  }

  let places
  const wholeTier = TIERS.find((t) => t.id === ref)
  const section = findSection(ref)
  if (wholeTier) {
    places = Array.from({ length: SECTIONS_PER_RING }, (_, i) => seatsOf(wholeTier, i + 1)).flat()
  } else if (section?.kind === 'floor') {
    places = zoneField(section.zone).spots.map((s) => [s.x, EYE_STANDING, s.z])
  } else if (section) {
    places = seatsOf(section.tier, section.number)
  } else {
    return []
  }

  // A small seeded generator (mulberry32), seeded by the place.
  let seed = [...ref].reduce((sum, c) => sum * 31 + c.charCodeAt(0), 7) >>> 0
  const random = () => {
    seed = (seed + 0x6d2b79f5) >>> 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  // Shuffle, then take the first `count` — never more than the place holds.
  for (let i = places.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[places[i], places[j]] = [places[j], places[i]]
  }
  return places.slice(0, Math.min(count, places.length))
}

// What "everyone has one" means to peopleIn: every seat in both tiers, and
// every ticket holder in each floor zone.
export const EVERYONE = {
  ...Object.fromEntries(TIERS.map((tier) => [tier.id, Infinity])),
  ...Object.fromEntries(FLOOR_ZONES.map((zone) => [zone.id, ZONE_CAPACITY])),
}
