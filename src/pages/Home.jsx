import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Section } from '../components/UI'

// Activities Calendar events — edit these (set `formUrl` to the real form link).
const events = [
  {
    title: 'Comeback Countdown Streaming Party',
    date: 'July 15, 2026',
    desc: 'Kick off the comeback with a nationwide synchronized streaming party across every platform.',
    formUrl: '#',
  },
  {
    title: 'Voters Education Workshop',
    date: 'July 28, 2026',
    desc: 'Learn how each voting app works and why music-show and award wins matter for BTS.',
    formUrl: '#',
  },
  {
    title: 'Fundraising Bazaar',
    date: 'August 10, 2026',
    desc: 'A community bazaar to raise funds for the fan projects. Sign up to join as a seller or volunteer.',
    formUrl: '#',
  },
  {
    title: 'Nationwide Cup Sleeve Event',
    date: 'September 2026',
    desc: 'Celebrate together at partner cafés across the Philippines. Register your city or attend one near you.',
    formUrl: '#',
  },
]

function EventsCarousel({ items }) {
  const scroller = useRef(null)
  const nudge = (dir) => {
    const el = scroller.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }
  return (
    <div className="relative">
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((e) => (
          <article
            key={e.title}
            className="flex w-[85%] shrink-0 snap-start flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:w-[340px]"
          >
            <p className="eyebrow mb-2">{e.date}</p>
            <h3 className="text-lg font-extrabold text-ink">{e.title}</h3>
            <p className="mt-2 flex-1 text-sm text-ink/70">{e.desc}</p>
            <a
              href={e.formUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-5 w-full"
            >
              Sign Up
            </a>
          </article>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="Previous events"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-purple/30 text-purple transition hover:bg-purple/5"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label="More events"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-purple/30 text-purple transition hover:bg-purple/5"
        >
          ›
        </button>
      </div>
    </div>
  )
}

// "The Plan" — the four key areas (from the live site).
const planAreas = [
  {
    title: 'Streaming Guidance',
    img: '/home/streaming.png',
    desc: 'Encourage PH ARMYs to join streaming efforts and guide the community to healthy and efficient streaming habits.',
  },
  {
    title: 'Events Planning and Organization',
    img: '/home/events.png',
    desc: 'Organize remote and on-site events to bring the streaming and voting community together for a more amplified cause and goals.',
  },
  {
    title: 'Voters Education',
    img: '/home/voting.png',
    desc: "Educate and raise awareness among PH ARMYs in various platforms about the significance of awards in recognizing and celebrating BTS' artistry.",
  },
  {
    title: 'Fundraising Initiatives',
    img: '/home/funds.png',
    desc: 'Launch exciting fundraising projects and donation drives to prepare for the most anticipated BTS comeback in 2026.',
  },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <div className="bg-white">
        <div className="container-page grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight text-ink sm:text-6xl">
              BTS RE:TURN PH
            </h1>
            <p className="mt-6 max-w-lg text-2xl text-ink/90">
              Welcome to the official website of BTS RE:TURN PH: a BTS Comeback Initiative!
            </p>
            <p className="mt-5 max-w-lg text-ink/70">
              Join us as we unite for BTS&rsquo;s 2026 comeback through streaming, voting,
              fundraising, and celebration. This is where passion meets purpose — built by
              ARMYs, for ARMYs.
            </p>
            <p className="mt-4 max-w-lg text-ink/70">
              Stay updated on the latest campaigns, donation drives, team activities, and
              exciting events happening soon!
            </p>
            <div className="mt-8">
              <Link to="/donations" className="btn-primary">
                Get Involved
              </Link>
            </div>
          </div>
          <img
            src="/home/bts-photo.jpeg"
            alt="BTS"
            className="w-full rounded-2xl object-cover shadow-sm"
          />
        </div>
      </div>

      {/* "It's a movement" band */}
      <div className="bg-purple text-white">
        <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-2">
          <h2 className="text-3xl font-bold leading-snug sm:text-4xl">
            The most awaited BTS comeback in 2026 is not just a moment —{' '}
            <span className="font-extrabold">it&rsquo;s a movement.</span>
          </h2>
          <div className="space-y-4 text-lg text-white/90">
            <p>
              As BTS reunites as seven, Filipino ARMYs are coming together to launch a
              unified and meaningful nationwide celebration that amplifies BTS and showcases
              the strength of our fandom.
            </p>
            <p>
              This initiative is a collective effort by PH ARMYs, with no single organizer or
              central team.
            </p>
            <p>
              Read more about the project{' '}
              <Link to="/about" className="underline hover:text-white">
                here
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* The Plan */}
      <Section>
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl font-extrabold sm:text-5xl">The Plan</h2>
          <p className="mt-4 text-lg text-ink/70">
            The Streaming &amp; Voting Department of BTS RE:TURN PH will concentrate on four
            key areas.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {planAreas.map((p) => (
            <div key={p.title}>
              <img
                src={p.img}
                alt={p.title}
                className="mb-4 aspect-[4/5] w-full rounded-2xl object-cover"
              />
              <h3 className="text-xl font-extrabold text-ink">{p.title}</h3>
              <p className="mt-3 text-sm text-ink/70">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Activities Calendar */}
      <Section muted>
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold sm:text-5xl">Activities Calendar</h2>
          <p className="mt-4 text-lg text-ink/70">
            Upcoming initiatives and events — tap Sign Up to join.
          </p>
        </div>
        <EventsCarousel items={events} />
      </Section>
    </>
  )
}
