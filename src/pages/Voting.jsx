import { useMemo, useState } from 'react'
import { Section } from '../components/UI'
import { useSheet } from '../lib/sheet'
import { sheets } from '../data/site'

// Fallback shown before the "Votings" sheet loads / if it's unreachable.
// Live data: status (ongoing/upcoming) | award | nominee | start | app
const fallbackVotings = [
  { status: 'ongoing', award: 'Show Champion - Champion of Champion', nominee: 'BTS - SWIM', start: '', app: 'Idol Champ' },
  { status: 'upcoming', award: 'TFMA Best Song Summer', nominee: 'BTS - SWIM', start: 'July 6, 11AM PHT', app: 'Fannstar' },
]

// Voting apps — set each `tutorial` to the real tutorial link.
const apps = [
  { name: 'Mnet Plus App', icon: '/home/comeback/voting/mnet.png', items: ['Mcountdown Pre-vote', 'Mcountdown Live Vote', 'MAMA Voting'], tutorial: 'https://x.com/01Btsxarmy/status/1533006198756495362' },
  { name: 'Mubeat App', icon: '/home/comeback/voting/mubeat.png', items: ['Music Core Pre-vote', 'Music Live Vote (Top 3)'], tutorial: 'https://btsreturnph-snv.my.canva.site/mubeat' },
  {
    name: 'Fannstar App',
    icon: '/home/comeback/voting/fannstar.png',
    items: [{ text: 'The Fact Music Awards', sub: ['Best Music', 'Best Fan Choice'] }],
    tutorial: 'https://x.com/01Btsxarmy1/status/1485168497525022721',
  },
  { name: 'Idol Champ App', icon: '/home/comeback/voting/idolchamp.png', items: ['Show Champion Pre-vote'], tutorial: 'https://x.com/votingbrigade/status/1667364684293615617' },
  { name: 'Linc App', icon: '/home/comeback/voting/Linc.png', items: ['Inkigayo Pre-vote'], tutorial: 'https://btsreturnph-snv.my.canva.site/linc' },
  { name: 'Whosfan App', icon: '/home/comeback/voting/whosfan.png', items: ['Hanteo Music Awards', 'Whosfandom'], tutorial: 'https://x.com/votingbrigade/status/2008195890738282698?s=20' },
]

function VotingCard({ item }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <h3 className="font-display text-xl font-extrabold text-ink">{item.award}</h3>
      <p className="mt-2 text-lg text-ink/80">{item.nominee}</p>
      {item.start && <p className="mt-1 text-ink/70">Voting start: {item.start}</p>}
      <p className="mt-3 font-semibold text-purple">Voting App: {item.app}</p>
    </div>
  )
}

export default function Voting() {
  const [tab, setTab] = useState('ongoing')

  // Live votings from the "Votings" sheet, grouped by status. No loading state
  // needed — `fallbackVotings` is real content, so there's never a blank gap.
  const { rows } = useSheet(sheets.id, sheets.tabs.votings, fallbackVotings)
  const grouped = useMemo(
    () => ({
      ongoing: rows.filter((r) => String(r.status).toLowerCase().trim() === 'ongoing'),
      upcoming: rows.filter((r) => String(r.status).toLowerCase().trim() === 'upcoming'),
    }),
    [rows],
  )

  return (
    <>
      {/* RE:CLAIM header */}
      <div className="bg-hero-gradient text-white">
        <div className="container-page py-16 text-center sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <div className="flex items-center gap-4">
              <img
                src="/about/reclaim.png"
                alt="BTS RE:CLAIM PH"
                width="440"
                height="440"
                className="h-16 w-16 object-contain"
              />
              <span className="font-display text-5xl font-extrabold sm:text-6xl">RE:CLAIM</span>
            </div>
            <p className="mt-4 text-lg text-white/90">
              RE:CLAIM focuses on giving back. Every award for BTS is a &ldquo;thank you&rdquo;
              from us.
            </p>
          </div>
        </div>
      </div>

      {/* Where to Vote */}
      <Section>
        <h2 className="text-center font-display text-4xl font-extrabold text-purple sm:text-5xl">
          Where to Vote
        </h2>

        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 overflow-hidden rounded-xl">
          <button
            type="button"
            onClick={() => setTab('ongoing')}
            className={`py-4 font-display text-2xl font-extrabold transition ${
              tab === 'ongoing' ? 'bg-purple-light text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            Ongoing
          </button>
          <button
            type="button"
            onClick={() => setTab('upcoming')}
            className={`py-4 font-display text-2xl font-extrabold transition ${
              tab === 'upcoming' ? 'bg-purple-light text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            Upcoming
          </button>
        </div>

        <div className="mx-auto mt-8 grid max-w-2xl gap-6">
          {grouped[tab].length ? (
            grouped[tab].map((item) => <VotingCard key={item.award} item={item} />)
          ) : (
            <p className="text-center text-ink/60">Nothing {tab} right now — check back soon.</p>
          )}
        </div>
      </Section>

      {/* Voting Tutorials */}
      <Section muted>
        <div className="text-center">
          <h2 className="text-4xl font-extrabold sm:text-5xl">Voting Tutorials</h2>
          <p className="mt-2 font-semibold text-ink/70">* Updates based on upcoming votings</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {apps.map((app) => (
            <div
              key={app.name}
              className="grid overflow-hidden rounded-2xl border border-black/5 shadow-sm sm:grid-cols-2"
            >
              <div className="flex items-center justify-center bg-white p-5">
                <img
                  src={app.icon}
                  alt={`${app.name} icon`}
                  width="400"
                  height="400"
                  loading="lazy"
                  decoding="async"
                  className="w-full max-w-[200px]"
                />
              </div>
              <div className="flex flex-col bg-purple-light p-6 text-white">
                <h3 className="font-display text-xl font-extrabold">{app.name}</h3>
                <p className="mt-3 text-sm text-white/90">Votings held in the app:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-white/90">
                  {app.items.map((item, i) =>
                    typeof item === 'string' ? (
                      <li key={i}>{item}</li>
                    ) : (
                      <li key={i}>
                        {item.text}
                        <ul className="mt-1 list-[circle] space-y-1 pl-5">
                          {item.sub.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </li>
                    ),
                  )}
                </ul>
                <a
                  href={app.tutorial}
                  target="_blank"
                  rel="noreferrer"
                  className="btn mt-auto self-end bg-white text-purple hover:bg-white/90"
                >
                  Tutorial
                </a>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
