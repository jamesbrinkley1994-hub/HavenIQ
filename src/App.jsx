import { Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './store'
import DemoBar from './components/layout/DemoBar'
import Toast   from './components/ui/Toast'

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

export default function App() {
  return (
    <StoreProvider>
      <DemoBar />
      <Toast />
      <Routes>
        {/* ── Public ── */}
        <Route path="/haven"               element={<Landing />} />
        <Route path="/haven/book/demo"     element={<BookingPage />} />

        {/* ── Auth ── */}
        <Route path="/haven/signup"        element={<Signup />} />
        <Route path="/haven/login"         element={<Login />} />
        <Route path="/haven/onboarding"    element={<Onboarding />} />

        {/* ── App ── */}
        <Route path="/haven/app"           element={<Dashboard />} />
        <Route path="/haven/app/bookings"   element={<Bookings />} />
        <Route path="/haven/app/quotes"     element={<Quotes />} />
        <Route path="/haven/app/complaints" element={<Complaints />} />
        <Route path="/haven/app/enquiries"  element={<Enquiries />} />
        <Route path="/haven/app/calendar"   element={<Calendar />} />
        <Route path="/haven/app/knowledge"  element={<Knowledge />} />
        <Route path="/haven/app/settings"   element={<Settings />} />

        {/* ── Fallback → dashboard ── */}
        <Route path="*" element={<Navigate to="/haven/app" replace />} />
      </Routes>
    </StoreProvider>
  )
}
