import { useEffect, useRef, useState } from 'react'

// Live countdown to a deadline, shown as four boxes: days / hrs / mins / secs.
//
//   <Countdown to={closesAt.getTime()} label="Entries close in" onComplete={…} />
//
// Styled for the SEVEN WITH YOU galaxy theme, since /raffle is its only caller:
// white numerals in translucent glass, meant to sit on a dark starfield. If a
// light-background page ever needs one, give this a variant prop the way
// Skeleton and LoadError in UI.jsx do rather than recolouring in place.
//
// `to` is epoch milliseconds rather than a Date so the effect's dependency stays
// a primitive — a fresh Date object every render would restart the timer each
// tick. `onComplete` fires once when the clock reaches zero, which is how the
// page flips from "opens in…" to the live form without the visitor reloading.

const UNITS = [
  { key: 'days', label: 'days', per: 24 * 60 * 60 * 1000 },
  { key: 'hours', label: 'hrs', per: 60 * 60 * 1000 },
  { key: 'minutes', label: 'mins', per: 60 * 1000 },
  { key: 'seconds', label: 'secs', per: 1000 },
]

function split(ms) {
  let left = Math.max(0, ms)
  return UNITS.map((u) => {
    const value = Math.floor(left / u.per)
    left -= value * u.per
    return { ...u, value }
  })
}

// `align="right"` only kicks in from `lg` up — on a narrow screen the countdown
// stacks under the title, where flush-left reads better.
export default function Countdown({ to, label, onComplete, align = 'left', className = '' }) {
  const right = align === 'right'
  const [remaining, setRemaining] = useState(() => to - Date.now())

  // Kept in a ref so a parent that passes an inline arrow doesn't restart the
  // interval on every render.
  const done = useRef(onComplete)
  done.current = onComplete

  useEffect(() => {
    setRemaining(to - Date.now())

    // Wall-clock difference each tick, not a decrementing counter: setInterval
    // drifts, and browsers throttle it in background tabs. Reading the clock
    // means a tab left open for an hour still shows the right number.
    const id = setInterval(() => {
      const left = to - Date.now()
      setRemaining(left)
      if (left <= 0) {
        clearInterval(id)
        done.current?.()
      }
    }, 1000)

    return () => clearInterval(id)
  }, [to])

  const parts = split(remaining)

  return (
    <div className={className}>
      {label && (
        <p
          className={`mb-2.5 font-[family-name:var(--rf-font-body)] text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--rf-soft)] ${
            right ? 'lg:text-right' : ''
          }`}
        >
          {label}
        </p>
      )}
      <div className={`flex gap-2 ${right ? 'lg:justify-end' : ''}`} role="timer">
        {parts.map((p) => (
          <div
            key={p.key}
            className="min-w-[54px] rounded-lg border border-[color:var(--rf-border-strong)] bg-[var(--rf-panel-hover)] px-2.5 py-2 text-center backdrop-blur-sm sm:min-w-[60px]"
          >
            <span className="block font-[family-name:var(--rf-font-display)] text-2xl uppercase leading-none tabular-nums text-[color:var(--rf-text)]">
              {String(p.value).padStart(2, '0')}
            </span>
            <span className="mt-1 block font-[family-name:var(--rf-font-body)] text-[9px] font-bold uppercase tracking-wider text-[color:var(--rf-soft)]">
              {p.label}
            </span>
          </div>
        ))}
      </div>
      {/* Seconds are left out on purpose: this text only changes once a minute,
          so a screen reader announces at that pace instead of every tick. */}
      <p className="sr-only" aria-live="polite">
        {parts[0].value} days, {parts[1].value} hours and {parts[2].value} minutes remaining
      </p>
    </div>
  )
}
