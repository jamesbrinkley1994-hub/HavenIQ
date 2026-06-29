import { useStore } from '../../store'
import AppShell from '../../components/layout/AppShell'
import { QueueCard } from '../../components/ui/QueueCard'
import { Btn } from '../../components/ui'

function EmptyState({ icon = '📭', message }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
      <div style={{ fontSize:32, marginBottom:12 }}>{icon}</div>
      <p style={{ fontSize:14, fontWeight:500 }}>{message}</p>
    </div>
  )
}

// ── QUOTES ───────────────────────────────────────────────
export function Quotes() {
  const { quotes, sendQuote } = useStore()
  const visible = quotes

  return (
    <AppShell title="Quotes">
      <div className="page-header">
        <div>
          <h1>Quote Requests</h1>
          <p>{visible.filter(q => q.status === 'open').length} awaiting response</p>
        </div>
      </div>
      {visible.length === 0 ? (
        <EmptyState message="No quote requests." />
      ) : (
        <div className="queue-list">
          {visible.map((q) => (
            <QueueCard
              key={q.id}
              {...q}
              actions={
                q.status === 'sent' ? (
                  <span style={{ fontSize:12, color:'var(--success)', fontWeight:600 }}>✓ Quote sent</span>
                ) : (
                  <>
                    <Btn variant="primary"   size="sm" onClick={() => sendQuote(q.id)}>Send quote</Btn>
                    <Btn variant="secondary" size="sm">View message</Btn>
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

// ── COMPLAINTS ───────────────────────────────────────────
export function Complaints() {
  const { complaints, sendSuggestedReply, resolveComplaint } = useStore()

  return (
    <AppShell title="Complaints">
      <div className="page-header">
        <div>
          <h1>Complaints</h1>
          <p>{complaints.filter(c => c.status === 'open').length} open</p>
        </div>
      </div>
      {complaints.length === 0 ? (
        <EmptyState icon="✅" message="No open complaints." />
      ) : (
        <div className="queue-list">
          {complaints.map((c) => (
            <QueueCard
              key={c.id}
              {...c}
              actions={
                c.status === 'resolved' ? (
                  <span style={{ fontSize:12, color:'var(--success)', fontWeight:600 }}>✓ Resolved</span>
                ) : c.status === 'replied' ? (
                  <>
                    <span style={{ fontSize:12, color:'var(--primary)', fontWeight:600 }}>✉ Reply sent</span>
                    <Btn variant="secondary" size="sm" style={{ flex:0 }} onClick={() => resolveComplaint(c.id)}>
                      Mark resolved
                    </Btn>
                  </>
                ) : (
                  <>
                    <Btn variant="primary"   size="sm" onClick={() => sendSuggestedReply(c.id, 'complaint')}>
                      Send suggested reply
                    </Btn>
                    <Btn variant="secondary" size="sm">Reply manually</Btn>
                    <Btn variant="secondary" size="sm" style={{ flex:0 }} onClick={() => resolveComplaint(c.id)}>
                      Resolve
                    </Btn>
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

// ── ENQUIRIES ────────────────────────────────────────────
export function Enquiries() {
  const { enquiries, replyEnquiry, archiveEnquiry, convertToBooking, convertToQuote } = useStore()

  return (
    <AppShell title="Enquiries">
      <div className="page-header">
        <div>
          <h1>General Enquiries</h1>
          <p>{enquiries.filter(e => e.status === 'open').length} open</p>
        </div>
      </div>
      {enquiries.length === 0 ? (
        <EmptyState message="All enquiries handled." />
      ) : (
        <div className="queue-list">
          {enquiries.map((e) => (
            <QueueCard
              key={e.id}
              {...e}
              actions={
                e.status === 'replied' ? (
                  <span style={{ fontSize:12, color:'var(--primary)', fontWeight:600 }}>✉ Reply sent</span>
                ) : (
                  <>
                    <Btn variant="primary"   size="sm" onClick={() => replyEnquiry(e.id)}>Reply</Btn>
                    {e.details?.[0]?.[1] === 'Availability' && (
                      <Btn variant="secondary" size="sm" onClick={() => convertToBooking(e.id)}>
                        Convert to booking
                      </Btn>
                    )}
                    {e.details?.[0]?.[1] === 'Pricing' && (
                      <Btn variant="secondary" size="sm" onClick={() => convertToQuote(e.id)}>
                        Convert to quote
                      </Btn>
                    )}
                    <Btn variant="secondary" size="sm" style={{ flex:0 }} onClick={() => archiveEnquiry(e.id)}>
                      Archive
                    </Btn>
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
