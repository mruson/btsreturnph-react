import { donationChannels, donationLinks } from '../data/site'
import { PageHero, Section, SectionHeading } from '../components/UI'

export default function Donations() {
  return (
    <>
      <PageHero
        code="RE:BUILD"
        title="Fund the comeback, together"
        subtitle="RE:BUILD is the funds-driven area of BTS RE:TURN PH — supporting BTS's comeback album and bringing them to the Philippine charts."
      />

      <Section>
        <SectionHeading
          eyebrow="Where funds go"
          title="Premium streaming & digital sales"
          subtitle="Contributions fund premium streaming accounts (Spotify, YouTube, Apple Music, Deezer) and digital sales before release."
        />

        <div className="grid gap-6 sm:grid-cols-3">
          {donationChannels.map((c) => (
            <div key={c.method} className="card text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-purple">
                {c.method}
              </p>
              <p className="mt-3 text-lg font-bold">{c.detail}</p>
              {c.name && <p className="mt-1 text-sm text-ink/60">{c.name}</p>}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a href={donationLinks.donateNow} className="btn-primary">
            Donate Now
          </a>
          <a href={donationLinks.tracker} className="btn-ghost" target="_blank" rel="noreferrer">
            View Donation Tracker
          </a>
        </div>
        <p className="mt-4 text-center text-sm text-ink/50">
          Replace the button links in <code>src/data/site.js</code> with your live portal
          and Google Sheets tracker.
        </p>
      </Section>

      <Section muted>
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-3">RE:PURCHASE</p>
          <h2 className="text-3xl font-extrabold">Committed PH-based buyers</h2>
          <p className="mt-4 text-lg text-ink/70">
            We're recruiting committed Philippine-based buyers for iTunes and Stationhead
            digital gifting to boost chart performance. Every purchase helps push BTS up the
            charts.
          </p>
        </div>
      </Section>
    </>
  )
}
