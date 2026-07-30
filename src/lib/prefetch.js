import { routes } from '../routes'

const byPath = new Map(routes.map((r) => [r.path, r.Component]))

// Start downloading a route's chunk before the user commits to the click.
// Safe to call repeatedly — the browser and the module cache both dedupe.
export function prefetchRoute(path) {
  byPath.get(path)?.preload?.()
}

// Spread onto a <Link>/<NavLink> to warm its chunk on hover, keyboard focus, or
// the moment a finger touches down. On mobile, touchstart fires ~100ms before
// the click, which is usually enough to hide the fetch entirely.
export function prefetchProps(to) {
  return {
    onMouseEnter: () => prefetchRoute(to),
    onFocus: () => prefetchRoute(to),
    onTouchStart: () => prefetchRoute(to),
  }
}
