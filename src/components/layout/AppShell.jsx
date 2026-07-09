import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { LogoMark } from '../ui'

// ── All nav items ────────────────────────────────────────
const ALL_NAV = [
  { id:'dashboard',  label:'Dashboard',  path:'/haven/app',            icon:GridIcon,     section:null },
  { id:'bookings',   label:'Bookings',   path:'/haven/app/bookings',   icon:CalIcon,      section:'Enquiries' },
  { id:'quotes',     label:'Quotes',     path:'/haven/app/quotes',     icon:DocIcon,      section:'Enquiries' },
  { id:'complaints', label:'Complaints', path:'/haven/app/complaints', icon:AlertIcon,    section:'Enquiries' },
  { id:'enquiries',  label:'Enquiries',  path:'/haven/app/enquiries',  icon:ChatIcon,     section:'Enquiries' },
  { id:'calendar',   label:'Calendar',   path:'/haven/app/calendar',   icon:CalendarIcon, section:'Tools' },
  { id:'knowledge',  label:'Knowledge',  path:'/haven/app/knowledge',  icon:BookIcon,     section:'Tools' },
  { id:'settings',   label:'Settings',   path:'/haven/app/settings',   icon:SettingsIcon, section:'Account' },
]

// Bottom tab bar shows these 5; rest go in "More"
const TAB_BAR_IDS = ['dashboard','bookings','calendar','enquiries','settings']

export default function AppShell({ title, topbarRight, children }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { bookings, quotes, complaints, enquiries } = useStore()
  const [moreOpen, setMoreOpen] = useState(false)

  // Live badge counts from store
  const BADGES = {
    bookings:   bookings.filter(b => b.status === 'pending' || b.status === 'missing').length || null,
    quotes:     quotes.filter(q => q.status === 'open').length || null,
    complaints: complaints.filter(c => c.status === 'open').length || null,
    enquiries:  enquiries.filter(e => e.status === 'open').length || null,
  }

  const isActive = (path) =>
    path === '/haven/app' ? location.pathname === '/haven/app' : location.pathname.startsWith(path)

  const go = (path) => { navigate(path); setMoreOpen(false) }

  const tabItems = ALL_NAV.filter(n => TAB_BAR_IDS.includes(n.id))
  const moreItems = ALL_NAV.filter(n => !TAB_BAR_IDS.includes(n.id))

  // Group sidebar nav by section for desktop
  const sections = []
  ALL_NAV.forEach(item => {
    const last = sections[sections.length - 1]
    if (!last || last.section !== item.section) sections.push({ section: item.section, items: [item] })
    else last.items.push(item)
  })

  return (
    <div className="app-shell">

      {/* ── Desktop sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <LogoMark size={28} />
          <span className="sidebar-logo-name">HavenIQ</span>
        </div>
        <nav style={{ flex:1, padding:'10px 0', overflowY:'auto' }}>
          {sections.map((group, gi) => (
            <div key={gi}>
              {group.section && <div className="sidebar-section-label">{group.section}</div>}
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`sidebar-link${isActive(item.path) ? ' active' : ''}`}
                  onClick={() => go(item.path)}
                >
                  <item.icon />
                  <span className="sidebar-link-label">{item.label}</span>
                  {BADGES[item.id] ? <span className="sidebar-badge">{BADGES[item.id]}</span> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">SM</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Sarah Mitchell</div>
              <div className="sidebar-user-role">Mitchell's Cleaning</div>
            </div>
            <button className="sidebar-signout" title="Sign out" onClick={() => navigate('/haven')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        <div className="topbar">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Mobile: logo in topbar */}
            <div className="topbar-mobile-logo">
              <LogoMark size={26} />
              <span style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>HavenIQ</span>
            </div>
            <span className="topbar-title">{title}</span>
          </div>
          <div className="topbar-actions">{topbarRight}</div>
        </div>

        <div className="page-content">{children}</div>
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="mobile-tab-bar">
        {tabItems.map(item => {
          const active = isActive(item.path)
          const badge  = BADGES[item.id]
          return (
            <button
              key={item.id}
              className={`mobile-tab${active ? ' active' : ''}`}
              onClick={() => go(item.path)}
            >
              <div className="mobile-tab-icon-wrap">
                <item.icon />
                {badge ? <span className="mobile-tab-badge">{badge}</span> : null}
              </div>
              <span className="mobile-tab-label">{item.label}</span>
            </button>
          )
        })}
        {/* More button */}
        <button
          className={`mobile-tab${moreOpen ? ' active' : ''}`}
          onClick={() => setMoreOpen(o => !o)}
        >
          <div className="mobile-tab-icon-wrap">
            <MoreIcon />
          </div>
          <span className="mobile-tab-label">More</span>
        </button>
      </nav>

      {/* ── More sheet ── */}
      {moreOpen && (
        <>
          <div className="more-backdrop" onClick={() => setMoreOpen(false)} />
          <div className="more-sheet">
            <div className="more-sheet-handle" />
            <div className="more-sheet-title">More</div>
            {moreItems.map(item => (
              <button
                key={item.id}
                className={`more-sheet-item${isActive(item.path) ? ' active' : ''}`}
                onClick={() => go(item.path)}
              >
                <div className="more-sheet-icon"><item.icon /></div>
                <span>{item.label}</span>
                {BADGES[item.id] ? <span className="sidebar-badge" style={{ marginLeft:'auto' }}>{BADGES[item.id]}</span> : null}
              </button>
            ))}
            <div style={{ height:8 }} />
          </div>
        </>
      )}
    </div>
  )
}

// ── Icons ────────────────────────────────────────────────
function GridIcon()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function CalIcon()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function DocIcon()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function AlertIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> }
function ChatIcon()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> }
function CalendarIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> }
function BookIcon()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> }
function MoreIcon()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg> }
function SettingsIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> }
