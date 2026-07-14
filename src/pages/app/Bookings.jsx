import { useState } from 'react'
import { useStore } from '../../store'
import AppShell from '../../components/layout/AppShell'
import { QueueCard } from '../../components/ui/QueueCard'
import { Btn, Badge } from '../../components/ui'

// Pending queue = needs action. Confirmed = separate tab. Declined = removed.
const TABS = [
  { id:'pending',   label:'Needs action' },
  { id:'confirmed', label:'Confirmed'    },
  { id:'replied',   label:'Replied'      },
]

export default function Bookings() {
  const { bookings, approveBooking, declineBooking, cancelBooking, sendSuggestedReply } = useStore()
  const [tab, setTab] = useState('pending')

  const pendingCount   = bookings.filter(b => b.status === 'pending' || b.status === 'missing').length
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const repliedCount   = bookings.filter(b => b.status === 'replied').length

  const visible = bookings.filter(b => {
    if (tab === 'pending')   return b.status === 'pending' || b.status === 'missing'
    if (tab === 'confirmed') return b.status === 'confirmed'
    if (tab === 'replied')   return b.status === 'replied'
    return false
  })

  const countFor = (t) => {
    if (t === 'pending')   return pendingCount
    if (t === 'confirmed') return confirmedCount
    if (t === 'replied')   return repliedCount
    return 0
  }

  return (
    <AppShell title="Bookings">
      <div className="page-header">
        <div>
          <h1>Booking Queue</h1>
          <p>
            {tab === 'pending'   && `${pendingCount} request${pendingCount !== 1 ? 's' : ''} need your action`}
            {tab === 'confirmed' && `${confirmedCount} confirmed booking${confirmedCount !== 1 ? 's' : ''}`}
            {tab === 'replied'   && `${repliedCount} replied booking${repliedCount !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display:'flex', gap:0, borderBottom:'1px solid var(--border)',
        marginBottom:20,
      }}>
        {TABS.map(t => {
          const count = countFor(t.id)
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding:'9px 18px', border:'none', borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom:-1, background:'none', cursor:'pointer',
                fontSize:13.5, fontWeight: tab === t.id ? 600 : 500,
                color: tab === t.id ? 'var(--primary)' : 'var(--text-muted)',
                fontFamily:'inherit', display:'flex', alignItems:'center', gap:7,
              }}
            >
              {t.label}
              {count > 0 && (
                <span style={{
                  background: t.id === 'pending' ? 'var(--warning)' : 'var(--border)',
                  color:      t.id === 'pending' ? '#fff' : 'var(--text-muted)',
                  fontSize:10, fontWeight:700, padding:'1px 6px',
                  borderRadius:10, minWidth:18, textAlign:'center',
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="queue-list">
          {visible.map(b => (
            <QueueCard
              key={b.id}
              {...b}
              actions={
                /* ── Missing info — show reply + approve/decline ── */
                b.status === 'missing' ? (
                  <>
                    <Btn variant="secondary" size="sm"
                      onClick={() => sendSuggestedReply(b.id, 'booking')}>
                      Send suggested reply
                    </Btn>
                    <Btn variant="success" size="sm"
                      onClick={() => approveBooking(b.id)}>✓ Approve anyway</Btn>
                    <Btn variant="danger" size="sm"
                      onClick={() => declineBooking(b.id)}>✕ Decline</Btn>
                  </>
                ) :
                /* ── Pending — approve or decline ── */
                b.status === 'pending' ? (
                  <>
                    <Btn variant="success" size="sm"
                      onClick={() => approveBooking(b.id)}>✓ Approve</Btn>
                    <Btn variant="danger" size="sm"
                      onClick={() => declineBooking(b.id)}>✕ Decline</Btn>
                  </>
                ) :
                /* ── Confirmed — read only, but cancellable ── */
                b.status === 'confirmed' ? (
                  <>
                    <span style={{ fontSize:12.5, color:'var(--success)', fontWeight:600 }}>
                      ✓ Confirmed — appears on calendar
                    </span>
                    <Btn variant="danger" size="sm" style={{ marginLeft:'auto', flex:0 }}
                      onClick={() => {
                        if (window.confirm(`Cancel the confirmed booking for ${b.name}? This can't be undone and will free up the slot.`)) {
                          cancelBooking(b.id)
                        }
                      }}>Cancel booking</Btn>
                  </>
                ) :
                /* ── Replied — awaiting customer response ── */
                b.status === 'replied' ? (
                  <>
                    <span style={{ fontSize:12.5, color:'var(--primary)', fontWeight:600 }}>
                      ✉ Reply sent — awaiting customer
                    </span>
                    <Btn variant="success" size="sm" style={{ marginLeft:'auto', flex:0 }}
                      onClick={() => approveBooking(b.id)}>Approve</Btn>
                    <Btn variant="danger" size="sm" style={{ flex:0 }}
                      onClick={() => declineBooking(b.id)}>Decline</Btn>
                  </>
                ) : null
              }
            />
          ))}
        </div>
      )}
      <div style={{display:'flex',gap:8,alignItems:'center',justifyContent:'center',marginTop:20,padding:'10px 14px',fontSize:12,color:'var(--text-muted)'}}>
        📥 Not seeing an expected notification? Check your junk/spam folder — new senders can land there at first.
      </div>
    </AppShell>
  )
}

function EmptyState({ tab }) {
  const msgs = {
    pending:   { icon:'✅', text:'No pending requests — you\'re all caught up.' },
    confirmed: { icon:'📅', text:'No confirmed bookings yet. Approve requests to see them here.' },
    replied:   { icon:'✉️', text:'No bookings awaiting a reply.' },
  }
  const { icon, text } = msgs[tab] || { icon:'📭', text:'Nothing here.' }
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
      <div style={{ fontSize:36, marginBottom:12 }}>{icon}</div>
      <p style={{ fontSize:14, fontWeight:500 }}>{text}</p>
    </div>
  )
}
