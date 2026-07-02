import { votingPlatforms } from '../data/site'
import { PageHero, Section, SectionHeading } from '../components/UI'

export default function Voting() {
  return (
    <>
      <PageHero
        code="RE:CLAIM"
        title="Every award is a thank you"
        subtitle="Voter education across every app so BTS gets the awards they earned."
      />

      <Section>
        <SectionHeading
          eyebrow="Where to Vote"
          title="Voting apps & categories"
          subtitle="Download each app, log in daily, and follow the tutorials linked per platform."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {votingPlatforms.map((p) => (
            <div key={p.app} className="card">
              <h3 className="text-xl font-bold text-purple">{p.app}</h3>
              <ul className="mt-3 space-y-2">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink/70">
                    <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-spring-pink" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="#" className="mt-4 inline-block text-sm font-semibold text-purple hover:underline">
                Voting tutorial →
              </a>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-ink/50">
          Add live "Ongoing" and "Upcoming" votings, plus real tutorial links, in{' '}
          <code>src/data/site.js</code>.
        </p>
      </Section>

      <Section muted>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-purple">Ongoing</h3>
            <p className="mt-2 text-ink/70">
              Active votings appear here with deadlines and direct links. Nothing running
              right now — check back soon.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-purple">Upcoming</h3>
            <p className="mt-2 text-ink/70">
              Scheduled award votings and pre-votes will be listed here so you can prepare
              in advance.
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}
