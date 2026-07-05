import { useState } from 'react'

// --- Inline brand-ish icons (currentColor, no image imports) ---------------
const icons = {
  spotify: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9" aria-hidden>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.42a.62.62 0 01-.86.2c-2.34-1.43-5.28-1.75-8.75-.96a.62.62 0 11-.28-1.21c3.79-.87 7.05-.5 9.67 1.11.3.18.39.56.22.86zm1.23-2.73a.78.78 0 01-1.07.26c-2.68-1.65-6.76-2.13-9.93-1.17a.78.78 0 11-.45-1.49c3.62-1.1 8.12-.56 11.2 1.33.36.22.48.7.25 1.07zm.1-2.85C14.83 8.94 9.3 8.76 6.24 9.69a.94.94 0 11-.54-1.8c3.52-1.06 9.62-.86 13.42 1.4a.94.94 0 01-.96 1.62z" />
    </svg>
  ),
  apple: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9" aria-hidden>
      <path d="M9 17.5a2.5 2.5 0 11-1.5-2.29V5.2l11-2.2v10.7A2.5 2.5 0 1117 16V6.4L9 8v9.5z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9" aria-hidden>
      <path d="M23 12s0-3.8-.48-5.6a2.9 2.9 0 00-2.04-2.05C18.7 4 12 4 12 4s-6.7 0-8.48.35A2.9 2.9 0 001.48 6.4C1 8.2 1 12 1 12s0 3.8.48 5.6a2.9 2.9 0 002.04 2.05C5.3 20 12 20 12 20s6.7 0 8.48-.35a2.9 2.9 0 002.04-2.05C23 15.8 23 12 23 12zM10 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  ),
  deezer: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9" aria-hidden>
      <rect x="2" y="14.5" width="4" height="3.5" rx="0.5" />
      <rect x="7.7" y="11" width="4" height="7" rx="0.5" />
      <rect x="13.3" y="7.5" width="4" height="10.5" rx="0.5" />
      <rect x="19" y="4" width="4" height="14" rx="0.5" />
    </svg>
  ),
}

const platforms = [
  { id: 'spotify', name: 'Spotify', icon: 'spotify' },
  { id: 'apple-music', name: 'Apple Music', icon: 'apple' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube' },
  { id: 'deezer', name: 'Deezer', icon: 'deezer' },
]

// --- Small content helpers -------------------------------------------------
function H4({ children }) {
  return <h4 className="mt-6 font-extrabold text-ink first:mt-0">{children}</h4>
}
function UL({ items }) {
  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/70">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  )
}

// --- Tabs -------------------------------------------------------------------
function Tabs({ tabs }) {
  const [active, setActive] = useState(0)
  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              active === i ? 'bg-purple text-white' : 'bg-purple/10 text-purple hover:bg-purple/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
        {tabs[active].content}
      </div>
    </div>
  )
}

function PlatformSection({ id, title, muted, tabs }) {
  return (
    <div id={id} className={`scroll-mt-24 ${muted ? 'bg-purple/5' : 'bg-white'}`}>
      <div className="container-page py-16 sm:py-20">
        <h2 className="text-3xl font-extrabold sm:text-4xl">{title}</h2>
        <Tabs tabs={tabs} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
export default function Streaming() {
  return (
    <>
      {/* Header */}
      <div className="bg-hero-gradient text-white">
        <div className="container-page py-14 text-center sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <img src="/about/replay.png" alt="BTS RE:PLAY PH" className="h-20 w-20 object-contain" />
            <h1 className="mt-4 font-display text-5xl font-extrabold sm:text-6xl">RE:PLAY</h1>
            <p className="mt-4 text-xl font-semibold text-white/90">
              The core of BTS is their music.
            </p>
            <p className="mt-3 text-white/85">
              RE:PLAY honors and celebrates Bangtan&rsquo;s artistry through consistently
              encouraging the community to stream BTS&rsquo; songs. Because every release of
              music is a message — it is meant to be heard.
            </p>
          </div>
        </div>
      </div>

      {/* Main Platforms — clickable, scroll to section */}
      <div className="container-page py-16 sm:py-20">
        <h2 className="text-center text-3xl font-extrabold text-purple sm:text-4xl">
          Main Platforms
        </h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="flex flex-col items-center gap-3 rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:border-purple/30 hover:shadow-md"
            >
              <span className="text-purple">{icons[p.icon]}</span>
              <span className="font-display text-xl font-extrabold text-ink">{p.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* SPOTIFY */}
      <PlatformSection
        id="spotify"
        title="Spotify"
        muted
        tabs={[
          {
            label: 'How to Stream',
            content: (
              <>
                <H4>General Steps</H4>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink/70">
                  <li>Open the Spotify app (or web player).</li>
                  <li>Go to &ldquo;Your Library.&rdquo;</li>
                  <li>Click &ldquo;Playlists.&rdquo;</li>
                  <li>Select a playlist to stream.</li>
                  <li>Play the first song.</li>
                  <li>Queue songs/albums and switch playlists occasionally.</li>
                </ol>

                <H4>✅ Streaming Do&rsquo;s</H4>
                <UL
                  items={[
                    'Use focused playlists with 3–5 filler songs. (Include remixes, instrumentals, and collaborations.)',
                    'Aim for 4–5 streams per song/hour.',
                    'Interact every 1–2 hours (like/unlike, pause, skip).',
                    'Offline streams count once device reconnects.',
                  ]}
                />

                <H4>❌ Streaming Dont&rsquo;s</H4>
                <UL
                  items={[
                    'No looping of the same song.',
                    'No muting the device.',
                    'No shuffle mode.',
                    'No VPNs, modded apps, or incognito tabs.',
                  ]}
                />

                <H4>📌 Account Limits</H4>
                <UL items={['Max 6 accounts per IP address. (Wi-Fi & mobile data have different IPs.)']} />

                <H4>⚙️ Settings to Adjust</H4>
                <UL items={['Turn off Autoplay.', 'Turn off Enhance.']} />
              </>
            ),
          },
          {
            label: 'Streaming & Chart Rules',
            content: (
              <UL
                items={[
                  "20 streams/day/song limit applies only to Spotify's charts.",
                  'Use versions & fillers to maximize chart impact.',
                  'All versions count toward Billboard charts.',
                  'Streams beyond the cap still count for IFPI records and other charts.',
                  'Chart streams are FILTERED. Desktop streams are UNFILTERED.',
                  'Tracking resets at 8:00 AM (PH Time).',
                ]}
              />
            ),
          },
          {
            label: 'Chart Basics',
            content: (
              <>
                <H4>Types of Charts</H4>
                <UL
                  items={[
                    'Top 50 – Most-streamed songs globally.',
                    'Top 200 – Most-streamed by country/region.',
                    'Viral 50 – Fastest-spreading songs.',
                    'Genre Top 50 – Most-streamed in a genre.',
                    'Top Artists – Most-streamed artists.',
                    'Top Albums – Most-streamed albums.',
                  ]}
                />

                <H4>How Spotify Counts Streams</H4>
                <p className="mt-2 text-ink/70">
                  Proprietary formula — not every stream is chart-eligible. Metrics include:
                </p>
                <UL
                  items={[
                    'Streams – Total plays.',
                    'Listeners – Unique users.',
                    'Virality – Shares & playlist adds.',
                    'Save Rate – Added to personal playlists.',
                    'Skip Rate – Skipped before ending.',
                  ]}
                />

                <H4>Factors Affecting Chart Rank</H4>
                <UL
                  items={[
                    'Major releases',
                    'Playlist inclusion',
                    'Social media virality',
                    'Seasonal trends',
                    'Promotional campaigns',
                  ]}
                />
              </>
            ),
          },
        ]}
      />

      {/* APPLE MUSIC */}
      <PlatformSection
        id="apple-music"
        title="Apple Music"
        tabs={[
          {
            label: 'How to Stream',
            content: (
              <>
                <p className="text-ink/70">
                  Compared to Spotify and YouTube, Apple Music DOES NOT have a FREE VERSION.
                  (FREE TRIALS AVAILABLE)
                </p>
                <p className="mt-3 font-bold text-ink">
                  NO FREE VERSION = ALL PREMIUM STREAMS = WEIGHS MORE ON ALL CHARTS
                </p>

                <H4>Streaming Do&rsquo;s</H4>
                <UL
                  items={[
                    'When using a playlist, check if LOOP, SHUFFLE AND AUTOPLAY IS OFF.',
                    'Use SHORT focused playlists (2–3 hours long) with recommended 1–2 filler songs only.',
                    'Use ADD TO QUEUE feature to queue multiple focused playlists instead of 1 long playlist.',
                    'Queue 1 BTS album to be streamed from top to bottom in between playlists.',
                  ]}
                />

                <H4>❌ Streaming Don&rsquo;ts</H4>
                <UL items={['Do not loop', 'Do not mute', 'Do not shuffle when using a playlist']} />

                <H4>Apple Music is available on:</H4>
                <UL items={['ALL Apple iOS devices', 'ANDROID', 'WINDOWS DESKTOP', 'ANY WEB BROWSER']} />
              </>
            ),
          },
          {
            label: 'AM Charts',
            content: (
              <>
                <H4>📊 Apple Music Charts</H4>

                <p className="mt-4 font-semibold text-ink">
                  Daily Charts — updates daily at 3PM PHT/4PM PHT
                </p>
                <UL items={['Top 100: Global', 'Top 100: Philippines', 'Top 25: Manila']} />

                <p className="mt-4 font-semibold text-ink">
                  Realtime Charts — updates hourly, divided by genres*, charts are based on YOUR
                  location
                </p>
                <UL items={['Top Songs', 'Top Albums', 'Top Videos', 'Top Playlists']} />
                <p className="mt-2 text-sm text-ink/60">
                  *BTS usually debuts in K-Pop, Pop, Hip-hop & All Genres (MAIN) Genre Charts.
                </p>

                <p className="mt-4 font-semibold text-ink">
                  Special Charts — tracks YOUR personal streaming habits by week, by month, by
                  year & ALL-TIME.
                </p>
                <UL items={['Apple Music Replay']} />
              </>
            ),
          },
          {
            label: 'More Info',
            content: (
              <>
                <H4>📌 Important Points</H4>
                <UL
                  items={[
                    'iTunes = For BUYING',
                    'Apple Music = For STREAMING',
                    'iTunes Charts ≠ Apple Music Charts',
                  ]}
                />

                <H4>ℹ️ Additional Information</H4>
                <UL
                  items={[
                    'You can use the same Apple ID to buy songs on iTunes and stream on Apple Music.',
                    'You DO NOT need to buy the songs on iTunes to be able to stream on Apple Music but you will need a premium subscription on Apple Music to stream.',
                    'You CAN stream songs, albums AND music videos on Apple Music. They will ALL count as premium streams.',
                    'Songs AND music videos count separately on Apple Music.',
                    'You CAN download albums and playlists for offline streaming. The streams will count once you are online again.',
                  ]}
                />
              </>
            ),
          },
        ]}
      />

      {/* YOUTUBE */}
      <PlatformSection
        id="youtube"
        title="YouTube"
        muted
        tabs={[
          {
            label: 'How to Stream',
            content: (
              <>
                <H4>✅ General Rules</H4>
                <UL
                  items={[
                    'Log in to your YouTube account.',
                    'Do not loop the video.',
                    'Do not mute the audio.',
                    'Keep video quality at 480p or higher.',
                    'Watch the entire video — do not skip to the end.',
                    'Use Default, Theater, or Full Screen mode. (Mini-player or minimized tabs may result in low-quality views.)',
                    'If using playlists, keep them short and well-distributed.',
                  ]}
                />

                <H4>🕙 First 24 Hours of Release</H4>
                <UL
                  items={[
                    'Avoid playlists in the first 24 hours — playlist views may take a day or more to validate.',
                    'Manual streaming is best — search for the MV using varied keywords to boost Trending placement.',
                    'If not manually streaming, set up a queue instead of using a playlist.',
                    'Limit plays of the focus MV to 5–6 times per hour.',
                    'Switch accounts if possible.',
                    'Engage: like, comment, reply to comments.',
                    'Add filler videos (audio tracks) between focus MV plays.',
                    'Billboard Charting Tip: Luminate counts only 50 views per ISRC per day.',
                  ]}
                />
              </>
            ),
          },
          {
            label: 'YouTube Charts',
            content: (
              <>
                <H4>🎵 Top Songs</H4>
                <p className="mt-1 text-ink/70">Updated: Weekly.</p>
                <p className="mt-2 text-ink/70">Includes:</p>
                <UL
                  items={[
                    'Official MVs',
                    'Official lyric videos (artist channel)',
                    'Visualizers',
                    'User-made videos uploaded on the artist channel',
                  ]}
                />

                <H4>🌟 Top Artists</H4>
                <p className="mt-1 text-ink/70">Updated: Weekly.</p>
                <p className="mt-2 text-ink/70">Includes:</p>
                <UL
                  items={[
                    'Official MVs',
                    'Official lyric videos',
                    'Official live performances',
                    'Remixes',
                    'Album songs',
                    'Collaborations',
                  ]}
                />

                <H4>🎥 Top Music Videos</H4>
                <p className="mt-1 text-ink/70">Updated: Daily & weekly.</p>
                <p className="mt-1 text-ink/70">Includes: Most-viewed official music videos.</p>

                <H4>🔥 Trending Chart</H4>
                <p className="mt-1 text-ink/70">Updated: Multiple times daily.</p>
                <p className="mt-1 text-ink/70">Basis: Popularity after release.</p>
                <p className="mt-1 text-ink/70">
                  Boost it by: Manual searches, link sharing, views, engagement.
                </p>
              </>
            ),
          },
        ]}
      />

      {/* DEEZER */}
      <PlatformSection
        id="deezer"
        title="Deezer"
        tabs={[
          {
            label: 'How to Stream',
            content: (
              <>
                <p className="text-ink/70">
                  Compared to Spotify and YouTube and similar to Apple Music, DEEZER DOES NOT
                  currently have a FREE VERSION. (FREE TRIALS AVAILABLE)
                </p>
                <p className="mt-3 font-bold text-ink">
                  NO FREE VERSION = ALL PREMIUM STREAMS = WEIGHS MORE ON ALL CHARTS
                </p>

                <H4>ℹ️ How to Stream</H4>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink/70">
                  <li>Open Deezer.</li>
                  <li>Search for &ldquo;BTS&rdquo; and click their artist page.</li>
                  <li>Click on the &ldquo;heart&rdquo; symbol to become a fan of BTS.</li>
                  <li>
                    Scroll down and play through the album or create a playlist with special
                    emphasis on the title track.
                  </li>
                </ol>
              </>
            ),
          },
          {
            label: 'Tips',
            content: (
              <>
                <H4>📌 Tips</H4>
                <UL
                  items={[
                    'Use queues to make a longer playlist with 2–3 filler songs.',
                    'Engage with a song/playlist every 2 hours. (like/unlike, pause, add more songs to queue)',
                    'Offline streams will be counted as soon as the device gets connected to the internet.',
                  ]}
                />
                <p className="mt-4 text-ink/70">
                  <strong>❌ You CANNOT:</strong> Add the same song from the same album multiple
                  times to one playlist.
                </p>
                <p className="mt-2 text-ink/70">
                  <strong>✅ You CAN:</strong> Add the same song with multiple versions to one
                  playlist (Single version, Album version, Special Edition version, Compilation,
                  etc).
                </p>
              </>
            ),
          },
        ]}
      />
    </>
  )
}
