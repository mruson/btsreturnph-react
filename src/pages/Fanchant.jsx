import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CityPageHero } from '../components/UI'
import { setlist, coreSetlist } from '../data/setlist'

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

// Split a lyric line into plain / sing-along / custom-chant / struck segments.
//   [[ ]] → sing-along words, rendered blue    e.g. 'No, [[not today]]'
//   {{ }} → custom ARMY chant, rendered purple e.g. 'Mian… {{(ani)}}'
//   ~~ ~~ → lyric the chant REPLACES, struck through and muted
//           e.g. 'You know how I ~~do do do~~ [[(BTS! BTS! BTS!)]]'
// The line still reads as a full-size lyric. Crowd-only shouts (not sung by the
// members) are flagged with `chantOnly` on the line itself, which de-emphasizes
// them and adds a "Chant" badge.
const KINDS = ['chant', 'custom', 'struck']
function parseLine(text) {
  const segments = []
  const re = /\[\[(.+?)\]\]|\{\{(.+?)\}\}|~~(.+?)~~/g
  let last = 0
  let m
  while ((m = re.exec(text))) {
    if (m.index > last) segments.push({ text: text.slice(last, m.index), kind: 'plain' })
    const hit = KINDS.findIndex((_, k) => m[k + 1] !== undefined)
    segments.push({ text: m[hit + 1], kind: KINDS[hit] })
    last = m.index + m[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last), kind: 'plain' })
  return segments
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
        const segments = parseLine(line.text)
        const chantOnly = !!line.chantOnly
        return (
          <button
            key={i}
            type="button"
            ref={(el) => (lineRefs.current[i] = el)}
            onClick={() => onSeek(line.t)}
            className={`block w-full scroll-mt-24 rounded-lg px-3 text-left transition ${
              chantOnly ? 'py-1' : 'py-2'
            } ${active ? 'bg-city-yellow/40' : 'hover:bg-city-ink/5'}`}
          >
            <span className="flex items-start justify-between gap-2">
              <span
                className={
                  chantOnly
                    ? 'font-manila-body text-sm font-bold uppercase tracking-wide sm:text-base'
                    : 'font-manila text-lg uppercase leading-snug sm:text-xl'
                }
              >
                {segments.map((seg, si) => {
                  if (seg.kind === 'chant')
                    return (
                      <span
                        key={si}
                        className={`font-bold ${chantOnly ? 'text-purple' : 'text-city-sky'}`}
                      >
                        {seg.text}
                      </span>
                    )
                  if (seg.kind === 'custom')
                    return (
                      <span key={si} className="font-bold text-purple">
                        {seg.text}
                      </span>
                    )
                  if (seg.kind === 'struck')
                    return (
                      <span key={si} className="text-city-ink/35 line-through">
                        {seg.text}
                      </span>
                    )
                  return (
                    <span key={si} className={active ? 'text-city-crimson' : 'text-city-ink'}>
                      {seg.text}
                    </span>
                  )
                })}
              </span>
              {chantOnly && (
                <span className="mt-1 shrink-0 rounded-full bg-purple/15 px-2 py-0.5 font-manila-body text-[10px] font-bold uppercase tracking-widest text-purple">
                  Chant
                </span>
              )}
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

// Song shown first when the page loads.
const DEFAULT_SONG_INDEX = Math.max(0, setlist.findIndex((s) => s.id === 'hooligan'))

export default function Fanchant() {
  const [songIndex, setSongIndex] = useState(DEFAULT_SONG_INDEX)
  const [mode, setMode] = useState('guide') // 'guide' | 'timestamp'
  const [params] = useSearchParams()
  // Hidden authoring tool — only for admins via ?edit=1, never shown to visitors.
  const editMode = params.get('edit') === '1'
  const activeMode = editMode ? mode : 'guide'
  const song = setlist[songIndex]
  const { hostRef, ready, currentTime, seekTo, getTime } = useYouTube(song.youtubeId)

  const playerRef = useRef(null)
  const selectSong = (i) => {
    setSongIndex(i)
    // Wait for the new song to render, then scroll the player into view.
    requestAnimationFrame(() =>
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

  // Ready songs in Core Setlist (concert) order, for prev/next navigation.
  const readyOrder = useMemo(
    () =>
      coreSetlist
        .flatMap((g) => g.songs)
        .map((s) => (s.id ? setlist.findIndex((x) => x.id === s.id) : -1))
        .filter((idx) => idx !== -1)
        .map((idx) => ({ index: idx, title: setlist[idx].title })),
    [],
  )
  const pos = readyOrder.findIndex((o) => o.index === songIndex)
  const prevSong = pos > 0 ? readyOrder[pos - 1] : null
  const nextSong = pos >= 0 && pos < readyOrder.length - 1 ? readyOrder[pos + 1] : null

  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      <CityPageHero
        code="Concert Initiative · ARIRANG Setlist"
        titleLines={['Fanchant', 'Guide']}
        subtitle="Let's make PH Stadium a big karaoke session with BTS. Pick a song, hit play — the lyrics and fanchants will follow along."
      />

      <section className="py-12 sm:py-16">
        <div className="container-page">
          {/* Core setlist — full running order, grouped by act */}
          <div className="mb-10 rounded-2xl border-2 border-city-ink/10 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="font-manila text-2xl uppercase leading-none sm:text-3xl">
                ARIRANG TOUR Setlist
              </h2>
              <span className="font-manila-body text-xs font-bold uppercase tracking-wide text-city-ink/50">
                Tap a ready song to open its guide
              </span>
            </div>

            <div className="space-y-6">
              {coreSetlist.map((group) => (
                <div key={group.act}>
                  <h3 className="mb-2 font-manila-body text-sm font-bold uppercase tracking-widest text-city-crimson">
                    {group.act}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.songs.map((s) => {
                      const readyIndex = s.id
                        ? setlist.findIndex((x) => x.id === s.id)
                        : -1
                      const ready = readyIndex !== -1
                      const active = ready && readyIndex === songIndex
                      return (
                        <button
                          key={s.n}
                          type="button"
                          disabled={!ready}
                          onClick={() => ready && selectSong(readyIndex)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left font-manila-body transition ${
                            active
                              ? 'bg-city-crimson text-white'
                              : ready
                                ? 'border-2 border-city-ink/15 text-city-ink hover:border-city-crimson/40'
                                : 'cursor-not-allowed border-2 border-dashed border-city-ink/10 text-city-ink/40'
                          }`}
                        >
                          <span
                            className={`w-6 shrink-0 text-sm font-bold ${
                              active ? 'text-white/70' : 'text-city-ink/40'
                            }`}
                          >
                            {s.n}
                          </span>
                          {s.surprise ? (
                            <span className="flex-1">
                              <span
                                className={`city-banner text-xs sm:text-sm ${
                                  s.n % 2 ? 'rotate-2' : '-rotate-2'
                                }`}
                              >
                                ???
                              </span>
                            </span>
                          ) : (
                            <span className="flex-1 text-sm font-bold uppercase tracking-wide leading-tight">
                              {s.title}
                            </span>
                          )}
                          {!ready && !s.surprise && (
                            <span className="shrink-0 rounded-full bg-city-ink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-city-ink/50">
                              Soon
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={playerRef} className="grid scroll-mt-24 gap-8 lg:grid-cols-2">
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
              <h2 className="font-manila text-2xl uppercase leading-none sm:text-3xl">
                {song.title}
              </h2>
              {song.note && (
                <p className="mt-1.5 font-manila-body text-sm font-semibold text-city-crimson">
                  {song.note}
                </p>
              )}
              {/* Colour legend */}
              <div className="mb-4 mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="inline-flex items-center gap-2 font-manila-body text-sm font-bold uppercase tracking-wide text-city-sky">
                  <span className="h-3 w-3 rounded-full bg-city-sky" />
                  Blue: Sing-along
                </span>
                <span className="inline-flex items-center gap-2 font-manila-body text-sm font-bold uppercase tracking-wide text-purple">
                  <span className="h-3 w-3 rounded-full bg-purple" />
                  Purple: Chant
                </span>
              </div>
              {activeMode === 'guide' ? (
                <SyncedLyrics song={song} currentTime={currentTime} onSeek={seekTo} />
              ) : (
                <TimestampTool song={song} getTime={getTime} />
              )}
            </div>
          </div>

          {/* Prev / Next song — spans video + lyrics */}
          {activeMode === 'guide' && (
            <div className="mt-8 flex items-start justify-between gap-4">
              {prevSong ? (
                <button
                  type="button"
                  onClick={() => selectSong(prevSong.index)}
                  className="group flex flex-col items-start text-left"
                >
                  <span className="font-manila-body text-[10px] font-bold uppercase tracking-widest text-city-ink/50">
                    ← Previous
                  </span>
                  <span className="font-manila text-lg uppercase leading-none transition group-hover:text-city-crimson">
                    {prevSong.title}
                  </span>
                </button>
              ) : (
                <span />
              )}
              {nextSong ? (
                <button
                  type="button"
                  onClick={() => selectSong(nextSong.index)}
                  className="group flex flex-col items-end text-right"
                >
                  <span className="font-manila-body text-[10px] font-bold uppercase tracking-widest text-city-ink/50">
                    Next →
                  </span>
                  <span className="font-manila text-lg uppercase leading-none transition group-hover:text-city-crimson">
                    {nextSong.title}
                  </span>
                </button>
              ) : (
                <span />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
