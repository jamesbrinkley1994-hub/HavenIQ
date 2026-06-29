import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import AppShell from '../../components/layout/AppShell'
import { Badge, Btn, AiChip, Card } from '../../components/ui'

export default function Dashboard() {
  const navigate = useNavigate()
  const { bookings, quotes, complaints, enquiries, activity } = useStore()

  const pendingBookings  = bookings.filter((b) => b.status === 'pending' || b.status === 'missing')
  const openQuotes       = quotes.filter((q) => q.status === 'open')
  const openComplaints   = complaints.filter((c) => c.status === 'open')
  const openEnquiries    = enquiries.filter((e) => e.status === 'open')
  const awaitingInfo     = bookings.filter((b) => b.status === 'missing')

  const recentBookings = [...bookings].slice(0, 3)

  const SUMMARY = [
    { label:'New Bookings',   num:pendingBookings.length,  badge:`${pendingBookings.length}`,  bv:'info',    bg:'#EFF6FF', stroke:'#3B82F6', icon:CalIcon,   onClick:() => navigate('/haven/app/bookings') },
    { label:'Quote Requests', num:openQuotes.length,       badge:`${openQuotes.length}`,       bv:'neutral', bg:'#F5F3FF', stroke:'#7C3AED', icon:DocIcon,   onClick:() => navigate('/haven/app/quotes') },
    { label:'Complaints',     num:openComplaints.length,   badge:`${openComplaints.length}`,   bv:'danger',  bg:'#FEF2F2', stroke:'#EF4444', icon:AlertIcon, onClick:() => navigate('/haven/app/complaints') },
    { label:'Enquiries',      num:openEnquiries.length,    badge:`${openEnquiries.length}`,    bv:'neutral', bg:'#ECFDF5', stroke:'#10B981', icon:ChatIcon,  onClick:() => navigate('/haven/app/enquiries') },
    { label:'Awaiting Info',  num:awaitingInfo.length,     badge:`${awaitingInfo.length}`,     bv:'warning', bg:'#FFFBEB', stroke:'#F59E0B', icon:ClockIcon, onClick:() => navigate('/haven/app/bookings') },
  ]

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
      <div style={{ marginBottom:18 }}>
        <h2 style={{ fontSize:18, fontWeight:700 }}>Good morning, Sarah 👋</h2>
        <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>
          Here's what needs your attention today, Monday 14 July 2025.
        </p>
      </div>

      {/* Summary cards — clickable */}
      <div className="summary-grid">
        {SUMMARY.map((s) => (
          <div
            key={s.label}
            className="summary-card"
            onClick={s.onClick}
            style={{ cursor:'pointer', transition:'box-shadow 0.14s' }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow)'}
          >
            <div className="summary-card-top">
              <div className="summary-icon" style={{ background:s.bg }}>
                <s.icon stroke={s.stroke} />
              </div>
              <Badge variant={s.bv}>{s.badge}</Badge>
            </div>
            <div className="summary-number">{s.num}</div>
            <div className="summary-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent bookings */}
        <Card>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <span style={{ fontSize:13.5, fontWeight:600 }}>Recent Bookings</span>
            <Btn variant="secondary" size="sm" onClick={() => navigate('/haven/app/bookings')}>View all</Btn>
          </div>
          {recentBookings.length === 0 ? (
            <p style={{ fontSize:13, color:'var(--text-muted)', padding:'12px 0' }}>No bookings yet.</p>
          ) : recentBookings.map((b) => (
            <div key={b.id} className="mini-booking">
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div className="mini-booking-av">{b.avatar}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{b.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                    {b.details?.[0]?.[1]} · {b.details?.[1]?.[1]}
                  </div>
                </div>
              </div>
              <Badge variant={b.badgeVariant}>{b.badge}</Badge>
            </div>
          ))}
        </Card>

        {/* Activity feed — live */}
        <Card>
          <div style={{ fontSize:13.5, fontWeight:600, marginBottom:4 }}>Recent Activity</div>
          {activity.slice(0, 6).map((a) => (
            <div key={a.id} className="activity-row">
              <div className="activity-dot" style={{ background:a.color }} />
              <div>
                <div className="activity-text">
                  <strong>{a.bold}</strong>
                  {' ' + a.text.replace(a.bold, '').trim()}
                </div>
                <div className="activity-time">{a.time}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  )
}

function CalIcon({ stroke })  { return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function DocIcon({ stroke })  { return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function AlertIcon({ stroke }){ return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> }
function ChatIcon({ stroke })  { return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> }
function ClockIcon({ stroke }) { return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
