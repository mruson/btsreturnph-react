import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-purple">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page took a detour</h1>
      <p className="mt-2 text-ink/70">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">
        Back home
      </Link>
    </div>
  )
}
