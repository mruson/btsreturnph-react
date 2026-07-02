import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { nav, site } from '../data/site'

function Dropdown({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-ink/80 hover:text-purple"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {item.label}
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 min-w-[200px] rounded-xl border border-black/5 bg-white p-2 shadow-lg">
          {item.children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${
                  isActive ? 'bg-purple/10 text-purple' : 'text-ink/80 hover:bg-purple/5'
                }`
              }
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={closeMobile}>
          <img src="/logo.png" alt="BTS RE:TURN PH logo" className="h-11 w-auto" />
          <span className="leading-tight">
            <span className="block font-display text-lg font-extrabold tracking-tight">
              {site.name}
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60">
              {site.tagline}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) =>
            item.children ? (
              <Dropdown key={item.label} item={item} />
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium ${
                    isActive ? 'text-purple' : 'text-ink/80 hover:text-purple'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
          <Link to="/donations" className="btn-primary ml-2">
            Get Involved
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-black/5 bg-white lg:hidden">
          <div className="container-page space-y-1 py-4">
            {nav.map((item) =>
              item.children ? (
                <div key={item.label} className="py-1">
                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
                    {item.label}
                  </p>
                  {item.children.map((c) => (
                    <NavLink
                      key={c.to}
                      to={c.to}
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-2 text-sm text-ink/80 hover:bg-purple/5"
                    >
                      {c.label}
                    </NavLink>
                  ))}
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobile}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-ink/80 hover:bg-purple/5"
                >
                  {item.label}
                </NavLink>
              ),
            )}
            <Link to="/donations" onClick={closeMobile} className="btn-primary mt-2 w-full">
              Get Involved
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
