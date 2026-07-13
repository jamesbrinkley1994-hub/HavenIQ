import { useNavigate, useLocation } from 'react-router-dom'

const LINKS = [
  { label: 'Dashboard',          path: '/haven/app' },
  { label: 'Public Booking Page', path: '/haven/book/demo' },
  { label: 'Landing Page',       path: '/haven' },
]

export default function DemoBar() {
  const navigate  = useNavigate()
  const { pathname } = useLocation()

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 6,
      background: '#0D0D1A',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '7px 10px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      backdropFilter: 'blur(8px)',
      whiteSpace: 'nowrap',
    }}>
      {/* Label */}
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
        paddingRight: 6, borderRight: '1px solid rgba(255,255,255,0.1)',
        marginRight: 2,
      }}>
        Demo
      </span>

      {LINKS.map(({ label, path }) => {
        const isActive = path === '/haven/app'
          ? pathname.startsWith('/haven/app')
          : pathname === path

        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              background: isActive ? '#6C63FF' : 'rgba(255,255,255,0.07)',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
            }}
            onMouseEnter={(e) => { if (!isActive) e.target.style.background = 'rgba(255,255,255,0.13)' }}
            onMouseLeave={(e) => { if (!isActive) e.target.style.background = 'rgba(255,255,255,0.07)' }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
