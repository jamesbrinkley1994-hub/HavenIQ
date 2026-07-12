import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { StoreProvider, useStore } from './store'
import Toast from './components/ui/Toast'

// Public
import Landing     from './pages/public/Landing'
import BookingPage from './pages/public/BookingPage'

// Auth
import Signup      from './pages/auth/Signup'
import Login       from './pages/auth/Login'
import Onboarding  from './pages/auth/Onboarding'

// App
import Dashboard   from './pages/app/Dashboard'
import Bookings    from './pages/app/Bookings'
import { Quotes, Complaints, Enquiries } from './pages/app/Queues'
import Calendar    from './pages/app/Calendar'
import Knowledge   from './pages/app/Knowledge'
import Settings    from './pages/app/Settings'

// ── Protected route — redirects to login if not authed ───
function ProtectedRoute({ children }) {
  const { user, loading } = useStore()
  const location = useLocation()

  if (loading) return (
    <div style={{
      height:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      flexDirection:'column', gap:12, background:'var(--bg)',
    }}>
      <div style={{
        width:36, height:36, border:'3px solid var(--primary-tint)',
        borderTop:'3px solid var(--primary)', borderRadius:'50%',
        animation:'spin 0.8s linear infinite',
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{fontSize:13, color:'var(--text-muted)'}}>Loading HavenIQ...</span>
    </div>
  )

  if (!user) return <Navigate to="/haven/login" state={{ from: location }} replace />
  return children
}

// ── Guest route — redirects to app if already authed ────
function GuestRoute({ children }) {
  const { user, loading } = useStore()
  if (loading) return null
  if (user) return <Navigate to="/haven/app" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Toast />
      <Routes>
        {/* ── Public ── */}
        <Route path="/haven"           element={<Landing />} />
        <Route path="/haven/book/demo" element={<BookingPage />} />
        <Route path="/haven/book/:slug" element={<BookingPage />} />

        {/* ── Auth (guest only) ── */}
        <Route path="/haven/signup"    element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/haven/login"     element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/haven/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

        {/* ── App (protected) ── */}
        <Route path="/haven/app"           element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/haven/app/bookings"   element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/haven/app/quotes"     element={<ProtectedRoute><Quotes /></ProtectedRoute>} />
        <Route path="/haven/app/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
        <Route path="/haven/app/enquiries"  element={<ProtectedRoute><Enquiries /></ProtectedRoute>} />
        <Route path="/haven/app/calendar"   element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/haven/app/knowledge"  element={<ProtectedRoute><Knowledge /></ProtectedRoute>} />
        <Route path="/haven/app/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/haven/login" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppRoutes />
    </StoreProvider>
  )
}
