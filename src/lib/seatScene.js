import * as THREE from 'three'
import {
  TIERS,
  FLOOR_ZONES,
  FLOOR_COLOR,
  STAGE,
  RIG,
  PERIMETER,
  SECTIONS_PER_RING,
  ROOF_SPANS,
  SEATS_PER_SECTION,
  pathPoint,
  sectionSpan,
  findSection,
  seatPosition,
  floorSpotAt,
  insidePolygon,
  peopleIn,
  zoneCenter,
} from '../data/venue'

// ============================================================================
// SEAT VIEW SCENE — the 3D side of /seat-view.
// ============================================================================
// Plain three.js, no React: the page hands over a <canvas> and drives it through
// the object createSeatScene returns.
//
// Two cameras in one:
//   'overview' — orbit the whole stadium from outside. Drag to spin, pinch to
//                move in and out.
//   'seat'     — sit in the chosen seat. Drag to look around, pinch to zoom.
// In both, tapping a section (or a spot on the floor) picks that exact place,
// and the camera flies between the two rather than cutting.
//
// Nothing moves on its own, so a frame is drawn only when something changes or
// while a flight is in progress — a phone left on this page isn't rendering 60
// times a second.
//
// The geometry is deliberately blocky. It's built from data/venue.js, so
// retuning the stadium there reshapes everything here.

// Vertical field of view at 1× — roughly what a phone's main camera sees.
const BASE_FOV = 55
const OVERVIEW_FOV = 45
// Where "looking at the stage" points: a little above the centre-stage floor.
const LOOK_AT = new THREE.Vector3(0, STAGE.height + 1.5, 0)
const ORBIT_TARGET = new THREE.Vector3(0, 4, 0)

const MAX_PITCH = 60
const MAX_YAW = 170
const MIN_ZOOM = 1
const MAX_ZOOM = 8
const MIN_RADIUS = 110
const MAX_RADIUS = 420
// Polar angle limits for the orbit, from straight overhead: never quite
// top-down, never below the roofline.
const MIN_POLAR = 0.2
const MAX_POLAR = 1.45

// A flight takes longer the further it goes, within these limits, and rises
// in an arc so it clears the stands and the stage instead of cutting through.
const FLY_MIN_MS = 700
const FLY_MAX_MS = 1500
const FLY_MAX_LIFT = 55

// Section labels, in CSS pixels on screen whatever the distance.
const LABEL_HEIGHT = 16
// People per square metre on the floor. A real crowd is tighter at the front,
// but this is enough to put heads between you and the stage.
const CROWD_DENSITY = 2
// The only person not drawn is the one whose place the camera is in: anyone
// standing within this many metres of it (across the ground). Small enough that
// the people in the next seats, 0.46 m either side, and whoever is right in
// front of you are still there, whole.
const CROWD_CLEARANCE = 0.4
// A seat change smaller than this (a slider nudge) cuts instead of flying.
const FLY_MIN_DISTANCE = 15
// A press that travels less than this many pixels is a tap, not a drag.
const TAP_SLOP = 6

const SELECTED = new THREE.Color('#FBC01E')
const HOVER = new THREE.Color('#ffffff')

// `glow` is how brightly the rings on the stage floor light up; `crowd` dims
// the audience's clothes, which are drawn unlit, to suit the light.
const LOOKS = {
  day: { sky: '#cdd6ee', ambient: 1.5, sun: 1.4, glow: 0.3, crowd: 1 },
  night: { sky: '#0b0818', ambient: 0.7, sun: 0.35, glow: 0.95, crowd: 0.5 },
}

// How finely each section is cut along the curve.
const SLICES = 5
// buildTier emits a riser and a tread — two quads, twelve vertices, four
// triangles — per row per slice. pickSeat relies on this to turn a triangle
// index back into a section and row.
const VERTS_PER_CELL = 12
const FACES_PER_CELL = 4

const flatGeometry = (positions) => {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}

// The stands, as one mesh per tier: a tread and a riser for every row of every
// section, flat-shaded. Neighbouring sections alternate slightly in tone so you
// can tell them apart from across the stadium.
function buildTier(tier) {
  const positions = []
  const colors = []
  const base = new THREE.Color(tier.color)

  const quad = (a, b, c, d, color) => {
    for (const p of [a, b, c, a, c, d]) {
      positions.push(p[0], p[1], p[2])
      colors.push(color.r, color.g, color.b)
    }
  }

  for (let n = 1; n <= SECTIONS_PER_RING; n++) {
    const { from, to } = sectionSpan(n)
    const tread = base.clone().multiplyScalar(n % 2 ? 1 : 0.86)
    const riser = tread.clone().multiplyScalar(0.62)

    for (let i = 0; i < SLICES; i++) {
      const s0 = from + ((to - from) * i) / SLICES
      const s1 = from + ((to - from) * (i + 1)) / SLICES

      for (let row = 0; row < tier.rows; row++) {
        const front = tier.offset + row * tier.depth
        const back = front + tier.depth
        const y = tier.y + row * tier.rise
        // The first riser is the wall the tier stands on.
        const below = row === 0 ? 0 : y - tier.rise
        const f0 = pathPoint(s0, front)
        const f1 = pathPoint(s1, front)
        const b0 = pathPoint(s0, back)
        const b1 = pathPoint(s1, back)
        quad([f0.x, below, f0.z], [f1.x, below, f1.z], [f1.x, y, f1.z], [f0.x, y, f0.z], riser)
        quad([f0.x, y, f0.z], [f1.x, y, f1.z], [b1.x, y, b1.z], [b0.x, y, b0.z], tread)
      }
    }
  }

  const geometry = flatGeometry(positions)
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  return geometry
}

// A strip that follows the bowl from `from` to `to` along the front-row line,
// stretched between two rails, each `[metres back, height]`. Same distance back
// makes a wall, same height a floor, both different a sloping roof.
function buildBand(from, to, [offsetA, yA], [offsetB, yB]) {
  const positions = []
  const steps = Math.max(1, Math.round(((to - from) / PERIMETER) * SECTIONS_PER_RING * SLICES))
  for (let i = 0; i < steps; i++) {
    const s0 = from + ((to - from) * i) / steps
    const s1 = from + ((to - from) * (i + 1)) / steps
    const a0 = pathPoint(s0, offsetA)
    const a1 = pathPoint(s1, offsetA)
    const b0 = pathPoint(s0, offsetB)
    const b1 = pathPoint(s1, offsetB)
    positions.push(a0.x, yA, a0.z, a1.x, yA, a1.z, b1.x, yB, b1.z)
    positions.push(a0.x, yA, a0.z, b1.x, yB, b1.z, b0.x, yB, b0.z)
  }
  return flatGeometry(positions)
}

// A flat shape on the ground from [x, z] points.
function buildFlat(points, y) {
  const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)))
  const geometry = new THREE.ShapeGeometry(shape)
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, y, 0)
  return geometry
}

// One point of light per seat, plus a scatter across the floor: the lightstick
// ocean for the night look.
function buildLightsticks() {
  const positions = []
  const colors = []
  // Mostly purple, as an ARIRANG crowd's lightsticks are, with some white.
  const palette = ['#b98cff', '#9b6bff', '#a77dff', '#c9a0f5', '#e7d4ff', '#ffffff'].map((c) => new THREE.Color(c))
  const add = (x, y, z) => {
    const c = palette[Math.floor(Math.random() * palette.length)]
    positions.push(x, y, z)
    colors.push(c.r, c.g, c.b)
  }

  for (const tier of TIERS) {
    for (let n = 1; n <= SECTIONS_PER_RING; n++) {
      const { from, to } = sectionSpan(n)
      for (let row = 0; row < tier.rows; row++) {
        const offset = tier.offset + (row + 0.5) * tier.depth
        const a = pathPoint(from, offset)
        const b = pathPoint(to, offset)
        const seats = Math.round(Math.hypot(b.x - a.x, b.z - a.z) / 0.55)
        for (let i = 0; i < seats; i++) {
          const p = pathPoint(from + ((to - from) * (i + 0.5)) / seats, offset)
          add(p.x, tier.y + row * tier.rise + 1 + Math.random() * 0.3, p.z)
        }
      }
    }
  }
  for (const zone of FLOOR_ZONES) {
    for (let i = 0; i < 1800; i++) {
      const p = seatPosition(zone.id, Math.random(), Math.random())
      // Held up at about head height, in among the crowd.
      add(p.x, 1.5 + Math.random() * 0.4, p.z)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  return geometry
}

// How many poses the crowd picture holds, side by side.
// Four arm positions (down, right up, left up, both up), each drawn twice: with
// short hair and with long. POSES is how many pictures that makes.
const ARM_POSES = 4
const POSES = ARM_POSES * 2
// The picture leaves headroom above the figure for raised arms: a person's
// head tops out this far up it.
const POSE_HEADROOM = 0.84
const PERSON_HEIGHT = 1.6
// How far a seated person's head is below where it would be standing.
const SEATED_DROP = 0.4

// One picture with every pose in it: a person seen from behind, painted in
// shades of grey that the person's own colour is multiplied into later — so the
// white shirt takes that colour fully, and the near-black hair stays dark
// whatever the shirt is.
function drawPoses() {
  const w = 128
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w * POSES
  canvas.height = h
  const ink = canvas.getContext('2d')
  ink.lineCap = 'round'
  ink.lineJoin = 'round'
  const SHIRT = '#ffffff'
  const ARMS = '#d9d9d9'
  const LEGS = '#4a4a4a'
  const HAIR = '#1c1c1c'

  const top = h * (1 - POSE_HEADROOM)
  const limb = (colour, width, ...points) => {
    ink.strokeStyle = colour
    ink.lineWidth = width
    ink.beginPath()
    points.forEach(([x, y], i) => (i ? ink.lineTo(x, y) : ink.moveTo(x, y)))
    ink.stroke()
  }

  for (let pose = 0; pose < POSES; pose++) {
    const arms = pose % ARM_POSES
    const longHair = pose >= ARM_POSES
    ink.save()
    ink.translate(pose * w, 0)
    // Legs, then the body over them.
    limb(LEGS, 19, [53, top + 114], [51, h - 10])
    limb(LEGS, 19, [75, top + 114], [77, h - 10])
    ink.fillStyle = SHIRT
    ink.beginPath()
    ink.moveTo(38, top + 44)
    ink.quadraticCurveTo(64, top + 34, 90, top + 44)
    ink.lineTo(84, top + 118)
    ink.lineTo(44, top + 118)
    ink.closePath()
    ink.fill()
    limb(SHIRT, 13, [38, top + 44], [90, top + 44])
    // Arms: 1 raises the right, 2 the left, 3 both.
    const raised = [arms === 2 || arms === 3, arms === 1 || arms === 3]
    ;[-1, 1].forEach((side, i) => {
      const shoulder = [64 + side * 27, top + 46]
      if (raised[i]) limb(ARMS, 12, shoulder, [64 + side * 40, top + 14], [64 + side * 34, top - 26])
      else limb(ARMS, 12, shoulder, [64 + side * 33, top + 84], [64 + side * 30, top + 116])
    })
    // The back of the head is all hair; long hair falls down the back.
    ink.fillStyle = HAIR
    ink.beginPath()
    ink.arc(64, top + 16, 14, 0, Math.PI * 2)
    ink.fill()
    if (longHair) {
      ink.beginPath()
      ink.moveTo(50, top + 16)
      ink.lineTo(48, top + 70)
      ink.quadraticCurveTo(64, top + 78, 80, top + 70)
      ink.lineTo(78, top + 16)
      ink.closePath()
      ink.fill()
    }
    ink.restore()
  }
  return canvas
}

// A flat picture of a person, `tall` metres from feet to the top of the head.
function cutoutGeometry(track, tall) {
  const height = tall / POSE_HEADROOM
  const cutout = track(new THREE.PlaneGeometry(height / 2, height))
  cutout.translate(0, height / 2, 0)
  return cutout
}

// The material that turns those pictures into people: each instance shows one
// pose from the shared picture, stands at its own spot and height, and turns
// about the vertical to face the camera. Unlit, so the instance colour is
// exactly what you see. Anyone standing within `clearance` metres of the camera
// isn't drawn at all (0 draws everyone).
function cutoutMaterial(track, poses, clearance) {
  // alphaTest is low so that, shrunk to a few pixels across the stadium, a
  // figure still draws as a dot rather than vanishing.
  const material = track(new THREE.MeshBasicMaterial({ map: poses, alphaTest: 0.3, side: THREE.DoubleSide }))
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', 'attribute float pose;\n#include <common>')
      .replace('#include <uv_vertex>', `#include <uv_vertex>\n  vMapUv.x = (vMapUv.x + pose) / ${POSES.toFixed(1)};`)
      .replace(
        '#include <project_vertex>',
        `vec3 spot = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 toCamera = cameraPosition - spot;
  vec3 across = normalize(vec3(toCamera.z, 0.0, -toCamera.x));
  float tall = length(instanceMatrix[1].xyz);
  vec4 mvPosition = viewMatrix * vec4(spot + across * transformed.x + vec3(0.0, transformed.y * tall, 0.0), 1.0);
  gl_Position = projectionMatrix * mvPosition;
  // A whole person is either drawn or not — never sliced. Too close, and all
  // of their corners are sent off screen together.
  if (length(toCamera.xz) < ${clearance.toFixed(2)}) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);`,
      )
  }
  return material
}

// A set of cut-out people from `people`: [{ x, y, z, scale, color, pose }].
function buildPeople(track, poses, tall, clearance, people) {
  const geometry = cutoutGeometry(track, tall)
  const mesh = new THREE.InstancedMesh(geometry, cutoutMaterial(track, poses, clearance), people.length)
  const placement = new THREE.Object3D()
  const pose = new Float32Array(people.length)
  people.forEach((person, i) => {
    placement.position.set(person.x, person.y, person.z)
    placement.scale.set(1, person.scale, 1)
    placement.updateMatrix()
    mesh.setMatrixAt(i, placement.matrix)
    mesh.setColorAt(i, person.color)
    pose[i] = person.pose
  })
  geometry.setAttribute('pose', new THREE.InstancedBufferAttribute(pose, 1))
  // The shader moves every vertex, so three's own idea of where the mesh is
  // (and whether it's on screen) would be wrong.
  mesh.frustumCulled = false
  return mesh
}

// What the crowd is wearing: purple most of all, then the usual black, white,
// red and the rest. Listed more than once to come up more often.
const SHIRTS = [
  '#7b4fe0', '#7b4fe0', '#9b6bff', '#9b6bff', '#5a34b0', '#c9a0f5',
  '#26242c', '#26242c', '#e8e6f0', '#c8323c', '#e06aa0', '#2b3a6b', '#8a8a96',
].map((c) => new THREE.Color(c))

// The audience: a cut-out person standing on every spot of the floor and
// sitting in every seat of the stands, as one group so it can be switched on
// and off together. Two triangles a person, so ~40,000 of them stay cheap.
//
// From a spot on the floor the standing crowd is what you actually look over —
// the stage and runways are only a little higher than people's heads.
function buildCrowd(track, poses) {
  const person = (x, y, z) => ({
    x,
    y,
    z,
    // Heights from about 1.45 m to 1.7 m.
    scale: 0.9 + Math.random() * 0.17,
    color: SHIRTS[Math.floor(Math.random() * SHIRTS.length)],
    // Half the crowd has arms down (pose 0); the other half is split evenly
    // between the left arm up, the right arm up, and both.
    pose: (Math.random() < 0.5 ? 0 : 1 + Math.floor(Math.random() * (ARM_POSES - 1))) + (Math.random() < 0.5 ? ARM_POSES : 0),
  })

  // The floor: an even but not regimented spread — a grid, with every person nudged.
  const step = 1 / Math.sqrt(CROWD_DENSITY)
  const standing = []
  for (const zone of FLOOR_ZONES) {
    const xs = zone.outline.map((p) => p[0])
    const zs = zone.outline.map((p) => p[1])
    for (let x = Math.min(...xs); x <= Math.max(...xs); x += step) {
      for (let z = Math.min(...zs); z <= Math.max(...zs); z += step) {
        const px = x + (Math.random() - 0.5) * step * 0.7
        const pz = z + (Math.random() - 0.5) * step * 0.7
        if (insidePolygon(zone.outline, px, pz)) standing.push(person(px, 0, pz))
      }
    }
  }

  // The stands: one person per seat. The same standing figure, sunk into the
  // step so that only what shows above a seat is left — the legs end up inside
  // the concrete, where the step in front hides them.
  const seated = []
  for (const tier of TIERS) {
    for (let n = 1; n <= SECTIONS_PER_RING; n++) {
      const { from, to } = sectionSpan(n)
      for (let row = 0; row < tier.rows; row++) {
        for (let seat = 0; seat < SEATS_PER_SECTION; seat++) {
          const p = pathPoint(from + ((to - from) * (seat + 0.5)) / SEATS_PER_SECTION, tier.offset + (row + 0.55) * tier.depth)
          seated.push(person(p.x, tier.y + row * tier.rise - SEATED_DROP, p.z))
        }
      }
    }
  }

  const crowd = new THREE.Group()
  crowd.add(
    buildPeople(track, poses, PERSON_HEIGHT, CROWD_CLEARANCE, standing),
    buildPeople(track, poses, PERSON_HEIGHT, CROWD_CLEARANCE, seated),
  )
  return crowd
}

// Seven performers on the centre stage, life-size and each in their own colour
// — the only thing in the scene that tells you how big a member will actually
// look from your seat. They stand in a ring, as on a stage played in the round.
const MEMBER_HEIGHT = 1.78
const MEMBER_COLORS = ['#EC1E50', '#F07E27', '#7B4FE0', '#1CA9DD', '#E0559A', '#1FA37A', '#2B3FBF']
function buildMembers(track, poses) {
  return buildPeople(
    track,
    poses,
    MEMBER_HEIGHT,
    0,
    MEMBER_COLORS.map((color, i) => {
      const a = (i / MEMBER_COLORS.length) * Math.PI * 2
      return {
        x: Math.cos(a) * 3.5,
        y: STAGE.height,
        z: Math.sin(a) * 3.5,
        scale: 1,
        color: new THREE.Color(color),
        // Short hair only: the long-hair pictures are for the crowd.
        pose: i % ARM_POSES,
      }
    }),
  )
}

// A small dark tag with the section number or zone letter on it.
function buildLabel(text, track) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const ink = canvas.getContext('2d')
  ink.fillStyle = 'rgba(20, 20, 20, 0.88)'
  ink.beginPath()
  // Older browsers have no roundRect; they get square corners.
  if (ink.roundRect) ink.roundRect(4, 6, 120, 52, 16)
  else ink.rect(4, 6, 120, 52)
  ink.fill()
  ink.fillStyle = '#ffffff'
  ink.font = '700 38px Barlow, system-ui, sans-serif'
  ink.textAlign = 'center'
  ink.textBaseline = 'middle'
  ink.fillText(text, 64, 34)
  const texture = track(new THREE.CanvasTexture(canvas))
  texture.colorSpace = THREE.SRGBColorSpace
  // sizeAttenuation off: the tag stays the same size on screen however far away.
  return new THREE.Sprite(track(new THREE.SpriteMaterial({ map: texture, sizeAttenuation: false })))
}

// A tag floating over the middle of every section and floor zone.
function buildLabels(track) {
  const labels = new THREE.Group()
  for (const tier of TIERS) {
    for (let n = 1; n <= SECTIONS_PER_RING; n++) {
      const p = pathPoint(sectionSpan(n).center, tier.offset + (tier.rows * tier.depth) / 2)
      const label = buildLabel(String(tier.base + n), track)
      label.position.set(p.x, tier.y + (tier.rows * tier.rise) / 2 + 3, p.z)
      label.userData.number = n
      labels.add(label)
    }
  }
  for (const zone of FLOOR_ZONES) {
    const [x, z] = zoneCenter(zone)
    const label = buildLabel(zone.name.slice(-1), track)
    label.position.set(x, 6, z)
    // Zone letters a little larger than section numbers.
    label.userData.grow = 1.4
    labels.add(label)
  }
  return labels
}

// The canopies over the two long sides, each with a row of posts behind it.
function buildRoofs(scene, track) {
  const upper = TIERS[TIERS.length - 1]
  const top = upper.y + upper.rows * upper.rise
  const backOffset = upper.offset + upper.rows * upper.depth + 3
  const canopy = track(
    new THREE.MeshLambertMaterial({ color: '#f4f4fa', transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }),
  )
  const steel = track(new THREE.LineBasicMaterial({ color: '#8d8aa3' }))

  for (const [from, to] of ROOF_SPANS) {
    // Highest at the front edge, which reaches forward over the upper tier.
    scene.add(new THREE.Mesh(track(buildBand(from, to, [upper.offset - 2, top + 11], [backOffset, top + 7])), canopy))

    const posts = []
    const count = Math.round((to - from) / 5.5)
    for (let i = 0; i <= count; i++) {
      const p = pathPoint(from + ((to - from) * i) / count, backOffset)
      posts.push(p.x, top, p.z, p.x, top + 7, p.z)
    }
    const geometry = track(new THREE.BufferGeometry())
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(posts, 3))
    scene.add(new THREE.LineSegments(geometry, steel))
  }
}

// What a screen shows: an abstract purple concert visual — a glow rising
// from below, light rays and specks. Deliberately not the members or the
// show's own footage. `shape` is the screen's width over its height, so the
// picture isn't stretched to fit.
function drawScreen(shape) {
  const canvas = document.createElement('canvas')
  const w = Math.round(256 * shape)
  canvas.width = w
  canvas.height = 256
  const ink = canvas.getContext('2d')
  const sky = ink.createLinearGradient(0, 0, 0, 256)
  sky.addColorStop(0, '#120726')
  sky.addColorStop(0.6, '#3a1a7a')
  sky.addColorStop(1, '#8a5cff')
  ink.fillStyle = sky
  ink.fillRect(0, 0, w, 256)

  // A bright glow along the bottom edge.
  const glow = ink.createRadialGradient(w / 2, 300, 10, w / 2, 300, Math.max(w, 256) * 0.7)
  glow.addColorStop(0, 'rgba(255, 220, 255, 0.9)')
  glow.addColorStop(0.35, 'rgba(190, 140, 255, 0.45)')
  glow.addColorStop(1, 'rgba(120, 80, 255, 0)')
  ink.fillStyle = glow
  ink.fillRect(0, 0, w, 256)

  // Rays fanning up from that glow.
  ink.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 9; i++) {
    const spread = (i - 4) / 4
    ink.fillStyle = `rgba(200, 170, 255, ${0.08 + 0.05 * (i % 2)})`
    ink.beginPath()
    ink.moveTo(w / 2 + spread * w * 0.05, 256)
    ink.lineTo(w / 2 + spread * w * 0.7 - w * 0.03, 0)
    ink.lineTo(w / 2 + spread * w * 0.7 + w * 0.03, 0)
    ink.closePath()
    ink.fill()
  }

  // Specks of light, the same on every screen of the same shape.
  let seed = Math.round(shape * 1000)
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 70 * shape; i++) {
    ink.fillStyle = `rgba(255, 240, 255, ${0.25 + random() * 0.6})`
    ink.beginPath()
    ink.arc(random() * w, random() * 200, 0.8 + random() * 2.2, 0, Math.PI * 2)
    ink.fill()
  }
  ink.globalCompositeOperation = 'source-over'
  return canvas
}

// The towers, screens and lighting grid over the centre stage (see RIG in
// data/venue.js). Returns the meshes, which block taps like the stage, with
// the screens' materials attached as `.screens`.
function buildRig(scene, track) {
  // The screens' pictures, so they can be dimmed while the headbands show.
  const screens = []
  const meshes = []
  const steel = track(new THREE.MeshLambertMaterial({ color: '#23222c' }))
  const add = (geometry, material, x, y, z, turn = 0) => {
    const mesh = new THREE.Mesh(track(geometry), material)
    mesh.position.set(x, y, z)
    mesh.rotation.y = turn
    scene.add(mesh)
    meshes.push(mesh)
  }

  // A screen is a thin slab `width` long, lying along the direction `turn`
  // gives it, with the picture on one long face or on both.
  const screen = (width, height, x, y, z, turn, bothSides) => {
    const map = track(new THREE.CanvasTexture(drawScreen(width / height)))
    map.colorSpace = THREE.SRGBColorSpace
    // Unlit: a screen is its own light, day or night.
    const picture = track(new THREE.MeshBasicMaterial({ map }))
    screens.push(picture)
    const faces = [steel, steel, steel, steel, picture, bothSides ? picture : steel]
    add(new THREE.BoxGeometry(width, height, 0.6), faces, x, y, z, turn)
  }

  // A tower where each runway leaves the centre stage. `out` is the direction
  // of that runway.
  const towers = STAGE.arms.map(([x, z]) => {
    const reach = Math.hypot(x, z)
    const out = [x / reach, z / reach]
    return { x: out[0] * RIG.towerAt, z: out[1] * RIG.towerAt, out }
  })
  const screenY = RIG.screenBottom + RIG.screenHeight / 2

  towers.forEach((tower, i) => {
    const next = towers[(i + 1) % towers.length]
    add(
      new THREE.BoxGeometry(RIG.towerWidth, RIG.towerHeight, RIG.towerWidth),
      steel,
      tower.x,
      RIG.towerHeight / 2,
      tower.z,
    )

    // To the next tower: a beam of the lighting grid, and above it the screen
    // that faces the floor zone on that side.
    const span = Math.hypot(next.x - tower.x, next.z - tower.z)
    const mx = (tower.x + next.x) / 2
    const mz = (tower.z + next.z) / 2
    add(new THREE.BoxGeometry(span, 1, 1), steel, mx, RIG.gridHeight, mz, -Math.atan2(next.z - tower.z, next.x - tower.x))
    screen(span, RIG.screenHeight, mx, screenY, mz, Math.atan2(mx, mz), false)

    // The wing: out from the tower along the line of its runway.
    const [ox, oz] = tower.out
    screen(
      RIG.wingLength,
      RIG.screenHeight,
      tower.x + (ox * RIG.wingLength) / 2,
      screenY,
      tower.z + (oz * RIG.wingLength) / 2,
      -Math.atan2(oz, ox),
      true,
    )
  })

  meshes.screens = screens
  return meshes
}

// The night look's stage lighting: spotlights down onto the performers, beams
// fanning up into the sky from the tower tops, and a wash of colour on the
// deck. All of it is faked with see-through cones that add their colour to
// whatever is behind them — no real lights, so it costs almost nothing.
function buildShowLights(track, glowTexture) {
  const lights = new THREE.Group()
  const up = new THREE.Vector3(0, 1, 0)

  // A beam `startWidth` across where it leaves the lamp, `endWidth` where it lands.
  const beam = (from, to, startWidth, endWidth, color, strength) => {
    const length = from.distanceTo(to)
    const mesh = new THREE.Mesh(
      track(new THREE.CylinderGeometry(endWidth / 2, startWidth / 2, length, 20, 1, true)),
      track(
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: strength,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      ),
    )
    mesh.position.copy(from).add(to).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(up, to.clone().sub(from).normalize())
    lights.add(mesh)
  }

  // A spotlight from the lighting grid onto each of the seven performers.
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    beam(
      new THREE.Vector3(Math.cos(a) * 7.5, RIG.gridHeight, Math.sin(a) * 7.5),
      new THREE.Vector3(Math.cos(a) * 3.5, STAGE.height, Math.sin(a) * 3.5),
      0.5,
      3.2,
      '#fff3d6',
      0.16,
    )
  }

  // Three beams into the sky from the top of each tower, fanned out over the
  // runway it stands on.
  const colours = ['#ff4fa8', '#9b6bff', '#4fc3ff']
  for (const [x, z] of STAGE.arms) {
    const reach = Math.hypot(x, z)
    const out = new THREE.Vector3(x / reach, 0, z / reach)
    const top = out.clone().multiplyScalar(RIG.towerAt).setY(RIG.towerHeight)
    colours.forEach((colour, i) => {
      const aim = out.clone().applyAxisAngle(up, (i - 1) * 0.5).setY(1.25).normalize()
      beam(top, top.clone().addScaledVector(aim, 85), 0.8, 9, colour, 0.1)
    })
  }

  // A soft purple wash on the centre stage, under the screens.
  const wash = new THREE.Mesh(
    track(new THREE.CircleGeometry(STAGE.radius * 1.5, 40)),
    track(
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        color: '#a57bff',
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  )
  wash.rotation.x = -Math.PI / 2
  wash.position.y = STAGE.height + 0.06
  lights.add(wash)

  return lights
}

// Returns the stage deck material (so the night look can make it glow) and the
// meshes, which block taps from reaching the stands behind them.
// The top of the centre stage: a dark floor with rings of light, as the real
// one is lit — far less glaring than a plain pale disc.
function drawDeck() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ink = canvas.getContext('2d')
  ink.fillStyle = '#1c1928'
  ink.fillRect(0, 0, size, size)
  const middle = size / 2
  ink.strokeStyle = '#c9b0ff'
  for (const [ring, width] of [[0.96, 6], [0.8, 3], [0.62, 4], [0.44, 3], [0.26, 5], [0.1, 3]]) {
    ink.lineWidth = width
    ink.beginPath()
    ink.arc(middle, middle, middle * ring, 0, Math.PI * 2)
    ink.stroke()
  }
  return canvas
}

function buildStage(scene, track) {
  const rings = track(new THREE.CanvasTexture(drawDeck()))
  rings.colorSpace = THREE.SRGBColorSpace
  // The rings glow by themselves; how brightly is set by the night look.
  const deck = track(
    new THREE.MeshLambertMaterial({ map: rings, emissive: '#ffffff', emissiveMap: rings, emissiveIntensity: 0.3 }),
  )
  const body = track(new THREE.MeshLambertMaterial({ color: '#2a2638' }))
  const edge = track(new THREE.LineBasicMaterial({ color: '#b98cff' }))
  const meshes = []
  const add = (geometry, material = body) => {
    const mesh = new THREE.Mesh(track(geometry), material)
    scene.add(mesh)
    meshes.push(mesh)
    // A thin light line round every edge, so the dark shapes still read.
    mesh.add(new THREE.LineSegments(track(new THREE.EdgesGeometry(geometry)), edge))
    return mesh
  }

  // Side, top, bottom: only the top gets the rings.
  add(new THREE.CylinderGeometry(STAGE.radius, STAGE.radius, STAGE.height, 48), [body, deck, body]).position.y =
    STAGE.height / 2

  const runwayHeight = STAGE.height * 0.85
  for (const [x, z] of STAGE.arms) {
    const length = Math.hypot(x, z)
    const turn = -Math.atan2(z, x)
    const arm = add(new THREE.BoxGeometry(length, runwayHeight, STAGE.armWidth))
    arm.position.set(x / 2, runwayHeight / 2, z / 2)
    arm.rotation.y = turn
    const cross = add(new THREE.BoxGeometry(STAGE.armWidth, runwayHeight, STAGE.crossLength))
    cross.position.set(x * STAGE.crossAt, runwayHeight / 2, z * STAGE.crossAt)
    cross.rotation.y = turn
  }

  return { deck, meshes }
}

// `onPick({ id, depth, across })` fires when a section or floor spot is tapped,
// `onHover(id | null)` as the mouse moves over one, and `onZoom(value)` when a
// pinch changes the seat zoom. `mode`, `night` and `crowd` set the starting state.
export function createSeatScene(canvas, { mode: startMode = 'seat', night: startNight = true, crowd: startCrowd = true, onPick, onHover, onZoom } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  // Everything that holds GPU memory, so dispose() can release it.
  const owned = []
  const track = (item) => {
    owned.push(item)
    return item
  }

  const scene = new THREE.Scene()
  scene.background = new THREE.Color()
  const ambient = new THREE.HemisphereLight('#ffffff', '#3a3550', 1)
  const sun = new THREE.DirectionalLight('#ffffff', 1)
  sun.position.set(60, 120, 40)
  scene.add(ambient, sun)

  const ground = new THREE.Mesh(
    track(new THREE.PlaneGeometry(900, 900)),
    track(new THREE.MeshLambertMaterial({ color: '#2b2838' })),
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  // The running track that rings the pitch, just inside the front row.
  const lanes = track(new THREE.MeshLambertMaterial({ color: '#3d5fa8', side: THREE.DoubleSide }))
  scene.add(new THREE.Mesh(track(buildBand(0, PERIMETER, [-5, 0.04], [-14, 0.04])), lanes))

  // One material per zone, so each can be highlighted on its own.
  const zoneMeshes = {}
  for (const zone of FLOOR_ZONES) {
    const mesh = new THREE.Mesh(
      track(buildFlat(zone.outline, 0.12)),
      track(new THREE.MeshLambertMaterial({ color: FLOOR_COLOR })),
    )
    mesh.userData.zone = zone
    zoneMeshes[zone.id] = mesh
    scene.add(mesh)
  }

  // `base` keeps each tier's untouched colours, to restore after a highlight.
  const stands = track(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }))
  const tierMeshes = {}
  for (const tier of TIERS) {
    const mesh = new THREE.Mesh(track(buildTier(tier)), stands)
    mesh.userData.tier = tier
    mesh.userData.base = mesh.geometry.attributes.color.array.slice()
    tierMeshes[tier.id] = mesh
    scene.add(mesh)
  }

  // Close the gap between the tiers and put a wall behind the top row, so the
  // far side of the stadium reads as solid instead of showing sky through it.
  const concrete = track(new THREE.MeshLambertMaterial({ color: '#3d3950', side: THREE.DoubleSide }))
  const [lower, upper] = TIERS
  const lowerBack = lower.offset + lower.rows * lower.depth
  const upperBack = upper.offset + upper.rows * upper.depth
  const upperTop = upper.y + upper.rows * upper.rise
  scene.add(new THREE.Mesh(track(buildBand(0, PERIMETER, [lowerBack, 0], [lowerBack, upper.y])), concrete))
  scene.add(new THREE.Mesh(track(buildBand(0, PERIMETER, [upperBack, 0], [upperBack, upperTop + 1.2])), concrete))

  buildRoofs(scene, track)
  const stage = buildStage(scene, track)
  const rig = buildRig(scene, track)

  // One picture of every pose, shared by the crowd and the performers.
  const poses = track(new THREE.CanvasTexture(drawPoses()))
  poses.colorSpace = THREE.SRGBColorSpace
  const crowd = buildCrowd(track, poses)
  scene.add(crowd, buildMembers(track, poses))

  // Only shown from the overview: from a seat they'd be clutter over the stage.
  const labels = buildLabels(track)
  scene.add(labels)

  // A soft round dot, so a lightstick near the camera isn't a hard square.
  const dot = document.createElement('canvas')
  dot.width = dot.height = 32
  const ink = dot.getContext('2d')
  const glow = ink.createRadialGradient(16, 16, 0, 16, 16, 16)
  glow.addColorStop(0, 'rgba(255,255,255,1)')
  glow.addColorStop(0.5, 'rgba(255,255,255,0.9)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ink.fillStyle = glow
  ink.fillRect(0, 0, 32, 32)
  const dotTexture = track(new THREE.CanvasTexture(dot))
  // A material for points of light `size` metres across, kept between `least`
  // and `most` pixels on screen: the far side of the stadium still twinkles,
  // and the light of the person next to you doesn't fill the view.
  const glowMaterial = (options, least, most) => {
    const material = track(new THREE.PointsMaterial({ map: dotTexture, alphaTest: 0.3, ...options }))
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <logdepthbuf_vertex>',
        `gl_PointSize = clamp(gl_PointSize, ${least.toFixed(1)}, ${most.toFixed(1)});\n#include <logdepthbuf_vertex>`,
      )
    }
    return material
  }
  const sparkle = glowMaterial({ size: 0.3, vertexColors: true }, 1.5, 7)
  const lightsticks = new THREE.Points(track(buildLightsticks()), sparkle)
  scene.add(lightsticks)

  // The SUGA lighted headband fan project: a pink light on the head of each
  // person wearing one. Empty until setHeadbands is given the numbers.
  const headbands = new THREE.Points(
    track(new THREE.BufferGeometry()),
    // Never smaller than 5 pixels: a few hundred headbands among 40,000 people
    // would otherwise be invisible from across the stadium.
    glowMaterial({ size: 0.7, color: '#ff4fa8' }, 5, 14),
  )
  headbands.geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
  headbands.frustumCulled = false
  headbands.visible = false
  scene.add(headbands)

  const showLights = buildShowLights(track, dotTexture)
  scene.add(showLights)

  // A pin over the chosen seat, so you can find it from the overview.
  const marker = new THREE.Group()
  const pin = track(new THREE.MeshBasicMaterial({ color: '#EC1E50' }))
  const head = new THREE.Mesh(track(new THREE.SphereGeometry(2.2, 16, 12)), pin)
  head.position.y = 10
  const stem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.25, 0.25, 10, 6)), pin)
  stem.position.y = 5
  marker.add(head, stem)
  scene.add(marker)

  // The near limit is a quarter of a metre: close enough that someone in the
  // next seat isn't cut off by it.
  const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.25, 2000)
  camera.rotation.order = 'YXZ'
  // Never drawn — only used to work out where a camera should end up.
  const probe = new THREE.PerspectiveCamera()

  let mode = startMode
  let seat = null
  let seatId = null
  let hoverId = null
  let zoom = 1
  // Seat view: degrees away from looking straight at the stage.
  let yaw = 0
  let pitch = 0
  // Overview: where on the orbit the camera sits. Starts on the 110 side, so
  // the stadium is the same way up as the seat map.
  let azimuth = 0
  let polar = 0.95
  let radius = 230
  // The flight in progress, if any.
  let tween = null
  let frame = 0

  const seatFov = () =>
    THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2)) / zoom))

  // Where the camera belongs right now, before any looking around.
  const restingPose = () => {
    if (mode === 'seat' && seat) {
      probe.position.set(seat.x, seat.y, seat.z)
      probe.lookAt(LOOK_AT)
      return { position: probe.position.clone(), quaternion: probe.quaternion.clone(), fov: seatFov() }
    }
    // On a tall, narrow screen the camera backs off so the whole bowl still fits.
    const fit = Math.max(1, 1.35 / camera.aspect)
    probe.position.setFromSphericalCoords(radius * fit, polar, azimuth).add(ORBIT_TARGET)
    probe.lookAt(ORBIT_TARGET)
    return { position: probe.position.clone(), quaternion: probe.quaternion.clone(), fov: OVERVIEW_FOV }
  }

  const draw = () => {
    camera.updateProjectionMatrix()
    if (labels.visible) {
      // World size that comes out as LABEL_HEIGHT pixels at the current zoom.
      const unit = (LABEL_HEIGHT * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / canvas.clientHeight
      // Zoomed out, neighbouring tags would pile on top of each other, so only
      // every 2nd, 3rd… section keeps its number. `unit × distance` is how many
      // metres one tag-height covers at the middle of the stadium.
      const tagWidth = unit * camera.position.distanceTo(ORBIT_TARGET) * 2.3
      const every = Math.max(1, Math.ceil(tagWidth / (PERIMETER / SECTIONS_PER_RING)))
      for (const label of labels.children) {
        const { number, grow = 1 } = label.userData
        label.visible = !number || (number - 1) % every === 0
        label.scale.set(unit * grow * 2, unit * grow, 1)
      }
    }
    renderer.render(scene, camera)
  }

  const render = () => {
    if (tween) return
    const pose = restingPose()
    camera.position.copy(pose.position)
    camera.quaternion.copy(pose.quaternion)
    if (mode === 'seat') {
      camera.rotation.y += THREE.MathUtils.degToRad(yaw)
      camera.rotation.x += THREE.MathUtils.degToRad(pitch)
    }
    camera.fov = pose.fov
    draw()
  }

  const fly = () => {
    cancelAnimationFrame(frame)
    const from = { position: camera.position.clone(), quaternion: camera.quaternion.clone(), fov: camera.fov }
    const to = restingPose()
    const distance = from.position.distanceTo(to.position)
    const duration = THREE.MathUtils.clamp(distance * 6, FLY_MIN_MS, FLY_MAX_MS)
    const lift = Math.min(FLY_MAX_LIFT, distance * 0.3)
    tween = { start: performance.now() }
    const step = (now) => {
      const t = Math.min(1, (now - tween.start) / duration)
      // Ease in and out, so the flight doesn't lurch at either end.
      const k = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
      camera.position.lerpVectors(from.position, to.position, k)
      // Up and over: highest half-way, back on the straight line at both ends.
      camera.position.y += Math.sin(Math.PI * k) * lift
      camera.quaternion.slerpQuaternions(from.quaternion, to.quaternion, k)
      camera.fov = from.fov + (to.fov - from.fov) * k
      draw()
      if (t < 1) {
        frame = requestAnimationFrame(step)
      } else {
        tween = null
        render()
      }
    }
    frame = requestAnimationFrame(step)
  }

  // Tints a section toward `color`, or back to its own colours with null.
  const tint = (id, color) => {
    const section = findSection(id)
    if (!section) return
    if (section.kind === 'floor') {
      zoneMeshes[id].material.color.set(color ?? FLOOR_COLOR)
      return
    }
    const mesh = tierMeshes[section.tier.id]
    const attribute = mesh.geometry.attributes.color
    const { base } = mesh.userData
    const size = SLICES * section.tier.rows * VERTS_PER_CELL * 3
    const start = (section.number - 1) * size
    const rgb = color?.toArray()
    for (let i = start; i < start + size; i++) {
      // Blend rather than replace, so the rows stay visible under the tint.
      attribute.array[i] = rgb ? base[i] * 0.4 + rgb[i % 3] * 0.6 : base[i]
    }
    attribute.needsUpdate = true
  }

  // The chosen section is only marked from the overview — from inside it, a
  // yellow floor under your own feet is just noise.
  let painted = []
  const repaint = () => {
    painted.forEach((id) => tint(id, null))
    painted = []
    if (mode === 'overview' && seatId) {
      tint(seatId, SELECTED)
      painted.push(seatId)
    }
    // Your own section isn't somewhere to go, so it doesn't light up.
    if (hoverId && hoverId !== seatId) {
      tint(hoverId, HOVER)
      painted.push(hoverId)
    }
    marker.visible = mode === 'overview'
    labels.visible = mode === 'overview'
  }

  const setSeat = (position, id) => {
    const first = !seat
    const far = !first && camera.position.distanceTo(new THREE.Vector3(position.x, position.y, position.z)) > FLY_MIN_DISTANCE
    seat = position
    seatId = id
    marker.position.set(position.x, position.y, position.z)
    repaint()
    if (mode !== 'seat') return render()
    yaw = 0
    pitch = 0
    if (far) fly()
    else render()
  }

  const setMode = (next) => {
    if (next === mode) return
    mode = next
    yaw = 0
    pitch = 0
    repaint()
    fly()
  }

  const setZoom = (value) => {
    zoom = THREE.MathUtils.clamp(value, MIN_ZOOM, MAX_ZOOM)
    render()
  }

  // Zooms the seat view, or moves the overview camera in and out. Returns
  // false when it was already as far in or out as it goes.
  const zoomBy = (factor) => {
    if (mode === 'seat') {
      const before = zoom
      setZoom(zoom * factor)
      onZoom?.(zoom)
      return zoom !== before
    }
    const before = radius
    radius = THREE.MathUtils.clamp(radius / factor, MIN_RADIUS, MAX_RADIUS)
    render()
    return radius !== before
  }

  // Turns the view by a number of degrees: looking around from a seat, or
  // moving round the orbit in the overview.
  const turn = (right, up) => {
    if (tween) return
    if (mode === 'seat') {
      yaw = THREE.MathUtils.clamp(yaw - right, -MAX_YAW, MAX_YAW)
      pitch = THREE.MathUtils.clamp(pitch + up, -MAX_PITCH, MAX_PITCH)
    } else {
      azimuth += THREE.MathUtils.degToRad(right)
      polar = THREE.MathUtils.clamp(polar - THREE.MathUtils.degToRad(up), MIN_POLAR, MAX_POLAR)
    }
    render()
  }

  // Every light in the show — lightsticks, beams, glowing stage rings and the
  // screens — follows the night look, and all of it goes dark while the
  // headbands are shown, so they're the only lights left in the stadium.
  let night = startNight
  let headbandsOn = false
  const applyLights = () => {
    const look = night ? LOOKS.night : LOOKS.day
    const showing = !headbandsOn
    lightsticks.visible = night && showing
    showLights.visible = night && showing
    stage.deck.emissiveIntensity = showing ? look.glow : 0
    for (const screen of rig.screens) screen.color.setScalar(showing ? 1 : 0.08)
    headbands.visible = headbandsOn
  }

  const setNight = (value) => {
    night = value
    const look = night ? LOOKS.night : LOOKS.day
    scene.background.set(look.sky)
    ambient.intensity = look.ambient
    sun.intensity = look.sun
    for (const people of crowd.children) people.material.color.setScalar(look.crowd)
    applyLights()
    render()
  }

  // The floor crowd is its own switch, so a view can be checked with and
  // without heads in the way, in either light.
  // Back to looking straight at the stage, after dragging the view around.
  const faceStage = () => {
    yaw = 0
    pitch = 0
    render()
  }

  // The current view as a picture: a plain 2D canvas copy, with the stage back
  // in the middle (no allowance for the page's panel). null mid-flight.
  const snapshot = () => {
    if (tween) return null
    const held = { ...hidden }
    setCovered(0, 0)
    // Copied in the same breath as the draw — the browser is free to clear a
    // WebGL canvas once the frame has been shown.
    const copy = document.createElement('canvas')
    copy.width = canvas.width
    copy.height = canvas.height
    copy.getContext('2d').drawImage(canvas, 0, 0)
    setCovered(held.right, held.bottom)
    return copy
  }

  // `counts` is { sectionId: how many headbands }.
  const setHeadbands = (counts) => {
    const positions = []
    for (const [id, count] of Object.entries(counts)) {
      // Just above the head, where the headband's lettering sits.
      for (const [x, y, z] of peopleIn(id, count)) positions.push(x, y + 0.22, z)
    }
    headbands.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    render()
  }

  const setHeadbandsShown = (shown) => {
    headbandsOn = shown
    applyLights()
    render()
  }

  const setCrowd = (shown) => {
    crowd.visible = shown
    render()
  }

  // Pixels of the view hidden behind the page's seat panel: down the right
  // edge on a wide screen, along the bottom on a phone. The view is shifted so
  // the stage sits in the middle of what's left, not behind the panel.
  const hidden = { right: 0, bottom: 0 }

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    if (hidden.right || hidden.bottom) camera.setViewOffset(w, h, hidden.right / 2, hidden.bottom / 2, w, h)
    else camera.clearViewOffset()
    if (tween) draw()
    else render()
  }

  const setCovered = (right, bottom = 0) => {
    hidden.right = right
    hidden.bottom = bottom
    resize()
  }

  // What's under a pointer: { id, depth, across } for a section or floor spot,
  // null for anything else (including the stage, which hides what's behind it).
  const raycaster = new THREE.Raycaster()
  const targets = [...Object.values(tierMeshes), ...Object.values(zoneMeshes), ...stage.meshes, ...rig]
  const pickSeat = (e) => {
    const rect = canvas.getBoundingClientRect()
    const point = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(point, camera)
    const hit = raycaster.intersectObjects(targets, false)[0]
    if (!hit) return null

    const { zone, tier } = hit.object.userData
    if (zone) return { id: zone.id, ...floorSpotAt(zone, hit.point.x, hit.point.z) }
    if (!tier) return null

    // Undo buildTier's ordering: section, then slice, then row.
    const cell = Math.floor(hit.faceIndex / FACES_PER_CELL)
    const row = cell % tier.rows
    const slice = Math.floor(cell / tier.rows) % SLICES
    const number = Math.floor(cell / (tier.rows * SLICES)) + 1
    // How far along that slice the tap landed.
    const { from, to } = sectionSpan(number)
    const offset = tier.offset + (row + 0.5) * tier.depth
    const a = pathPoint(from + ((to - from) * slice) / SLICES, offset)
    const b = pathPoint(from + ((to - from) * (slice + 1)) / SLICES, offset)
    const along =
      ((hit.point.x - a.x) * (b.x - a.x) + (hit.point.z - a.z) * (b.z - a.z)) /
      ((b.x - a.x) ** 2 + (b.z - a.z) ** 2)
    return {
      id: String(tier.base + number),
      depth: row / (tier.rows - 1),
      // Section numbers climb to your left, so `across` runs the other way.
      across: 1 - (slice + THREE.MathUtils.clamp(along, 0, 1)) / SLICES,
    }
  }

  const setHover = (id) => {
    if (id === hoverId) return
    hoverId = id
    canvas.style.cursor = id && id !== seatId ? 'pointer' : ''
    repaint()
    if (tween) draw()
    else render()
    onHover?.(id)
  }

  // One finger drags, two pinch; a press that doesn't travel is a tap.
  const pointers = new Map()
  let gesture = null
  const spread = () => {
    const [a, b] = [...pointers.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  const onDown = (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    canvas.setPointerCapture(e.pointerId)
    if (pointers.size === 1) gesture = { x: e.clientX, y: e.clientY, moved: false }
    if (pointers.size === 2) {
      gesture.moved = true
      gesture.spread = spread()
    }
  }

  const onMove = (e) => {
    const last = pointers.get(e.pointerId)
    if (!last) {
      // Not pressed: just a mouse passing over.
      if (e.pointerType === 'mouse') setHover(pickSeat(e)?.id ?? null)
      return
    }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (tween) return

    if (pointers.size === 2) {
      const now = spread()
      if (gesture.spread > 0) zoomBy(now / gesture.spread)
      gesture.spread = now
      return
    }

    if (!gesture.moved && Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) < TAP_SLOP) return
    gesture.moved = true
    const dx = e.clientX - last.x
    const dy = e.clientY - last.y
    if (mode === 'seat') {
      // Zoomed in, the same drag turns the view less, so it stays controllable.
      const speed = camera.fov / canvas.clientHeight
      yaw = THREE.MathUtils.clamp(yaw + dx * speed, -MAX_YAW, MAX_YAW)
      pitch = THREE.MathUtils.clamp(pitch + dy * speed, -MAX_PITCH, MAX_PITCH)
    } else {
      azimuth -= dx * 0.006
      polar = THREE.MathUtils.clamp(polar - dy * 0.006, MIN_POLAR, MAX_POLAR)
    }
    render()
  }

  const onUp = (e) => {
    if (!pointers.delete(e.pointerId) || pointers.size) return
    const tapped = gesture && !gesture.moved && e.type === 'pointerup'
    gesture = null
    if (!tapped || tween) return
    const picked = pickSeat(e)
    if (picked) onPick?.(picked)
  }

  const onLeave = () => setHover(null)

  // The wheel (or a trackpad pinch, which arrives as a wheel event) zooms.
  // Once the view is zoomed as far as it goes in that direction the event is
  // let through, so wheeling "out" past 1× carries on down the page instead of
  // trapping you on the view.
  const onWheel = (e) => {
    if (tween) return e.preventDefault()
    if (zoomBy(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002)))) e.preventDefault()
  }

  // Keyboard, while the view has focus: arrows look around, + and − zoom, and
  // 0 or Home faces the stage again.
  const KEY_TURN = 6
  const onKey = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const actions = {
      ArrowLeft: () => turn(-KEY_TURN, 0),
      ArrowRight: () => turn(KEY_TURN, 0),
      ArrowUp: () => turn(0, KEY_TURN),
      ArrowDown: () => turn(0, -KEY_TURN),
      '+': () => zoomBy(1.25),
      '=': () => zoomBy(1.25),
      '-': () => zoomBy(1 / 1.25),
      0: () => faceStage(),
      Home: () => faceStage(),
    }
    const action = actions[e.key]
    if (!action) return
    e.preventDefault()
    action()
  }

  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)
  canvas.addEventListener('pointerleave', onLeave)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('keydown', onKey)

  crowd.visible = startCrowd
  setNight(startNight)

  const dispose = () => {
    cancelAnimationFrame(frame)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onUp)
    canvas.removeEventListener('pointerleave', onLeave)
    canvas.removeEventListener('wheel', onWheel)
    canvas.removeEventListener('keydown', onKey)
    owned.forEach((item) => item.dispose())
    renderer.dispose()
  }

  return {
    setSeat,
    setMode,
    setZoom,
    zoomBy,
    setNight,
    setCrowd,
    setHeadbands,
    setHeadbandsShown,
    setCovered,
    faceStage,
    snapshot,
    resize,
    dispose,
  }
}
