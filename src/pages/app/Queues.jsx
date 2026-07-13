import { useState } from 'react'
import { useStore } from '../../store'
import AppShell from '../../components/layout/AppShell'
import { QueueCard } from '../../components/ui/QueueCard'
import { ReplyBox } from '../../components/ui/ReplyBox'
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
  const { quotes, sendQuote, sendReply } = useStore()
  const [replyingTo, setReplyingTo] = useState(null)

  return (
    <AppShell title="Quotes">
      <div className="page-header">
        <div>
          <h1>Quote Requests</h1>
          <p>{quotes.filter(q => q.status === 'open').length} awaiting response</p>
        </div>
      </div>
      {quotes.length === 0 ? (
        <EmptyState message="No quote requests yet." />
      ) : (
        <div className="queue-list">
          {quotes.map(q => (
            <div key={q.id}>
              <QueueCard
                {...q}
                actions={
                  q.status === 'replied' ? (
                    <span style={{fontSize:12,color:'var(--primary)',fontWeight:600}}>✉ Reply sent</span>
                  ) : q.status === 'sent' ? (
                    <span style={{fontSize:12,color:'var(--success)',fontWeight:600}}>✓ Quote sent</span>
                  ) : (
                    <>
                      <Btn variant="primary" size="sm"
                        onClick={() => setReplyingTo(replyingTo===q.id ? null : q.id)}>
                        {replyingTo===q.id ? 'Cancel' : '✉ Reply'}
                      </Btn>
                      <Btn variant="secondary" size="sm" onClick={() => sendQuote(q.id)}>Mark sent</Btn>
                    </>
                  )
                }
              />
              {replyingTo === q.id && (
                <ReplyBox
                  id={q.id} type="quote"
                  customerEmail={q.email} customerName={q.name}
                  onSend={async (...args) => { await sendReply(...args); setReplyingTo(null) }}
                  onCancel={() => setReplyingTo(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}

// ── COMPLAINTS ───────────────────────────────────────────
export function Complaints() {
  const { complaints, resolveComplaint, sendReply } = useStore()
  const [replyingTo, setReplyingTo] = useState(null)

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
          {complaints.map(c => (
            <div key={c.id}>
              <QueueCard
                {...c}
                actions={
                  c.status === 'resolved' ? (
                    <span style={{fontSize:12,color:'var(--success)',fontWeight:600}}>✓ Resolved</span>
                  ) : c.status === 'replied' ? (
                    <>
                      <span style={{fontSize:12,color:'var(--primary)',fontWeight:600}}>✉ Reply sent</span>
                      <Btn variant="secondary" size="sm" style={{flex:0}} onClick={() => setReplyingTo(replyingTo===c.id?null:c.id)}>
                        Reply again
                      </Btn>
                      <Btn variant="secondary" size="sm" style={{flex:0}} onClick={() => resolveComplaint(c.id)}>
                        Resolve
                      </Btn>
                    </>
                  ) : (
                    <>
                      <Btn variant="primary" size="sm"
                        onClick={() => setReplyingTo(replyingTo===c.id ? null : c.id)}>
                        {replyingTo===c.id ? 'Cancel' : '✉ Reply'}
                      </Btn>
                      <Btn variant="secondary" size="sm" style={{flex:0}} onClick={() => resolveComplaint(c.id)}>
                        Resolve
                      </Btn>
                    </>
                  )
                }
              />
              {replyingTo === c.id && (
                <ReplyBox
                  id={c.id} type="complaint"
                  customerEmail={c.email} customerName={c.name}
                  onSend={async (...args) => { await sendReply(...args); setReplyingTo(null) }}
                  onCancel={() => setReplyingTo(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}

// ── ENQUIRIES ────────────────────────────────────────────
export function Enquiries() {
  const { enquiries, archiveEnquiry, convertToBooking, convertToQuote, sendReply } = useStore()
  const [replyingTo, setReplyingTo] = useState(null)

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
          {enquiries.map(e => (
            <div key={e.id}>
              <QueueCard
                {...e}
                actions={
                  e.status === 'replied' ? (
                    <>
                      <span style={{fontSize:12,color:'var(--primary)',fontWeight:600}}>✉ Reply sent</span>
                      <Btn variant="secondary" size="sm" style={{flex:0}}
                        onClick={() => setReplyingTo(replyingTo===e.id?null:e.id)}>
                        Reply again
                      </Btn>
                      <Btn variant="secondary" size="sm" style={{flex:0}} onClick={() => archiveEnquiry(e.id)}>
                        Archive
                      </Btn>
                    </>
                  ) : (
                    <>
                      <Btn variant="primary" size="sm"
                        onClick={() => setReplyingTo(replyingTo===e.id ? null : e.id)}>
                        {replyingTo===e.id ? 'Cancel' : '✉ Reply'}
                      </Btn>
                      <Btn variant="secondary" size="sm" onClick={() => convertToBooking(e.id)}>
                        → Booking
                      </Btn>
                      <Btn variant="secondary" size="sm" onClick={() => convertToQuote(e.id)}>
                        → Quote
                      </Btn>
                      <Btn variant="secondary" size="sm" style={{flex:0}} onClick={() => archiveEnquiry(e.id)}>
                        Archive
                      </Btn>
                    </>
                  )
                }
              />
              {replyingTo === e.id && (
                <ReplyBox
                  id={e.id} type="enquiry"
                  customerEmail={e.email} customerName={e.name}
                  onSend={async (...args) => { await sendReply(...args); setReplyingTo(null) }}
                  onCancel={() => setReplyingTo(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
