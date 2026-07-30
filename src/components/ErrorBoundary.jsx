import { Component } from 'react'
import { Link } from 'react-router-dom'

// Catches render-time crashes so one bad value can't blank the whole site.
// Without this, an unexpected shape in a Google Sheet row (a missing column, a
// string where a number was expected) throws during render, React unmounts the
// entire tree, and every visitor gets a white page with no explanation.
//
// Must be a class — there's no hook equivalent of componentDidCatch.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Nothing is wired up to collect these, so the console is the only record.
    console.error('Page crashed:', error, info?.componentStack)
  }

  // Let the router reset the boundary: without this, navigating away from a
  // crashed page would keep showing the error screen forever.
  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-5xl font-extrabold text-purple">Oops</p>
        <h1 className="mt-4 text-2xl font-bold">This page hit a snag</h1>
        <p className="mt-2 max-w-md text-ink/70">
          Something went wrong while loading it. Reloading usually sorts it out.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="btn-primary">
            Reload page
          </button>
          <Link to="/" className="btn-ghost">
            Back home
          </Link>
        </div>
      </div>
    )
  }
}
