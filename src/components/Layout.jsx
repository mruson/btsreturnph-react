import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useSeo } from '../lib/seo'

// Scrolls to the top on every route change — or, for a link with a #section
// on it, to that section. Pages load in their own chunk and then fill in from
// the Google Sheet, so the section may not exist yet, and once it does, content
// arriving above it can push it down. So it's looked for, scrolled to, and
// lined up again a few times over the next few seconds — stopping as soon as
// the visitor scrolls or touches the page themselves.
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return undefined
    }
    const id = decodeURIComponent(hash.slice(1))
    let stopped = false
    const stop = () => {
      stopped = true
    }
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    events.forEach((e) => window.addEventListener(e, stop, { passive: true }))
    const started = Date.now()
    const timer = setInterval(() => {
      const target = document.getElementById(id)
      // Lined up once its top sits at its scroll margin from the top of the window.
      if (target && !stopped) {
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
        if (Math.abs(target.getBoundingClientRect().top - margin) > 2) target.scrollIntoView({ behavior: 'instant' })
      }
      if (stopped || Date.now() - started > 3000) clearInterval(timer)
    }, 150)
    return () => {
      clearInterval(timer)
      events.forEach((e) => window.removeEventListener(e, stop))
    }
  }, [pathname, hash])
  return null
}

export default function Layout({ children }) {
  // Title + share tags follow the route; see src/data/seo.js to edit the copy.
  useSeo()

  const { pathname } = useLocation()

  // The admin dashboard is an internal tool, not part of the public site. It
  // brings its own plain chrome, so the marketing navbar and footer would only
  // be noise — nobody signing in to check entries wants a link to BANGTANdahan.
  const bare = pathname.startsWith('/admin')

  if (bare) {
    return (
      <>
        <ScrollToTop />
        {children}
      </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
