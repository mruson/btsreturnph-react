import { lazy } from 'react'
import Home from './pages/Home'

// ============================================================================
// ROUTE TABLE — URL → page component.
// ============================================================================
// Every page except Home is code-split: each `import()` below becomes its own
// JS chunk, so a visitor downloads only the pages they actually open. This
// matters most for /fanchant, whose setlist data is ~105 KB on its own and used
// nowhere else.
//
// Home stays in the main bundle on purpose — it's the most common landing page,
// and splitting it would add a second round trip before anything paints.
//
// Adding a page? Add it here (and to `nav` in data/site.js if it belongs in the
// menu, and to routeSeo in data/seo.js for its share card).

// React.lazy hides the importer, but we want it back so links can start
// downloading a chunk on hover — before the click even lands. See lib/prefetch.
function split(importer) {
  const Component = lazy(importer)
  Component.preload = importer
  return Component
}

export const routes = [
  { path: '/', Component: Home },
  { path: '/about', Component: split(() => import('./pages/About')) },
  { path: '/projects', Component: split(() => import('./pages/Projects')) },
  { path: '/streaming', Component: split(() => import('./pages/Streaming')) },
  { path: '/donations', Component: split(() => import('./pages/Donations')) },
  { path: '/voting', Component: split(() => import('./pages/Voting')) },
  { path: '/concert', Component: split(() => import('./pages/Concert')) },
  { path: '/communities', Component: split(() => import('./pages/Communities')) },
  { path: '/bangtandahan', Component: split(() => import('./pages/Bangtandahan')) },
  { path: '/fanchant', Component: split(() => import('./pages/Fanchant')) },
  { path: '/fan-projects', Component: split(() => import('./pages/FanProjects')) },
  { path: '/partners', Component: split(() => import('./pages/Partners')) },
  { path: '/shop', Component: split(() => import('./pages/Shop')) },
]
