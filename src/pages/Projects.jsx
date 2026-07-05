import { Section, ImagePlaceholder } from '../components/UI'

// Numbered projects — set each `href` to the real form/link.
const projects = [
  {
    n: '01',
    code: 'RE:MIXED',
    tagline: 'Sponsor a BTS streaming playlist',
    desc: 'The RE:MIXED – Sponsor a Playlist initiative is a way for ARMYs to directly support BTS’s streaming goals. By sponsoring a playlist, you help create longer, engaging playlists that include your favorite BTS songs alongside recent releases and charting tracks.',
    href: 'https://docs.google.com/forms/d/e/1FAIpQLSfFo0Vy5z0MJ6TUZ7S5V0PrPyslTSDTbLvawgsoR7HE3KIHEg/viewform',
  },
  {
    n: '02',
    code: 'RE:FER A STREAMER',
    tagline: 'We are looking for PH ARMY Monster Streamers!',
    desc: 'An initiative to have streamers come together under one initiative. This would help PH ARMYs disseminate information, playlists and streaming / listening parties easily.',
    href: 'https://docs.google.com/forms/d/e/1FAIpQLSfrWDhjJFnfPDkxd-OkGX_zwawaW0ckM5KJBEo3fQkhz6Q7cQ/viewform',
  },
  {
    n: '03',
    code: 'RE:WARD',
    tagline: 'Merch for a cause',
    desc: 'Do you have BTS Merch that needs a new home? Brand new, pre-loved, sealed or unsealed, official or fanmade, your donated merch can bring smiles to our dedicated participants and keep the purple love alive!',
    href: 'https://docs.google.com/forms/d/e/1FAIpQLSdoSdDq6oTDG8bZJ8Gg0az0riKXw5xkjv-cTTVz8kN9prvW7g/viewform',
  },
]

export default function Projects() {
  return (
    <>
      {/* Header */}
      <div className="bg-hero-gradient">
        <div className="container-page py-14 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="flex items-center gap-4">
              <img src="/about/relive.png" alt="BTS RE:LIVE PH" className="h-16 w-16 object-contain" />
              <span className="font-display text-5xl font-extrabold text-purple sm:text-6xl">
                RE:LIVE
              </span>
            </div>
            <p className="mt-5 text-lg text-ink/70">
              RE:LIVE focuses the events and activities that will help amplify our cause.
            </p>
          </div>
        </div>
      </div>

      {/* Numbered projects — alternating bands */}
      {projects.map((p, i) => (
        <div key={p.code} className={i % 2 === 1 ? 'bg-white' : 'bg-purple/5'}>
          <div className="container-page py-14 sm:py-16">
            <div className="mx-auto max-w-3xl">
              <p className="font-display text-3xl font-extrabold text-ink/30">{p.n}</p>
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">{p.code}</h2>
              <p className="mt-2 font-bold text-ink">{p.tagline}</p>
              <p className="mt-3 text-ink/70">{p.desc}</p>
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-6"
              >
                Join Here
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* ARMYSANTA */}
      <Section muted>
        <div className="text-center">
          <h2 className="font-display text-4xl font-extrabold text-purple sm:text-5xl">
            ARMYSANTA
          </h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-6 sm:grid-cols-2">
            <img
              src="/home/comeback/projects/armysanta1.avif"
              alt="ArmySanta holiday donation drive"
              className="w-full rounded-2xl shadow-sm"
            />
            <img
              src="/home/comeback/projects/armysanta2.avif"
              alt="ArmySanta sponsorship tiers"
              className="w-full rounded-2xl shadow-sm"
            />
          </div>
        </div>
      </Section>

      {/* STREAMING HUB */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-extrabold sm:text-5xl">STREAMING HUB</h2>
            <p className="mt-6 text-ink/70">
              This is a coordinated <strong>in-person streaming session initiative</strong>{' '}
              held within the first 24 to 48 hours of BTS’s 2026 comeback album release. It
              brings together dedicated streamers in one location to focus solely on organized
              and continuous music streaming across multiple platforms.
            </p>
            <p className="mt-4 text-ink/70">
              The goal is to <strong>maximize chart performance</strong> during the crucial
              early tracking period through real-time monitoring, account management, and
              teamwork. This setup ensures efficiency, consistency, and unified effort among
              participants supporting BTS’s comeback.
            </p>
          </div>
          <ImagePlaceholder label="Streaming hub gallery" />
        </div>
      </Section>

      {/* BTS RE:PLAY HUB */}
      <div className="bg-purple/10">
        <div className="container-page py-16 sm:py-20">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center">
            <img src="/about/replay.png" alt="BTS RE:PLAY PH" className="w-40 shrink-0" />
            <div>
              <h2 className="text-4xl font-extrabold sm:text-5xl">BTS RE:PLAY HUB</h2>
              <p className="mt-6 text-lg text-ink/80">
                <strong>BTS RE:PLAY HUB</strong> is the flagship project of BTS RE:TURN
                PH&rsquo;s Streaming and Voting Department. It is a fan-made platform for PH
                ARMY streamers to coordinate streaming efforts, track streams, earn badges, and
                support BTS together. It is not officially affiliated with BTS or Big Hit Music.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PROJECTED BUDGET — hidden for now */}
      {false && (
        <Section>
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              BTS RE:TURN PROJECTED BUDGET
            </h2>
            <p className="mt-6 text-ink/70">
              This projected budget outlines how PH ARMYs are preparing to support BTS&rsquo;
              return through coordinated streaming and buying initiatives. Every peso raised is
              allocated with transparency and purpose—to strengthen chart impact, support
              dedicated streamers, and maximize our collective efforts nationwide for the
              comeback album. This is ARMY supporting BTS.
            </p>
            <a href="#" className="btn-primary mt-6">
              More Info
            </a>
          </div>
        </Section>
      )}
    </>
  )
}
