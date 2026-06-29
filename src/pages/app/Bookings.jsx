import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { QueueCard } from '../../components/ui/QueueCard'
import { AiChip, Btn } from '../../components/ui'

const INITIAL_BOOKINGS = [
  {
    id: 1, avatar:'JH', name:'James Harper', email:'james.harper@email.com',
    badge:'Pending', badgeVariant:'warning',
    details:[['Service','Deep Clean'],['Date','Mon 14 Jul'],['Time','10:00 AM']],
    status: 'pending',
  },
  {
    id: 2, avatar:'RB', name:'Rachel Burns', email:'rachel.b@hotmail.com',
    badge:'Missing Info', badgeVariant:'warning',
    details:[['Service','Regular Clean'],['Date','—'],['Time','—']],
    missingInfo: 'Preferred date · Phone number',
    aiSuggest: '"Hi Rachel, thanks for your enquiry! To get you booked in, could you let me know your preferred date and a contact number? Happy to help."',
    status: 'missing',
  },
  {
    id: 3, avatar:'TN', name:'Tom Nguyen', email:'tom.n@gmail.com',
    badge:'Pending', badgeVariant:'warning',
    details:[['Service','End of Tenancy'],['Date','Wed 16 Jul'],['Time','8:30 AM']],
    status: 'pending',
  },
  {
    id: 4, avatar:'EC', name:'Emma Clarke', email:'emmaclarke@work.co.uk',
    badge:'Confirmed', badgeVariant:'success',
    details:[['Service','Regular Clean'],['Date','Tue 15 Jul'],['Time','9:00 AM']],
    status: 'confirmed',
  },
  {
    id: 5, avatar:'PW', name:'Patricia Webb', email:'p.webb@ymail.com',
    badge:'Pending', badgeVariant:'warning',
    details:[['Service','Office Clean'],['Date','Thu 17 Jul'],['Time','7:00 AM']],
    status: 'pending',
  },
]

export default function Bookings() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS)
  const [filter, setFilter] = useState('All')

  const approve = (id) =>
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, badge:'Confirmed', badgeVariant:'success', status:'confirmed' } : b))

  const decline = (id) =>
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, badge:'Declined', badgeVariant:'danger', status:'declined' } : b))

  const visible = bookings.filter((b) => {
    if (filter === 'All') return true
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

      <div className="queue-list">
        {visible.map((b) => (
          <QueueCard
            key={b.id}
            {...b}
            actions={
              b.status === 'missing' ? (
                <>
                  <Btn variant="secondary" size="sm">Send suggested reply</Btn>
                  <Btn variant="secondary" size="sm" style={{ flex:0 }}>View</Btn>
                </>
              ) : b.status === 'confirmed' || b.status === 'declined' ? (
                <Btn variant="secondary" size="sm" style={{ flex:0 }}>View details</Btn>
              ) : (
                <>
                  <Btn variant="success" size="sm" onClick={() => approve(b.id)}>✓ Approve</Btn>
                  <Btn variant="danger"  size="sm" onClick={() => decline(b.id)}>✕ Decline</Btn>
                  <Btn variant="secondary" size="sm" style={{ flex:0 }}>View</Btn>
                </>
              )
            }
          />
        ))}
      </div>
    </AppShell>
  )
}
