import { Link } from 'react-router-dom'
import { nav, socials, site } from '../data/site'

// Flatten nav (including dropdown children) into a single link list.
const allLinks = nav.flatMap((item) =>
  item.children ? item.children : [{ label: item.label, to: item.to }],
)

export default function Footer() {
  return (
    <footer className="bg-ink text-white/80">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-purple font-display text-lg font-extrabold text-white">
                R:
              </span>
              <span className="font-display text-lg font-extrabold text-white">
                {site.name}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">{site.mission}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Explore
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {allLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Follow
            </h3>
            <ul className="space-y-2 text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center">
          <p className="font-display font-semibold tracking-[0.2em] text-white">
            {site.tagline}
          </p>
          <p>© {new Date().getFullYear()} {site.name}. Built by ARMYs, for ARMYs.</p>
        </div>
      </div>
    </footer>
  )
}
