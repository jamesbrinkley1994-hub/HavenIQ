import AppShell from '../../components/layout/AppShell'
import { QueueCard } from '../../components/ui/QueueCard'
import { Btn } from '../../components/ui'

// ── QUOTES ───────────────────────────────────────────────
export function Quotes() {
  return (
    <AppShell title="Quotes">
      <div className="page-header">
        <div><h1>Quote Requests</h1><p>2 quotes awaiting response</p></div>
      </div>
      <div className="queue-list">
        <QueueCard
          avatar="MJ" name="Marcus Jones" email="marcus.j@email.com"
          badge="Quote" badgeVariant="info"
          details={[['Service','Carpet Clean'],['Property','3 bed house'],['Received','Today, 8:22 AM']]}
          message="Hi, I'm looking for a quote on getting all the carpets cleaned in my 3-bed house including the stairs. Can you let me know your prices?"
          actions={<><Btn variant="primary" size="sm">Send quote</Btn><Btn variant="secondary" size="sm">View message</Btn></>}
        />
        <QueueCard
          avatar="LF" name="Laura Fitzgerald" email="lfitz@company.com"
          badge="Quote" badgeVariant="info"
          details={[['Service','Office Clean'],['Frequency','Weekly'],['Received','Yesterday']]}
          message="We're a small team of 12 in a two-floor office. Looking for weekly cleaning on a Friday. What would this cost?"
          actions={<><Btn variant="primary" size="sm">Send quote</Btn><Btn variant="secondary" size="sm">View message</Btn></>}
        />
      </div>
    </AppShell>
  )
}

// ── COMPLAINTS ───────────────────────────────────────────
export function Complaints() {
  return (
    <AppShell title="Complaints">
      <div className="page-header">
        <div><h1>Complaints</h1><p>1 open complaint</p></div>
      </div>
      <div className="queue-list">
        <QueueCard
          avatar="DL" name="Daniel Lowe" email="d.lowe@gmail.com"
          badge="Complaint" badgeVariant="danger"
          avatarStyle={{ background:'#FEE2E2', color:'#EF4444' }}
          details={[['Service','Carpet Clean'],['Date','Thu 10 Jul'],['Received','Today, 6:50 AM']]}
          message="The stain in the living room was not fully removed. I was told it would be, and I'm very disappointed with the result. I'd like this looked into."
          aiSuggest={`"Hi Daniel, I'm sorry to hear this — that's not the standard I aim for. I'd love to come back and make it right. When are you free, at no extra cost?"`}
          actions={
            <>
              <Btn variant="primary" size="sm">Send suggested reply</Btn>
              <Btn variant="secondary" size="sm">Reply manually</Btn>
              <Btn variant="secondary" size="sm" style={{ flex:0 }}>Resolve</Btn>
            </>
          }
        />
      </div>
    </AppShell>
  )
}

// ── ENQUIRIES ────────────────────────────────────────────
export function Enquiries() {
  return (
    <AppShell title="Enquiries">
      <div className="page-header">
        <div><h1>General Enquiries</h1><p>3 open enquiries</p></div>
      </div>
      <div className="queue-list">
        <QueueCard
          avatar="KP" name="Katie Parker" email="katie.p@gmail.com"
          badge="Enquiry" badgeVariant="neutral"
          details={[['Topic','Availability'],['Channel','Email'],['Received','Today, 9:15 AM']]}
          message="Do you have availability for a fortnightly regular clean? I live in the M28 area and am flexible on times."
          actions={<><Btn variant="primary" size="sm">Reply</Btn><Btn variant="secondary" size="sm">Convert to booking</Btn></>}
        />
        <QueueCard
          avatar="BN" name="Ben Nash" email="bnash@outlook.com"
          badge="Enquiry" badgeVariant="neutral"
          details={[['Topic','Pricing'],['Channel','Booking page'],['Received','Yesterday']]}
          message="Could you tell me how much a one-off deep clean of a 4-bed house would cost? Roughly 1,800 sq ft."
          actions={<><Btn variant="primary" size="sm">Reply</Btn><Btn variant="secondary" size="sm">Convert to quote</Btn></>}
        />
        <QueueCard
          avatar="AW" name="Alice Wong" email="a.wong@nhs.net"
          badge="Enquiry" badgeVariant="neutral"
          details={[['Topic','Products used'],['Channel','Email'],['Received','2 days ago']]}
          message="Do you use products with strong fragrances? I have asthma and need to check before booking."
          actions={<><Btn variant="primary" size="sm">Reply</Btn><Btn variant="secondary" size="sm" style={{ flex:0 }}>Archive</Btn></>}
        />
      </div>
    </AppShell>
  )
}
