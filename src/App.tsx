import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/utils/hooks/useAuth'
import { StoreProvider } from '@/utils/store'
import Auth from '@/pages/Auth'

// Lazy-loaded pages
const Dashboard    = lazy(() => import('@/pages/Dashboard'))
const Tasks        = lazy(() => import('@/pages/Tasks'))
const Finance      = lazy(() => import('@/pages/Finance'))
const Professional = lazy(() => import('@/pages/Professional'))
const Wellness     = lazy(() => import('@/pages/Wellness'))
const Visions      = lazy(() => import('@/pages/Visions'))
const Reviews      = lazy(() => import('@/pages/Reviews'))
const Documents    = lazy(() => import('@/pages/Documents'))
const Settings     = lazy(() => import('@/pages/Settings'))
const Menu         = lazy(() => import('@/pages/Menu'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  useEffect(() => {
    // Remove splash screen
    requestIdleCallback(() => {
      (window as { __removeSplash?: () => void }).__removeSplash?.()
    })
  }, [])

  if (loading) return <PageLoader />
  if (!user) return <Auth />

  return (
    <StoreProvider userId={user.id}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/tasks"       element={<Tasks />} />
            <Route path="/finance"     element={<Finance />} />
            <Route path="/professional" element={<Professional />} />
            <Route path="/wellness"    element={<Wellness />} />
            <Route path="/visions"     element={<Visions />} />
            <Route path="/reviews"     element={<Reviews />} />
            <Route path="/documents"   element={<Documents />} />
            <Route path="/settings"    element={<Settings />} />
            <Route path="/menu"        element={<Menu />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </StoreProvider>
  )
}
