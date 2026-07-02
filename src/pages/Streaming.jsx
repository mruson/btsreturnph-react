import { Link } from 'react-router-dom'
import { PageHero, Section, SectionHeading } from '../components/UI'

const platforms = [
  { name: 'Spotify', tip: 'Stream on premium; avoid repeating a track back-to-back.' },
  { name: 'YouTube', tip: 'Watch official MVs; do not mute, skip ads, or loop rapidly.' },
  { name: 'Apple Music', tip: 'Add songs to your library and stream full tracks.' },
  { name: 'Deezer', tip: 'Stream the full album to boost chart eligibility.' },
]

export default function Streaming() {
  return (
    <>
      <PageHero
        code="RE:PLAY"
        title="Stream smart, stream together"
        subtitle="Coordinated streaming guidance so every play counts toward the charts."
      />

      <Section>
        <SectionHeading
          eyebrow="Where to Stream"
          title="Official platforms"
          subtitle="Use premium accounts where possible — funded together through RE:BUILD."
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {platforms.map((p) => (
            <div key={p.name} className="card">
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="mt-2 text-ink/70">{p.tip}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section muted>
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-extrabold">Need premium accounts?</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">
            Donations fund premium streaming accounts across Spotify, YouTube, Apple Music,
            and Deezer so streams count for the charts.
          </p>
          <Link to="/donations" className="btn-primary mt-6">
            Support RE:BUILD
          </Link>
        </div>
      </Section>
    </>
  )
}
