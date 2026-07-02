import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CityPageHero } from '../components/UI'
import { setlist } from '../data/setlist'

// --- YouTube IFrame API loader (once per page) -----------------------------
let ytApiPromise
function loadYouTubeAPI() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return ytApiPromise
}

// --- Hook: create one player, poll its time, swap videos -------------------
function useYouTube(videoId) {
  const hostRef = useRef(null)
  const playerRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadYouTubeAPI().then((YT) => {
      if (cancelled || !YT || !hostRef.current) return
      playerRef.current = new YT.Player(hostRef.current, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: { onReady: () => !cancelled && setReady(true) },
      })
    })
    return () => {
      cancelled = true
      if (playerRef.current?.destroy) playerRef.current.destroy()
      playerRef.current = null
    }
    // create once; video changes handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (ready && playerRef.current?.cueVideoById) {
      playerRef.current.cueVideoById(videoId)
      setCurrentTime(0)
    }
  }, [videoId, ready])

  useEffect(() => {
    if (!ready) return
    let raf = 0
    let last = 0
    const tick = () => {
      const now = performance.now()
      if (now - last > 150 && playerRef.current?.getCurrentTime) {
        last = now
        setCurrentTime(playerRef.current.getCurrentTime() || 0)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ready])

  const seekTo = useCallback((t) => {
    playerRef.current?.seekTo?.(t, true)
    playerRef.current?.playVideo?.()
  }, [])
  const getTime = useCallback(
    () => playerRef.current?.getCurrentTime?.() ?? 0,
    [],
  )

  return { hostRef, ready, currentTime, seekTo, getTime }
}

const fmt = (s) => {
  if (s == null) return '—'
  const m = Math.floor(s / 60)
  const sec = (s % 60).toFixed(1).padStart(4, '0')
  return `${m}:${sec}`
}

// --- Synced lyrics (guide mode) --------------------------------------------
function SyncedLyrics({ song, currentTime, onSeek }) {
  const listRef = useRef(null)
  const lineRefs = useRef([])

  const activeIndex = useMemo(() => {
    let idx = -1
    for (let i = 0; i < song.lyrics.length; i++) {
      const t = song.lyrics[i].t
      // Untimed lines (t == null) don't highlight, and stop the scan.
      if (t != null && t <= currentTime + 0.15) idx = i
      else break
    }
    return idx
  }, [currentTime, song])

  useEffect(() => {
    const container = listRef.current
    const el = lineRefs.current[activeIndex]
    if (container && el) {
      const top = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2
      container.scrollTo({ top, behavior: 'smooth' })
    }
  }, [activeIndex])

  return (
    <div
      ref={listRef}
      className="relative max-h-[65vh] overflow-y-auto rounded-2xl border-2 border-city-ink/10 bg-white p-5 sm:p-6"
    >
      {song.lyrics.map((line, i) => {
        const active = i === activeIndex
        return (
          <button
            key={i}
            type="button"
            ref={(el) => (lineRefs.current[i] = el)}
            onClick={() => onSeek(line.t)}
            className={`block w-full scroll-mt-24 rounded-lg px-3 py-2 text-left transition ${
              active ? 'bg-city-yellow/40' : 'hover:bg-city-ink/5'
            }`}
          >
            <span
              className={`font-manila text-lg uppercase leading-snug sm:text-xl ${
                active ? 'text-city-crimson' : 'text-city-ink'
              }`}
            >
              {line.text}
            </span>
            {line.chant && (
              <span className="mt-0.5 block font-manila-body text-sm font-bold uppercase tracking-wide text-city-sky">
                🗣 {line.chant}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// --- Tap-to-timestamp tool -------------------------------------------------
function TimestampTool({ song, getTime }) {
  const [times, setTimes] = useState(() => song.lyrics.map((l) => l.t ?? null))
  const [cursor, setCursor] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setTimes(song.lyrics.map((l) => l.t ?? null))
    setCursor(0)
  }, [song])

  const mark = useCallback(() => {
    setTimes((prev) => {
      const next = [...prev]
      if (cursor < next.length) next[cursor] = +getTime().toFixed(2)
      return next
    })
    setCursor((c) => Math.min(c + 1, song.lyrics.length))
  }, [cursor, getTime, song])

  const undo = useCallback(() => setCursor((c) => Math.max(0, c - 1)), [])
  const reset = () => {
    setTimes(song.lyrics.map(() => null))
    setCursor(0)
  }

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase()
      if (k === 'm') {
        e.preventDefault()
        mark()
      } else if (k === 'u') {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mark, undo])

  const json = JSON.stringify(
    song.lyrics.map((l, i) => ({
      t: times[i] ?? 0,
      text: l.text,
      chant: l.chant || '',
    })),
    null,
    2,
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked — user can select the text manually */
    }
  }

  return (
    <div className="rounded-2xl border-2 border-city-ink/10 bg-white p-5 sm:p-6">
      <p className="text-sm text-city-ink/70">
        Play the video, then hit <b>Mark</b> (or press <kbd className="rounded bg-city-ink/10 px-1.5">M</kbd>)
        right as each line starts. Press <kbd className="rounded bg-city-ink/10 px-1.5">U</kbd> or
        Undo to step back. When you&rsquo;re done, copy the data into
        <code> src/data/setlist.js</code>.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={mark} className="city-btn-primary">
          Mark line ▸
        </button>
        <button type="button" onClick={undo} className="city-btn-outline">
          Undo
        </button>
        <button type="button" onClick={reset} className="city-btn-outline">
          Reset
        </button>
        <button type="button" onClick={copy} className="city-btn-outline">
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>

      <div className="mt-5 max-h-[45vh] space-y-1 overflow-y-auto">
        {song.lyrics.map((line, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              i === cursor ? 'bg-city-yellow/40' : ''
            }`}
          >
            <span className="w-16 shrink-0 font-manila-body text-sm font-bold text-city-crimson">
              {fmt(times[i])}
            </span>
            <span className="font-manila-body text-sm">{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Fanchant() {
  const [songIndex, setSongIndex] = useState(0)
  const [mode, setMode] = useState('guide') // 'guide' | 'timestamp'
  const [params] = useSearchParams()
  // Hidden authoring tool — only for admins via ?edit=1, never shown to visitors.
  const editMode = params.get('edit') === '1'
  const activeMode = editMode ? mode : 'guide'
  const song = setlist[songIndex]
  const { hostRef, ready, currentTime, seekTo, getTime } = useYouTube(song.youtubeId)

  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      <CityPageHero
        code="Concert Initiative · ARIRANG Setlist"
        titleLines={['Fanchant', 'Guide']}
        subtitle="Learn every fanchant before the show. Pick a song, hit play — the lyrics follow along."
      />

      <section className="py-12 sm:py-16">
        <div className="container-page">
          {/* Setlist selector */}
          <div className="mb-8 flex flex-wrap gap-2">
            {setlist.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSongIndex(i)}
                className={`rounded-full px-4 py-2 font-manila-body text-sm font-bold uppercase tracking-wide transition ${
                  i === songIndex
                    ? 'bg-city-crimson text-white'
                    : 'border-2 border-city-ink/15 text-city-ink hover:border-city-crimson/40'
                }`}
              >
                {s.title}
                {s.note && (
                  <span className="ml-2 font-normal normal-case text-current/60">· {s.note}</span>
                )}
              </button>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Video + mode toggle */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border-2 border-city-ink/10 bg-black">
                <div ref={hostRef} className="h-full w-full" />
              </div>
              {!ready && (
                <p className="mt-2 text-center text-sm text-city-ink/50">Loading player…</p>
              )}

              {editMode && (
                <div className="mt-4 inline-flex rounded-full border-2 border-city-ink/15 p-1">
                  <button
                    type="button"
                    onClick={() => setMode('guide')}
                    className={`rounded-full px-4 py-1.5 font-manila-body text-sm font-bold uppercase tracking-wide transition ${
                      mode === 'guide' ? 'bg-city-crimson text-white' : 'text-city-ink'
                    }`}
                  >
                    Fanchant guide
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('timestamp')}
                    className={`rounded-full px-4 py-1.5 font-manila-body text-sm font-bold uppercase tracking-wide transition ${
                      mode === 'timestamp' ? 'bg-city-crimson text-white' : 'text-city-ink'
                    }`}
                  >
                    Timestamp mode
                  </button>
                </div>
              )}
            </div>

            {/* Lyrics / tool */}
            <div>
              <h2 className="mb-4 font-manila text-2xl uppercase leading-none sm:text-3xl">
                {song.title}
              </h2>
              {activeMode === 'guide' ? (
                <SyncedLyrics song={song} currentTime={currentTime} onSeek={seekTo} />
              ) : (
                <TimestampTool song={song} getTime={getTime} />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
