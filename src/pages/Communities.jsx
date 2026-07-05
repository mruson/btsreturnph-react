import { CityPageHero } from '../components/UI'

// Community channels — set each `href` to the real group/community link.
const communities = [
  { name: 'Facebook', img: '/concert/communities/messenger.png', href: 'https://www.messenger.com/cm/AbY6rLgHZgfUZXyW/' },
  { name: 'X', img: '/concert/communities/x.png', href: 'https://x.com/i/communities/1934253504765583407' },
  { name: 'Instagram', img: '/concert/communities/instagram.png', href: 'https://www.instagram.com/j/AbZSmjdDhPpvYDz5/' },
  { name: 'Viber', img: '/concert/communities/viber.png', href: 'https://invite.viber.com/?g2=AQA7V9uQ7BQdk1XtZRiKCQAXahYGm4nkqh9PNKu1sMV0niLLDVKy8e0yoVdLqalk&lang=en' },
  { name: 'Telegram', img: '/concert/communities/telegram.png', href: 'https://t.me/+qruhpHCcPklmZjA1' },
]

export default function Communities() {
  return (
    <div className="bg-city-cream font-manila-body text-city-ink">
      <CityPageHero
        code="Concert Initiative"
        titleLines={['Communities']}
        subtitle="Connect with fellow ARMYs and be updated on the latest news and activities for BTS in the City: Manila to Bulacan."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {communities.map((c) => (
              <div
                key={c.name}
                className="flex flex-col items-center rounded-2xl border-2 border-city-ink/10 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-city-crimson/40 hover:shadow-md"
              >
                <img src={c.img} alt={c.name} className="mb-4 w-24 max-w-full" />
                <h3 className="font-manila text-base uppercase leading-tight">{c.name}</h3>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="city-btn-primary mt-4 w-full"
                >
                  Join
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
