import { Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import { RouteFallback } from './components/UI'
import { routes } from './routes'
import NotFound from './pages/NotFound'

export default function App() {
  // Passing the path as resetKey clears a crashed page once you navigate away.
  const { pathname } = useLocation()

  return (
    <Layout>
      <ErrorBoundary resetKey={pathname}>
        {/* Pages are code-split (see routes.jsx); this shows while a chunk loads. */}
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {routes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
            <Route path="/donors" element={<Navigate to="/donations" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  )
}
