import { PageHero, Section, ImagePlaceholder } from '../components/UI'

// Placeholder merch — swap in real products (or link to your store platform).
const products = [
  { name: 'RE:TURN Tote Bag', price: '₱350' },
  { name: 'Comeback Photocard Set', price: '₱250' },
  { name: 'STREAM · VOTE · CELEBRATE Tee', price: '₱550' },
  { name: 'ARMY Sticker Pack', price: '₱120' },
  { name: 'RE:LIVE Fan Banner', price: '₱200' },
  { name: 'Spring Palette Lanyard', price: '₱180' },
]

export default function Shop() {
  return (
    <>
      <PageHero
        title="Shop"
        subtitle="Every purchase helps fund the comeback initiative. 100% for the projects."
      />

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.name} className="card">
              <ImagePlaceholder label="Product photo" ratio="aspect-square" className="mb-4" />
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                <span className="font-bold text-purple">{p.price}</span>
              </div>
              <button className="btn-ghost mt-4 w-full" type="button">
                Add to cart
              </button>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-ink/50">
          These are placeholder products. Connect a store (Shopify, Gumroad, a Google Form,
          etc.) or edit the list in <code>src/pages/Shop.jsx</code>.
        </p>
      </Section>
    </>
  )
}
