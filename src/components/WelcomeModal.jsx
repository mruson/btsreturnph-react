import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// ============================================================================
// WELCOME — a one-a-day introduction to BTS RE:TURN PH on /seat-view.
// ============================================================================
// The seat view brings a lot of people to the site for the first time, so the
// first visit each day opens with a short note about who we are and where the
// fan projects and donations are. Closing it in any way (a button, Escape, a
// tap outside) counts as seen until tomorrow, by the visitor's own calendar.

const STORAGE_KEY = 'brph:welcome-seen'

// Today as YYYY-MM-DD in the visitor's own time zone.
const today = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function seenToday() {
  try {
    return localStorage.getItem(STORAGE_KEY) === today()
  } catch {
    // Storage blocked: show it, once per page load.
    return false
  }
}

function markSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, today())
  } catch {
    // Nothing to remember it in; it will show again next visit.
  }
}

export default function WelcomeModal() {
  const [open, setOpen] = useState(() => !seenToday())
  // Focus goes to the dialog itself, not its first button: a button focused on
  // arrival would look picked before anything was chosen.
  const dialog = useRef(null)

  const close = () => {
    markSeen()
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return undefined
    dialog.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-city-ink/70 p-4"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        ref={dialog}
        tabIndex={-1}
        className="w-full max-w-lg rounded-2xl bg-white p-6 font-manila-body text-city-ink shadow-xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* One line at any width: sized to the room left inside the pop-up (screen
            width less its margins and padding), up to a cap. */}
        <h2
          id="welcome-title"
          className="whitespace-nowrap font-manila text-[min(1.6rem,calc((100vw_-_5.5rem)/17))] uppercase leading-none"
        >
          Welcome! First time with BTS RE:TURN PH?
        </h2>
        <p className="mt-3 text-city-ink/75">
          We&rsquo;re a collective of 60+ Philippine fanbases and individual ARMYs, working together on fan
          projects to welcome BTS back to the Philippines.
        </p>
        <div className="mt-6 space-y-2">
          <Link
            to="/concert"
            onClick={markSeen}
            className="block rounded-full border-2 border-city-sky px-5 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-city-sky transition hover:bg-city-sky hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-city-sky/30"
          >
            Learn about the fan projects
          </Link>
          <Link
            to="/concert#fund-update"
            onClick={markSeen}
            className="block rounded-full border-2 border-city-crimson px-5 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-city-crimson transition hover:bg-city-crimson hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-city-crimson/30"
          >
            Donate
          </Link>
          <button
            type="button"
            onClick={close}
            className="block w-full rounded-full px-5 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-city-ink/70 transition hover:text-city-crimson"
          >
            Find my seat
          </button>
        </div>
      </div>
    </div>
  )
}
