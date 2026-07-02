import { Link } from 'react-router-dom'
import { subProjects } from '../data/site'
import { PageHero, Section, ImagePlaceholder } from '../components/UI'

export default function Projects() {
  return (
    <>
      <PageHero
        code="Comeback Initiative"
        title="Projects, side by side"
        subtitle="Every project below runs in parallel — pick where you want to help and jump in."
      />

      <Section>
        <div className="space-y-8">
          {subProjects.map((p, i) => (
            <div
              key={p.code}
              className={`grid items-center gap-8 lg:grid-cols-2 ${
                i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <ImagePlaceholder label={`${p.code} artwork`} />
              <div>
                <div className={`mb-4 h-1.5 w-12 rounded-full bg-${p.color}`} />
                <p className="font-display text-2xl font-extrabold text-purple">
                  {p.code}
                </p>
                <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">
                  {p.title}
                </p>
                <p className="mt-3 max-w-md text-lg text-ink/70">{p.blurb}</p>
                <Link to={p.to} className="btn-ghost mt-5">
                  Go to {p.title} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
