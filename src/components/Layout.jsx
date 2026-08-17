import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useSeo } from '../lib/seo'

// Scrolls to the top on every route change.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
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
