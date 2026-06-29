import { useNavigate, useLocation } from 'react-router-dom'
import { LogoMark, AiChip, HouseIcon } from '../ui'

const NAV = [
  {
    section: null,
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/haven/app', icon: GridIcon },
    ],
  },
  {
    section: 'Enquiries',
    items: [
      { id: 'bookings',   label: 'Bookings',   path: '/haven/app/bookings',   icon: CalIcon,      badge: 5 },
      { id: 'quotes',     label: 'Quotes',     path: '/haven/app/quotes',     icon: DocIcon,      badge: 2 },
      { id: 'complaints', label: 'Complaints', path: '/haven/app/complaints', icon: AlertIcon,    badge: 1 },
      { id: 'enquiries',  label: 'Enquiries',  path: '/haven/app/enquiries',  icon: ChatIcon,     badge: 3 },
    ],
  },
  {
    section: 'Tools',
    items: [
      { id: 'calendar',  label: 'Calendar',          path: '/haven/app/calendar',  icon: CalendarIcon },
      { id: 'knowledge', label: 'Business Knowledge', path: '/haven/app/knowledge', icon: BookIcon },
    ],
  },
  {
    section: 'Account',
    items: [
      { id: 'settings', label: 'Settings', path: '/haven/app/settings', icon: SettingsIcon },
    ],
  },
]

export default function AppShell({ title, topbarRight, children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/haven/app') return location.pathname === '/haven/app'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <LogoMark size={28} />
          <span className="sidebar-logo-name">Haven</span>
        </div>

        <nav style={{ flex: 1, padding: '10px 0' }}>
          {NAV.map((group, gi) => (
            <div key={gi}>
              {group.section && (
                <div className="sidebar-section-label">{group.section}</div>
              )}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`sidebar-link${isActive(item.path) ? ' active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon />
                  {item.label}
                  {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">SM</div>
            <div>
              <div className="sidebar-user-name">Sarah Mitchell</div>
              <div className="sidebar-user-role">Mitchell's Cleaning</div>
            </div>
            <button
              className="sidebar-signout"
              title="Sign out"
              onClick={() => navigate('/haven')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-actions">{topbarRight}</div>
        </div>
        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}

// ── Icons ───────────────────────────────────────────────
function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}
function CalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  )
}
function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}
