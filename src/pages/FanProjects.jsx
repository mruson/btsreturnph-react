import { Link, useSearchParams } from 'react-router-dom'
import { CityPageHero } from '../components/UI'
import { fanProjectDays } from '../data/fanProjects'

// One demo item: photo, clip, or YouTube embed. See `media` in data/fanProjects.js.
function Media({ item }) {
  if (item.type === 'youtube') {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl border-2 border-city-ink/10 bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${item.id}`}
          title={item.alt || 'Fan project demo'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    )
  }
  if (item.type === 'video') {
    return (
      <video
        src={item.src}
        poster={item.poster}
        controls
        playsInline
        className="aspect-video w-full rounded-xl border-2 border-city-ink/10 bg-black object-cover"
      />
    )
  }
  return (
    <img
      src={item.src}
      alt={item.alt || 'Fan project demo'}
      width="800"
      height="450"
      loading="lazy"
      decoding="async"
      className="aspect-video w-full rounded-xl border-2 border-city-ink/10 object-cover"
    />
  )
}

// Projects still waiting on a final design (the BRPH hand banners) show this
// instead of a demo image.
function StayTuned({ note }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-city-crimson/40 bg-city-cream px-6 text-center">
      <span className="city-banner -rotate-1 text-lg sm:text-xl">STAY TUNED</span>
      <p className="font-manila-body text-sm font-semibold text-city-ink/60">
        {note ?? 'Final design to be revealed soon.'}
      </p>
    </div>
  )
}

function MediaGallery({ media = [], stayTunedNote }) {
  if (!media.length) return <StayTuned note={stayTunedNote} />
  return (
    <div className={`grid gap-4 ${media.length > 1 ? 'sm:grid-cols-2' : ''}`}>
      {media.map((m, i) => (
        <Media key={m.src || m.id || i} item={m} />
      ))}
    </div>
  )
}

// One labelled row inside a project card ("What", "When", "Materials"…).
function Detail({ label, children }) {
  return (
    <div className="border-t-2 border-city-ink/10 py-3 sm:flex sm:gap-4">
      <p className="font-manila-body text-xs font-bold uppercase tracking-[0.2em] text-city-crimson sm:w-28 sm:shrink-0 sm:pt-0.5">
        {label}
      </p>
      <div className="mt-1 text-city-ink/80 sm:mt-0">{children}</div>
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-city-ink/10 bg-white shadow-sm">
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2 lg:gap-8">
        <div>
          <h3 className="font-manila text-2xl uppercase leading-tight sm:text-3xl">
            {project.title}
          </h3>

          <div className="mt-4">
            <Detail label="What">{project.what}</Detail>
            <Detail label="When">{project.when}</Detail>
            {project.materials?.length > 0 && (
              <Detail label="Materials">
                <ul className="space-y-1">
                  {project.materials.map((m) => (
                    <li key={m} className="flex gap-2">
                      <span aria-hidden className="text-city-crimson">
                        •
                      </span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </Detail>
            )}
            {project.need && <Detail label="We need">{project.need}</Detail>}
          </div>

          {project.reminder && (
            <p className="mt-4 rounded-xl bg-city-yellow/30 px-4 py-3 font-manila-body text-sm font-bold uppercase tracking-wide text-city-ink">
              ⚠ Reminder: {project.reminder}
            </p>
          )}

          {project.songId && (
            <Link
              to={`/fanchant?song=${project.songId}`}
              className="city-btn-outline mt-5 px-5 py-2.5 text-xs"
            >
              Practice on the Fanchant Guide →
            </Link>
          )}
        </div>

        <div className="lg:self-start">
          <MediaGallery media={project.media} stayTunedNote={project.stayTunedNote} />
        </div>
      </div>
    </article>
  )
}

export default function FanProjects() {
  // The open day lives in the URL (?day=day-2) so tabs are shareable + bookmarkable.
  const [params, setParams] = useSearchParams()
  const requested = params.get('day')
  const activeDay =
    fanProjectDays.find((d) => d.id === requested) ?? fanProjectDays[0]

  const selectDay = (id) => setParams(id === fanProjectDays[0].id ? {} : { day: id })

  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      <CityPageHero
        code="Concert Initiative · Team Loob"
        titleLines={['Team Loob', 'Fan Projects']}
        subtitle="Surprise projects we pull off together at PH Stadium. Know your cue, bring your materials, and let's make all three nights unforgettable."
      />

      <section className="py-12 sm:py-16">
        <div className="container-page">
          {/* Day sub-tabs */}
          <div
            role="tablist"
            aria-label="Concert days"
            className="flex flex-wrap gap-3"
          >
            {fanProjectDays.map((d) => {
              const active = d.id === activeDay.id
              return (
                <button
                  key={d.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectDay(d.id)}
                  className={`flex-1 rounded-2xl border-2 px-4 py-3 text-left transition sm:flex-none sm:px-6 ${
                    active
                      ? 'border-city-crimson bg-city-crimson text-white'
                      : 'border-city-ink/15 bg-white text-city-ink hover:border-city-crimson/40'
                  }`}
                >
                  <span className="block font-manila text-xl uppercase leading-none sm:text-2xl">
                    {d.label}
                  </span>
                  <span
                    className={`mt-1 block font-manila-body text-xs font-bold uppercase tracking-[0.15em] ${
                      active ? 'text-white/75' : 'text-city-ink/50'
                    }`}
                  >
                    {d.date}
                    {d.weekday ? ` · ${d.weekday}` : ''}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Projects for the open day */}
          <div className="mt-8 space-y-6">
            {activeDay.projects.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-city-ink/15 bg-white p-8 text-center text-city-ink/60">
                Projects for {activeDay.label} will be announced soon — watch our socials.
              </p>
            ) : (
              activeDay.projects.map((p) => <ProjectCard key={p.title} project={p} />)
            )}
          </div>
        </div>
      </section>

      {/* Footer CTA — volunteers */}
      <section className="bg-city-sky py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-manila text-3xl uppercase text-white sm:text-4xl">
              Want to lead your section?
            </h2>
            <p className="mt-3 text-lg text-city-cream">
              We need bibo leaders in every section to cue ARMY on the night. Message us on
              our official channels to join Team Loob.
            </p>
            <a
              href="https://www.facebook.com/btsreturnph"
              target="_blank"
              rel="noreferrer"
              className="city-btn mt-6 border-2 border-white text-white hover:bg-white hover:text-city-sky"
            >
              Volunteer with us →
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
