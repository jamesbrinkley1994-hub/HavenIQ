import { createContext, useContext, useState, useCallback } from 'react'

// ── Initial data (dates updated to 2026) ─────────────────
const INITIAL_BOOKINGS = [
  {
    id: 1, avatar:'JH', name:'James Harper', email:'james.harper@email.com',
    badge:'Pending', badgeVariant:'warning',
    details:[['Service','Deep Clean'],['Date','Tue 30 Jun'],['Time','10:00 AM']],
    calDate: { month: 5, day: 30 }, // JS month (0-indexed), day — June 30
    status:'pending',
  },
  {
    id: 2, avatar:'RB', name:'Rachel Burns', email:'rachel.b@hotmail.com',
    badge:'Missing Info', badgeVariant:'warning',
    details:[['Service','Regular Clean'],['Date','—'],['Time','—']],
    missingInfo:'Preferred date · Phone number',
    aiSuggest:'"Hi Rachel, thanks for your enquiry! To get you booked in, could you let me know your preferred date and a contact number? Happy to help."',
    status:'missing',
  },
  {
    id: 3, avatar:'TN', name:'Tom Nguyen', email:'tom.n@gmail.com',
    badge:'Pending', badgeVariant:'warning',
    details:[['Service','End of Tenancy'],['Date','Wed 1 Jul'],['Time','8:30 AM']],
    calDate: { month: 6, day: 1 },
    status:'pending',
  },
  {
    id: 4, avatar:'EC', name:'Emma Clarke', email:'emmaclarke@work.co.uk',
    badge:'Confirmed', badgeVariant:'success',
    details:[['Service','Regular Clean'],['Date','Thu 2 Jul'],['Time','9:00 AM']],
    calDate: { month: 6, day: 2 },
    status:'confirmed',
  },
  {
    id: 5, avatar:'PW', name:'Patricia Webb', email:'p.webb@ymail.com',
    badge:'Pending', badgeVariant:'warning',
    details:[['Service','Office Clean'],['Date','Tue 7 Jul'],['Time','7:00 AM']],
    calDate: { month: 6, day: 7 },
    status:'pending',
  },
]

const INITIAL_QUOTES = [
  {
    id: 1, avatar:'MJ', name:'Marcus Jones', email:'marcus.j@email.com',
    badge:'Quote', badgeVariant:'info', status:'open',
    details:[['Service','Carpet Clean'],['Property','3 bed house'],['Received','Today, 8:22 AM']],
    message:"Hi, I'm looking for a quote on getting all the carpets cleaned in my 3-bed house including the stairs. Can you let me know your prices?",
  },
  {
    id: 2, avatar:'LF', name:'Laura Fitzgerald', email:'lfitz@company.com',
    badge:'Quote', badgeVariant:'info', status:'open',
    details:[['Service','Office Clean'],['Frequency','Weekly'],['Received','Yesterday']],
    message:"We're a small team of 12 in a two-floor office. Looking for weekly cleaning on a Friday. What would this cost?",
  },
]

const INITIAL_COMPLAINTS = [
  {
    id: 1, avatar:'DL', name:'Daniel Lowe', email:'d.lowe@gmail.com',
    badge:'Complaint', badgeVariant:'danger',
    avatarStyle:{ background:'#FEE2E2', color:'#EF4444' },
    status:'open',
    details:[['Service','Carpet Clean'],['Date','Mon 22 Jun'],['Received','Today, 6:50 AM']],
    message:"The stain in the living room was not fully removed. I was told it would be, and I'm very disappointed with the result. I'd like this looked into.",
    aiSuggest:`"Hi Daniel, I'm sorry to hear this — that's not the standard I aim for. I'd love to come back and make it right. When are you free, at no extra cost?"`,
  },
]

const INITIAL_ENQUIRIES = [
  {
    id: 1, avatar:'KP', name:'Katie Parker', email:'katie.p@gmail.com',
    badge:'Enquiry', badgeVariant:'neutral', status:'open',
    details:[['Topic','Availability'],['Channel','Email'],['Received','Today, 9:15 AM']],
    message:"Do you have availability for a fortnightly regular clean? I live in the M28 area and am flexible on times.",
  },
  {
    id: 2, avatar:'BN', name:'Ben Nash', email:'bnash@outlook.com',
    badge:'Enquiry', badgeVariant:'neutral', status:'open',
    details:[['Topic','Pricing'],['Channel','Booking page'],['Received','Yesterday']],
    message:"Could you tell me how much a one-off deep clean of a 4-bed house would cost? Roughly 1,800 sq ft.",
  },
  {
    id: 3, avatar:'AW', name:'Alice Wong', email:'a.wong@nhs.net',
    badge:'Enquiry', badgeVariant:'neutral', status:'open',
    details:[['Topic','Products used'],['Channel','Email'],['Received','2 days ago']],
    message:"Do you use products with strong fragrances? I have asthma and need to check before booking.",
  },
]

const INITIAL_ACTIVITY = [
  { id:1, color:'var(--success)', text:'Emma Clarke confirmed for Thu 2 Jul',    bold:'Emma Clarke',   time:'2 min ago' },
  { id:2, color:'var(--info)',    text:'New booking from James Harper',           bold:'New booking',   time:'18 min ago' },
  { id:3, color:'var(--warning)', text:'Quote request from Rachel Burns — missing info', bold:'Quote request', time:'45 min ago' },
  { id:4, color:'var(--danger)',  text:'Complaint from Daniel Lowe',              bold:'Complaint',     time:'2 hr ago' },
  { id:5, color:'var(--primary)', text:'Tom Nguyen submitted a booking',          bold:'Tom Nguyen',    time:'3 hr ago' },
]

// ── Context ──────────────────────────────────────────────
const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [bookings,   setBookings]   = useState(INITIAL_BOOKINGS)
  const [quotes,     setQuotes]     = useState(INITIAL_QUOTES)
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS)
  const [enquiries,  setEnquiries]  = useState(INITIAL_ENQUIRIES)
  const [activity,   setActivity]   = useState(INITIAL_ACTIVITY)
  const [toast,      setToast]      = useState(null)

  // ── Toast ────────────────────────────────────────────────
  const showToast = useCallback((message, variant = 'success') => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // ── Activity ─────────────────────────────────────────────
  const addActivity = useCallback((text, bold, color = 'var(--primary)') => {
    setActivity((prev) => [
      { id: Date.now(), color, text, bold, time: 'just now' },
      ...prev.slice(0, 7),
    ])
  }, [])

  // ── Bookings ─────────────────────────────────────────────
  const approveBooking = useCallback((id) => {
    setBookings((prev) => prev.map((b) =>
      b.id === id ? { ...b, badge:'Confirmed', badgeVariant:'success', status:'confirmed' } : b
    ))
    const b = bookings.find((x) => x.id === id)
    if (b) {
      showToast(`Booking confirmed for ${b.name}`)
      addActivity(`${b.name} booking confirmed`, b.name, 'var(--success)')
    }
  }, [bookings, showToast, addActivity])

  const declineBooking = useCallback((id) => {
    setBookings((prev) => prev.map((b) =>
      b.id === id ? { ...b, badge:'Declined', badgeVariant:'danger', status:'declined' } : b
    ))
    const b = bookings.find((x) => x.id === id)
    if (b) {
      showToast(`Booking declined for ${b.name}`, 'warning')
      addActivity(`${b.name} booking declined`, b.name, 'var(--danger)')
    }
  }, [bookings, showToast, addActivity])

  const addBooking = useCallback((booking) => {
    setBookings((prev) => [booking, ...prev])
    addActivity(`New booking from ${booking.name}`, 'New booking', 'var(--info)')
  }, [addActivity])

  const sendSuggestedReply = useCallback((id, type = 'booking') => {
    if (type === 'booking') {
      setBookings((prev) => prev.map((b) =>
        b.id === id ? { ...b, badge:'Replied', badgeVariant:'primary', status:'replied' } : b
      ))
    } else if (type === 'complaint') {
      setComplaints((prev) => prev.map((c) =>
        c.id === id ? { ...c, badge:'Replied', badgeVariant:'primary', status:'replied' } : c
      ))
    }
    showToast('Suggested reply sent ✓')
  }, [showToast])

  // ── Quotes ───────────────────────────────────────────────
  const sendQuote = useCallback((id) => {
    setQuotes((prev) => prev.map((q) =>
      q.id === id ? { ...q, badge:'Quote Sent', badgeVariant:'success', status:'sent' } : q
    ))
    const q = quotes.find((x) => x.id === id)
    if (q) {
      showToast(`Quote sent to ${q.name}`)
      addActivity(`Quote sent to ${q.name}`, q.name, 'var(--success)')
    }
  }, [quotes, showToast, addActivity])

  // ── Complaints — resolve REMOVES the card ────────────────
  const resolveComplaint = useCallback((id) => {
    const c = complaints.find((x) => x.id === id)
    setComplaints((prev) => prev.filter((c) => c.id !== id))
    if (c) {
      showToast('Complaint resolved and removed')
      addActivity(`Complaint from ${c.name} resolved`, c.name, 'var(--success)')
    }
  }, [complaints, showToast, addActivity])

  // ── Enquiries ────────────────────────────────────────────
  const replyEnquiry = useCallback((id) => {
    setEnquiries((prev) => prev.map((e) =>
      e.id === id ? { ...e, badge:'Replied', badgeVariant:'primary', status:'replied' } : e
    ))
    showToast('Reply sent ✓')
  }, [showToast])

  const archiveEnquiry = useCallback((id) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id))
    showToast('Enquiry archived', 'neutral')
  }, [showToast])

  const convertToBooking = useCallback((id) => {
    const enq = enquiries.find((e) => e.id === id)
    if (!enq) return
    const initials = enq.name.split(' ').map((w) => w[0]).join('').slice(0,2).toUpperCase()
    const newBooking = {
      id: Date.now(), avatar: initials, name: enq.name, email: enq.email,
      badge:'Pending', badgeVariant:'warning',
      details:[['Service','Regular Clean'],['Date','TBC'],['Time','TBC']],
      status:'pending',
    }
    setEnquiries((prev) => prev.filter((e) => e.id !== id))
    addBooking(newBooking)
    showToast(`${enq.name} moved to Bookings`)
  }, [enquiries, addBooking, showToast])

  const convertToQuote = useCallback((id) => {
    const enq = enquiries.find((e) => e.id === id)
    if (!enq) return
    const initials = enq.name.split(' ').map((w) => w[0]).join('').slice(0,2).toUpperCase()
    setEnquiries((prev) => prev.filter((e) => e.id !== id))
    setQuotes((prev) => [{
      id: Date.now(), avatar: initials, name: enq.name, email: enq.email,
      badge:'Quote', badgeVariant:'info', status:'open',
      details:[['Service','TBC'],['Received','Just now']],
      message: enq.message,
    }, ...prev])
    showToast(`${enq.name} moved to Quotes`)
    addActivity(`${enq.name} converted to quote`, enq.name, 'var(--info)')
  }, [enquiries, showToast, addActivity])

  return (
    <StoreContext.Provider value={{
      bookings, quotes, complaints, enquiries, activity, toast,
      approveBooking, declineBooking, addBooking, sendSuggestedReply,
      sendQuote, resolveComplaint,
      replyEnquiry, archiveEnquiry, convertToBooking, convertToQuote,
      showToast,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
