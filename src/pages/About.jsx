import { PageHero, Section } from '../components/UI'

// The four sub-projects, shown with their badge logos under "About the title".
const subLogos = [
  { img: '/about/replay.png', code: 'RE:PLAY', label: 'for streaming' },
  { img: '/about/reclaim.png', code: 'RE:CLAIM', label: 'for voting' },
  { img: '/about/relive.png', code: 'RE:LIVE', label: 'for events' },
  { img: '/about/rebuild.png', code: 'RE:BUILD', label: 'for fundraising' },
]

export default function About() {
  return (
    <>
      <PageHero
        code="Initiative Overview"
        title="About the Project"
        subtitle="As BTS reunites as seven, Filipino ARMYs are coming together for one nationwide celebration."
      />

      {/* About the Project */}
      <Section>
        <div className="mx-auto max-w-3xl space-y-5 text-lg text-ink/80">
          <p>
            As BTS reunites as seven, Filipino ARMYs are coming together to launch a unified
            and meaningful nationwide celebration that amplifies BTS and showcases the
            strength of our fandom.
          </p>
          <p>
            This initiative is a collective effort by PH ARMYs, with no single organizer or
            central team.
          </p>
          <p>
            To prove that every contribution — big or small — matters. Every donation, every
            stream, every banner raised or post shared — when done together — becomes part of
            something greater. This campaign is proof that unity is our loudest voice.
          </p>
        </div>
      </Section>

      {/* About the title */}
      <Section muted>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">About the title</h2>
          <div className="mt-5 space-y-4 text-lg text-ink/80">
            <p>
              The title is a call to action. With BTS returning from military service, this
              initiative was created to prepare for their 2026 big comeback. It&rsquo;s also
              about us, PH ARMYs, returning to where we&rsquo;re strongest — streaming,
              voting, fundraising, and organizing events. And of course, it&rsquo;s a
              collective wish for BTS to return to the Philippines too.
            </p>
            <p>
              <strong>&ldquo;RE:TURN&rdquo;</strong> plays on the word turn (as in movement),
              and also sets the theme for our sub-projects.
            </p>
          </div>
        </div>
      </Section>

      {/* Behind the Logo */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <img
            src="/logo.png"
            alt="BTS RE:TURN PH logo"
            className="mx-auto w-full max-w-sm"
          />
          <div>
            <h2 className="text-3xl font-extrabold sm:text-4xl">Behind the Logo</h2>
            <div className="mt-5 space-y-4 text-lg text-ink/80">
              <p>
                For our official logo, we went with a clean and versatile wordmark — simple
                enough to blend seamlessly into any pubmat, yet bold enough to stand proudly
                on its own.
              </p>
              <p>
                The bright spring palette reflects the freshness and excitement of the
                group&rsquo;s comeback season, while the minimal graphic elements keep the
                spotlight on the title, giving it a light and uncluttered feel. For a
                meaningful detail, the colon is designed as a fusion of the BTS and ARMY
                logos — a subtle reminder that our identity will always be rooted in the bond
                between BTS and ARMY.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* The four sub-projects */}
      <Section muted>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">The sub-projects</h2>
          <p className="mt-3 text-lg text-ink/70">Four ways PH ARMYs RE:TURN together.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {subLogos.map((s) => (
            <div key={s.code} className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm">
              <img src={s.img} alt={`BTS ${s.code} PH`} className="mx-auto aspect-square w-full max-w-[220px] object-contain" />
              <p className="mt-2 font-display text-lg font-extrabold text-ink">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* About the Team */}
      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">About the Team</h2>
          <p className="mt-5 text-lg text-ink/80">
            The BTS RE:TURN PH Initiative is a collective of ARMY fanbases and individuals
            across the Philippines. Together, we plan and mobilize toward a single mission —
            to give BTS a successful comeback on the PH charts and a warm &lsquo;welcome
            back&rsquo; for their most-awaited return to Manila.
          </p>
        </div>

        <div className="mt-14 space-y-16">
          {/* Core Team */}
          <div className="text-center">
            <h3 className="text-2xl font-extrabold uppercase tracking-wide text-purple sm:text-3xl">
              Core Team
            </h3>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-ink/70">
              The core team plans, executes, and reports on every part of the initiative.
              It&rsquo;s organized into five departments, each owning a specific set of tasks
              that keep the whole initiative running smoothly.
            </p>
            <img
              src="/about/core.png"
              alt="BTS RE:TURN PH core team org chart"
              className="mx-auto mt-8 w-full max-w-4xl rounded-2xl"
            />
          </div>

          {/* Social Media Partners */}
          <div className="text-center">
            <h3 className="text-2xl font-extrabold uppercase tracking-wide text-purple sm:text-3xl">
              Social Media Partners
            </h3>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-ink/70">
              Our social media partners help us reach more ARMYs nationwide — amplifying the
              initiative&rsquo;s plans and calls to action so every fan can join in.
            </p>
            <img
              src="/about/social-media.png"
              alt="BTS RE:TURN PH social media partners"
              className="mx-auto mt-8 w-full max-w-4xl rounded-2xl"
            />
          </div>
        </div>
      </Section>
    </>
  )
}
