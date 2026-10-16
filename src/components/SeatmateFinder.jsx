import { useEffect, useState } from 'react'
import { fanProjectDays } from '../data/fanProjects'
import {
  PLATFORMS,
  HANDLE_PATTERN,
  cleanHandle,
  profileUrl,
  savedEntry,
  findSeatmates,
  checkSeatmates,
  removeSeatmate,
} from '../lib/seatmates'

// ============================================================================
// SEATMATE FINDER — the box in the /seat-view panel.
// ============================================================================
// Bleacher seats only. You save your seat with a name and a handle, and see
// whoever has saved the seat directly either side of you on the same day and
// row. Nobody's seat is shown anywhere else. See supabase/seatmates.sql.

const label = 'font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson'
const input = 'mt-1.5 w-full rounded-lg border-2 border-city-ink/15 bg-white px-3 py-2 text-sm font-semibold'

function Seatmates({ list }) {
  return (
    <ul className="mt-3 space-y-2">
      {list.map((mate) => {
        const url = profileUrl(mate.platform, mate.handle)
        return (
          <li key={`${mate.seat}-${mate.platform}-${mate.handle}`} className="rounded-lg bg-white px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-city-ink/50">Seat {mate.seat}</p>
            <p className="font-bold">{mate.name}</p>
            {url ? (
              <a href={url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-city-crimson underline">
                @{mate.handle} on {mate.platform}
              </a>
            ) : (
              <p className="text-sm">@{mate.handle}</p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// `section`, `row` and `seat` are the seat chosen in the panel; `day` is the
// fan-project day if one is picked, used as a starting guess.
export default function SeatmateFinder({ section, row, seat, day: startDay }) {
  const [day, setDay] = useState(startDay ?? null)
  const where = day ? { day, section, row, seat } : null
  const [form, setForm] = useState({ name: '', handle: '', platform: 'X' })
  // 'form' | 'confirm' | 'busy' | 'result'. Nothing is saved until the
  // visitor agrees on the 'confirm' step.
  const [stage, setStage] = useState('form')
  const [mates, setMates] = useState([])
  const [error, setError] = useState('')

  // A seat this browser has already saved opens straight on its result.
  useEffect(() => {
    setError('')
    if (!where || !savedEntry(where)) {
      setStage('form')
      return undefined
    }
    let alive = true
    setStage('busy')
    checkSeatmates(where)
      .then((list) => {
        if (!alive) return
        if (list) {
          setMates(list)
          setStage('result')
        } else setStage('form')
      })
      .catch((e) => {
        if (!alive) return
        setError(e.message)
        setStage('form')
      })
    return () => {
      alive = false
    }
    // `where` is rebuilt every render; its parts are what matter.
  }, [day, section, row, seat])

  const handle = cleanHandle(form.handle)
  const ready = day && form.name.trim() && HANDLE_PATTERN.test(handle)

  // Pressing the button only asks first; saving happens in `save`.
  const submit = (e) => {
    e.preventDefault()
    if (!ready) return
    setError('')
    setStage('confirm')
  }

  const save = async () => {
    setStage('busy')
    setError('')
    try {
      setMates(await findSeatmates(where, { name: form.name.trim(), handle, platform: form.platform }))
      setStage('result')
    } catch (err) {
      setError(err.message)
      setStage('form')
    }
  }

  const checkAgain = async () => {
    setStage('busy')
    try {
      const list = await checkSeatmates(where)
      if (list) {
        setMates(list)
        setStage('result')
      } else setStage('form')
    } catch (err) {
      setError(err.message)
      setStage('result')
    }
  }

  const remove = async () => {
    setStage('busy')
    try {
      await removeSeatmate(where)
      setMates([])
      setStage('form')
    } catch (err) {
      setError(err.message)
      setStage('result')
    }
  }

  return (
    <div className="mt-3 rounded-xl border-2 border-city-sky/40 bg-city-sky/5 p-4">
      <p className={label}>Seatmate finder</p>
      <p className="mt-1 text-sm text-city-ink/70">
        Find who&rsquo;s sitting right beside you, Section {section}, Row {row}, Seat {seat}. Only the people in
        the seats on either side of yours ever see your name and handle.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {fanProjectDays.map((d, i) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDay(i + 1)}
            aria-pressed={day === i + 1}
            className={`rounded-lg border-2 px-1 py-1.5 text-xs font-bold leading-tight transition ${
              day === i + 1 ? 'border-city-ink bg-city-ink text-city-cream' : 'border-city-ink/15 bg-white hover:border-city-ink/40'
            }`}
          >
            {d.label}
            <span className="block text-[10px] font-semibold opacity-70">{d.date}</span>
          </button>
        ))}
      </div>

      {stage === 'busy' && <p className="mt-3 text-sm font-semibold text-city-ink/60">Checking…</p>}

      {stage === 'form' && (
        <form onSubmit={submit} className="mt-3 space-y-3">
          <label className="block">
            <span className={label}>Your name</span>
            <input
              value={form.name}
              maxLength={40}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="What your seatmate can call you"
              className={input}
            />
          </label>
          <div>
            <span className={label}>Where to find you</span>
            <div className="mt-1.5 grid grid-cols-4 gap-1">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, platform: p })}
                  aria-pressed={form.platform === p}
                  className={`rounded-lg border-2 py-1.5 text-[11px] font-bold transition ${
                    form.platform === p ? 'border-city-crimson bg-city-crimson text-white' : 'border-city-ink/15 bg-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              value={form.handle}
              onChange={(e) => setForm({ ...form, handle: e.target.value })}
              placeholder="@yourhandle"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              className={input}
            />
            {form.handle && !HANDLE_PATTERN.test(handle) && (
              <p className="mt-1 text-xs font-semibold text-city-crimson">
                Handles can only have letters, numbers, dots and underscores.
              </p>
            )}
          </div>
          {error && <p className="text-sm font-semibold text-city-crimson">{error}</p>}
          <button
            type="submit"
            disabled={!ready}
            className="w-full rounded-full bg-city-ink px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-city-cream transition hover:bg-city-crimson disabled:opacity-40"
          >
            {day ? 'Find my seatmates' : 'Pick your concert day first'}
          </button>
        </form>
      )}

      {stage === 'confirm' && (
        <div className="mt-3 rounded-lg border-2 border-city-ink/15 bg-white p-3" role="alertdialog" aria-labelledby="seatmate-confirm">
          <p id="seatmate-confirm" className="font-bold">
            Before we save your seat
          </p>
          <p className="mt-1 text-sm text-city-ink/70">BTS RE:TURN PH will save:</p>
          <ul className="mt-1.5 space-y-0.5 text-sm">
            <li>
              <span className="text-city-ink/60">Seat:</span>{' '}
              <span className="font-semibold">
                {fanProjectDays[day - 1]?.label}, Section {section}, Row {row}, Seat {seat}
              </span>
            </li>
            <li>
              <span className="text-city-ink/60">Name:</span> <span className="font-semibold">{form.name.trim()}</span>
            </li>
            <li>
              <span className="text-city-ink/60">{form.platform}:</span> <span className="font-semibold">@{handle}</span>
            </li>
          </ul>
          <p className="mt-2 text-xs text-city-ink/70">
            Your seat is never shown publicly. Your name and handle are shown only to people who save the seat
            directly beside yours on the same day. Tickets aren&rsquo;t checked, so we can&rsquo;t confirm who they
            are. You can remove your details anytime with &ldquo;Remove me&rdquo; on this device, or by messaging us.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setStage('form')}
              className="rounded-full border-2 border-city-ink/15 px-3 py-2 text-xs font-bold uppercase tracking-wide transition hover:border-city-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-full bg-city-ink px-3 py-2 text-xs font-bold uppercase tracking-wide text-city-cream transition hover:bg-city-crimson"
            >
              I agree, save
            </button>
          </div>
        </div>
      )}

      {stage === 'result' && (
        <div className="mt-3">
          {mates.length ? (
            <>
              <p className="font-bold">
                {mates.length === 1 ? 'Your seatmate is here!' : 'Both your seatmates are here!'}
              </p>
              <Seatmates list={mates} />
              {mates.length === 1 && (
                <p className="mt-2 text-xs text-city-ink/60">Your other seatmate is yet to join.</p>
              )}
            </>
          ) : (
            <p className="text-sm">
              <span className="font-bold">Your seatmates are yet to join.</span> You&rsquo;re saved, so
              they&rsquo;ll find you when they do. Check back later.
            </p>
          )}
          {error && <p className="mt-2 text-sm font-semibold text-city-crimson">{error}</p>}
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={checkAgain}
              className="rounded-full border-2 border-city-ink px-3 py-2 text-xs font-bold uppercase tracking-wide transition hover:bg-city-ink hover:text-city-cream"
            >
              Check again
            </button>
            <button
              type="button"
              onClick={remove}
              className="rounded-full border-2 border-city-ink/15 px-3 py-2 text-xs font-bold uppercase tracking-wide text-city-ink/70 transition hover:border-city-crimson hover:text-city-crimson"
            >
              Remove me
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
