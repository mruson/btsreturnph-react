import { PageHero, Section, ImagePlaceholder } from '../components/UI'

// Add real donors here as they come in.
const donors = [
  'ARMY Fanbase A',
  'ARMY Fanbase B',
  'Anonymous Borahae',
  'Team RE:PLAY',
  'Team RE:CLAIM',
  'PH ARMY Collective',
]

export default function Donors() {
  return (
    <>
      <PageHero
        code="Thank You"
        title="Our donors & partners"
        subtitle="Every award for BTS is a 'thank you' from us — and this page is our thank you to you."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {donors.map((d) => (
            <div
              key={d}
              className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-4 shadow-sm"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-purple/10 font-display font-bold text-purple">
                💜
              </span>
              <span className="font-medium">{d}</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-ink/50">
          This is placeholder data — update the donor list in{' '}
          <code>src/pages/Donors.jsx</code>, or wire it to your Google Sheet.
        </p>
      </Section>

      <Section muted>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <ImagePlaceholder label="Donation tracker screenshot / chart" />
          <div>
            <h2 className="text-3xl font-extrabold">Full transparency</h2>
            <p className="mt-4 text-lg text-ink/70">
              A public donation tracker keeps every contribution visible. Embed your Google
              Sheet or a progress chart here so donors can follow exactly where funds go.
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}
