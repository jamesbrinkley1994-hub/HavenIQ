import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { Badge, Btn, AiChip, Card } from '../../components/ui'

const SUMMARY = [
  { label: 'New Bookings',    num: 5, badge: '+2 new', bv: 'info',    bg: '#EFF6FF', stroke: '#3B82F6', icon: CalIcon },
  { label: 'Quote Requests',  num: 2, badge: '2',      bv: 'neutral', bg: '#F5F3FF', stroke: '#7C3AED', icon: DocIcon },
  { label: 'Complaints',      num: 1, badge: '1',      bv: 'danger',  bg: '#FEF2F2', stroke: '#EF4444', icon: AlertIcon },
  { label: 'Enquiries',       num: 3, badge: '3',      bv: 'neutral', bg: '#ECFDF5', stroke: '#10B981', icon: ChatIcon },
  { label: 'Awaiting Info',   num: 2, badge: '2',      bv: 'warning', bg: '#FFFBEB', stroke: '#F59E0B', icon: ClockIcon },
]

const RECENT_BOOKINGS = [
  { av:'JH', name:'James Harper',  sub:'Deep Clean · Mon 14 Jul, 10am',   bv:'warning', label:'Pending' },
  { av:'EC', name:'Emma Clarke',   sub:'Regular Clean · Tue 15 Jul, 9am', bv:'success', label:'Confirmed' },
  { av:'TN', name:'Tom Nguyen',    sub:'End of Tenancy · Wed 16 Jul',     bv:'warning', label:'Pending' },
]

const ACTIVITY = [
  { color:'var(--success)', text:<><strong>Emma Clarke</strong> confirmed for Tue 15 Jul</>, time:'2 min ago' },
  { color:'var(--info)',    text:<><strong>New booking</strong> from James Harper</>,       time:'18 min ago' },
  { color:'var(--warning)', text:<><strong>Quote request</strong> from Rachel Burns — missing info</>, time:'45 min ago' },
  { color:'var(--danger)',  text:<><strong>Complaint</strong> from Daniel Lowe</>,          time:'2 hr ago' },
  { color:'var(--primary)', text:<><strong>Tom Nguyen</strong> submitted a booking</>,     time:'3 hr ago' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  return (
    <AppShell
      title="Dashboard"
      topbarRight={
        <>
          <AiChip label="AI Active" />
          <Btn variant="primary" size="sm" onClick={() => navigate('/haven/book/demo')}>
            Share booking page
          </Btn>
        </>
      }
    >
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Good morning, Sarah 👋</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          Here's what needs your attention today, Monday 14 July 2025.
        </p>
      </div>

      {/* Summary */}
      <div className="summary-grid">
        {SUMMARY.map((s) => (
          <div key={s.label} className="summary-card">
            <div className="summary-card-top">
              <div className="summary-icon" style={{ background: s.bg }}>
                <s.icon stroke={s.stroke} />
              </div>
              <Badge variant={s.bv}>{s.badge}</Badge>
            </div>
            <div className="summary-number">{s.num}</div>
            <div className="summary-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="dashboard-grid">
        {/* Recent bookings */}
        <Card>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <span style={{ fontSize:13.5, fontWeight:600 }}>Recent Bookings</span>
            <Btn variant="secondary" size="sm" onClick={() => navigate('/haven/app/bookings')}>View all</Btn>
          </div>
          {RECENT_BOOKINGS.map((b) => (
            <div key={b.name} className="mini-booking">
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div className="mini-booking-av">{b.av}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{b.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{b.sub}</div>
                </div>
              </div>
              <Badge variant={b.bv}>{b.label}</Badge>
            </div>
          ))}
        </Card>

        {/* Activity */}
        <Card>
          <div style={{ fontSize:13.5, fontWeight:600, marginBottom:4 }}>Recent Activity</div>
          {ACTIVITY.map((a, i) => (
            <div key={i} className="activity-row">
              <div className="activity-dot" style={{ background: a.color }} />
              <div>
                <div className="activity-text">{a.text}</div>
                <div className="activity-time">{a.time}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  )
}

// Small inline icons for summary cards
function CalIcon({ stroke }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function DocIcon({ stroke }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
}
function AlertIcon({ stroke }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}
function ChatIcon({ stroke }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
}
function ClockIcon({ stroke }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
