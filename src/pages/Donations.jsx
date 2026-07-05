import { donationChannels, donationLinks } from '../data/site'
import { Section } from '../components/UI'

const tiers = [
  {
    name: 'Magic Shop',
    detail: 'For merch donations, bulk premium accounts, or large-scale contributions.',
    bg: 'bg-gradient-to-br from-purple-light to-spring-pink',
  },
  { name: 'For Youth', detail: '₱20,000 and above', bg: 'bg-gradient-to-br from-gray-200 to-gray-300' },
  { name: 'Dynamite', detail: '₱10,000 – ₱19,999', bg: 'bg-gradient-to-br from-spring-pink via-purple-light to-spring-mint' },
  { name: 'Run BTS', detail: '₱5,000 – ₱9,999', bg: 'bg-gradient-to-br from-gray-100 to-gray-400' },
  { name: 'MIC Drop', detail: '₱2,000 – ₱4,999', bg: 'bg-gradient-to-br from-red-400 to-red-600' },
]

const leaderboard = [
  { rank: 1, name: 'Chicken Shop and Bulletproof Army OT7', tier: 'For Youth', donation: '₱20,000', event: 'Matching Challenge' },
  { rank: 2, name: 'Hana Dul Shoppe', tier: 'Magic Shop', donation: '5 Arirang Album Random Version, 5 Arirang Album Legend Version, 1 ARMY Bomb', event: 'Lucky 7 Raffle Valentines Edition' },
  { rank: 3, name: '@LottiesxWorld', tier: 'Magic Shop', donation: '3 Arirang Albums (Random), 2 ARMY Membership', event: 'Lucky 7 Raffle' },
  { rank: 4, name: '@marmalade08', tier: 'Magic Shop', donation: '₱7,500 + 200 RUN SEOKJIN PENS', event: 'ARMY Santa' },
  { rank: 5, name: 'Cha', tier: 'Magic Shop', donation: '7777 worth of Apple Music Premium Accounts', event: 'ARMY Santa' },
]

export default function Donations() {
  return (
    <>
      {/* RE:BUILD header */}
      <div className="bg-hero-gradient text-white">
        <div className="container-page py-16 text-center sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <div className="flex items-center gap-4">
              <img src="/about/rebuild.png" alt="BTS RE:BUILD PH" className="h-16 w-16 object-contain" />
              <span className="font-display text-5xl font-extrabold sm:text-6xl">RE:BUILD</span>
            </div>
            <p className="mt-4 text-xl font-semibold text-white/90">
              RE:BUILD is the funds-driven area of BTS RE:TURN PH.
            </p>
            <p className="mt-4 text-white/85">
              To support BTS&rsquo; most anticipated comeback album, the ultimate goal is to be
              able to bring them in the Philippine Charts. In order to achieve this goal, the
              initiative will try to raise enough funds prior to the comeback release. Funds
              will be used to provide premium streaming accounts in various platforms such as
              Spotify, Youtube, Apple Music, and Deezer. Additionally, gathered donations will
              be used to support digital sales funding.
            </p>
            <a
              href={donationLinks.donateNow}
              target="_blank"
              rel="noreferrer"
              className="btn mt-8 bg-white text-purple hover:bg-white/90"
            >
              Donate Now
            </a>
          </div>
        </div>
      </div>

      {/* Donation channels */}
      <div className="bg-purple/5">
        <div className="container-page py-16 text-center sm:py-20">
          <h2 className="font-display text-4xl font-extrabold text-purple sm:text-5xl">
            DONATION CHANNELS
          </h2>
          <div className="mx-auto mt-10 grid max-w-3xl gap-8 sm:grid-cols-3">
            {donationChannels.map((c) => (
              <div key={c.method} className="flex flex-col items-center">
                <img
                  src={c.qr}
                  alt={`${c.method} QR code`}
                  className="aspect-square w-full max-w-[200px] rounded-xl bg-white object-contain p-2 shadow-sm"
                />
                <p className="mt-3 text-lg font-bold text-ink">{c.method}</p>
                <p className="text-ink/70">{c.detail}</p>
                {c.name && <p className="text-sm text-ink/50">{c.name}</p>}
              </div>
            ))}
          </div>

          <p className="mt-12 text-2xl font-semibold text-ink">Track your donations here!</p>
          <a
            href={donationLinks.tracker}
            target="_blank"
            rel="noreferrer"
            className="btn-primary mt-4"
          >
            Donation Tracker
          </a>
        </div>
      </div>

      {/* RE: PURCHASE */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-4xl font-extrabold sm:text-5xl">RE: PURCHASE</h2>
          <p className="mt-2 font-bold text-ink">Looking for iTunes and Stationhead buyers!</p>
          <p className="mt-4 text-ink/70">
            We are gathering a team of committed buyers from the Philippines for iTunes and
            Stationhead digital gifting to boost BTS&rsquo;s charting performance for upcoming
            releases.
          </p>
          <p className="mt-4 text-ink/70">
            Your participation will directly contribute to chart success and help our boys
            achieve greater milestones.
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScUVV9dcFO1dkIa51LRCYiuFCTbyHjCxyzHbbmOMI3ptMbCKg/viewform"
            target="_blank"
            rel="noreferrer"
            className="btn-primary mt-6"
          >
            Register Now
          </a>
        </div>
      </Section>

      {/* DONORS */}
      <Section muted>
        <h2 className="text-center font-display text-5xl font-extrabold text-purple">DONORS</h2>

        <h3 className="mt-12 text-center text-4xl font-extrabold sm:text-5xl">SPONSORSHIP TIERS</h3>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`flex min-h-[180px] flex-col items-center justify-center rounded-xl p-8 text-center ${t.bg}`}
            >
              <h4 className="text-2xl font-extrabold text-ink">{t.name}</h4>
              <p className="mt-3 text-ink/80">{t.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Sponsors leaderboard */}
      <Section>
        <h2 className="text-center text-4xl font-extrabold sm:text-5xl">SPONSORS LEADERBOARD</h2>
        <div className="mx-auto mt-10 max-w-4xl overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-purple text-white">
              <tr>
                <th className="border border-purple/30 px-4 py-3 font-semibold">Rank</th>
                <th className="border border-purple/30 px-4 py-3 font-semibold">Sponsor Name</th>
                <th className="border border-purple/30 px-4 py-3 font-semibold">Tier</th>
                <th className="border border-purple/30 px-4 py-3 font-semibold">Donation</th>
                <th className="border border-purple/30 px-4 py-3 font-semibold">Event</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r) => (
                <tr key={r.rank}>
                  <td className="border border-purple/20 px-4 py-3 font-semibold">{r.rank}</td>
                  <td className="border border-purple/20 px-4 py-3">{r.name}</td>
                  <td className="border border-purple/20 px-4 py-3">{r.tier}</td>
                  <td className="border border-purple/20 px-4 py-3 text-ink/70">{r.donation}</td>
                  <td className="border border-purple/20 px-4 py-3 text-ink/70">{r.event}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 text-center">
          <p className="text-2xl">Want to become a sponsor?</p>
          <a
            href={donationLinks.donateNow}
            target="_blank"
            rel="noreferrer"
            className="btn-primary mt-4"
          >
            Donate Here
          </a>
        </div>
      </Section>
    </>
  )
}
