import { useState } from 'react'
import { useStore } from '../../store'
import AppShell from '../../components/layout/AppShell'
import { QueueCard } from '../../components/ui/QueueCard'
import { AiChip, Btn } from '../../components/ui'

export default function Bookings() {
  const { bookings, approveBooking, declineBooking, sendSuggestedReply } = useStore()
  const [filter, setFilter] = useState('All')

  const visible = bookings.filter((b) => {
    if (filter === 'All')       return true
    if (filter === 'Pending')   return b.status === 'pending' || b.status === 'missing'
    if (filter === 'Confirmed') return b.status === 'confirmed'
    if (filter === 'Declined')  return b.status === 'declined'
    return true
  })

  return (
    <AppShell
      title="Bookings"
      topbarRight={
        <>
          <AiChip label="AI Sorting" />
          <select
            className="form-input"
            style={{ width:'auto', padding:'5px 10px', fontSize:13 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {['All','Pending','Confirmed','Declined'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </>
      }
    >
      <div className="page-header">
        <div>
          <h1>Booking Queue</h1>
          <p>{visible.length} booking{visible.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState message="No bookings to show." />
      ) : (
        <div className="queue-list">
          {visible.map((b) => (
            <QueueCard
              key={b.id}
              {...b}
              actions={
                b.status === 'missing' ? (
                  <>
                    <Btn variant="secondary" size="sm" onClick={() => sendSuggestedReply(b.id, 'booking')}>
                      Send suggested reply
                    </Btn>
                    <Btn variant="success"   size="sm" onClick={() => approveBooking(b.id)}>✓ Approve</Btn>
                    <Btn variant="danger"    size="sm" onClick={() => declineBooking(b.id)}>✕ Decline</Btn>
                  </>
                ) : b.status === 'confirmed' ? (
                  <span style={{ fontSize:12, color:'var(--success)', fontWeight:600 }}>✓ Booking confirmed</span>
                ) : b.status === 'declined' ? (
                  <span style={{ fontSize:12, color:'var(--danger)', fontWeight:600 }}>✕ Booking declined</span>
                ) : b.status === 'replied' ? (
                  <span style={{ fontSize:12, color:'var(--primary)', fontWeight:600 }}>✉ Reply sent</span>
                ) : (
                  <>
                    <Btn variant="success" size="sm" onClick={() => approveBooking(b.id)}>✓ Approve</Btn>
                    <Btn variant="danger"  size="sm" onClick={() => declineBooking(b.id)}>✕ Decline</Btn>
                  </>
                )
              }
            />
          ))}
        </div>
      )}
    </AppShell>
  )
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
      <div style={{ fontSize:32, marginBottom:12 }}>📭</div>
      <p style={{ fontSize:14, fontWeight:500 }}>{message}</p>
    </div>
  )
}
