import { createContext, useContext, useState, useCallback } from 'react'

// ── Helpers ──────────────────────────────────────────────
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
}

// ── Initial data — beauty/nail/tattoo industry ───────────
const INITIAL_BOOKINGS = [
  {
    id: 1, avatar:'ZM', name:'Zara Mitchell', email:'zara.m@gmail.com', phone:'07711 234567',
    badge:'Pending', badgeVariant:'warning',
    details:[['Service','Gel Manicure'],['Date','Tue 30 Jun'],['Time','10:00 AM']],
    calDate:{ month:5, day:30 },
    notes:'Would love a French tip if possible.',
    status:'pending',
  },
  {
    id: 2, avatar:'LB', name:'Lexi Burns', email:'lexi.burns@hotmail.com', phone:'',
    badge:'Missing Info', badgeVariant:'warning',
    details:[['Service','Lash Lift'],['Date','—'],['Time','—']],
    calDate:null,
    missingInfo:'Preferred date · Phone number',
    aiSuggest:'"Hi Lexi, thanks for getting in touch! To get you booked in for your lash lift, could you let me know your preferred date and the best number to reach you? Looking forward to hearing from you!"',
    notes:'',
    status:'missing',
  },
  {
    id: 3, avatar:'KO', name:'Kieran O\'Brien', email:'k.obrien@outlook.com', phone:'07899 445512',
    badge:'Pending', badgeVariant:'warning',
    details:[['Service','Tattoo Consultation'],['Date','Wed 1 Jul'],['Time','2:00 PM']],
    calDate:{ month:6, day:1 },
    notes:'Looking for a sleeve design — Japanese style. Have some reference images.',
    status:'pending',
  },
  {
    id: 4, avatar:'AC', name:'Amber Clarke', email:'amber.c@gmail.com', phone:'07823 991100',
    badge:'Confirmed', badgeVariant:'success',
    details:[['Service','Acrylic Full Set'],['Date','Thu 2 Jul'],['Time','11:00 AM']],
    calDate:{ month:6, day:2 },
    notes:'Almond shape, nude pink.',
    status:'confirmed',
  },
  {
    id: 5, avatar:'RW', name:'Rosa Webb', email:'rosa.w@icloud.com', phone:'07700 882211',
    badge:'Pending', badgeVariant:'warning',
    details:[['Service','Brow Lamination'],['Date','Tue 7 Jul'],['Time','9:00 AM']],
    calDate:{ month:6, day:7 },
    notes:'',
    status:'pending',
  },
  {
    id: 6, avatar:'DT', name:'Danielle Torres', email:'d.torres@email.com', phone:'07655 334411',
    badge:'Confirmed', badgeVariant:'success',
    details:[['Service','Gel Pedicure'],['Date','Wed 8 Jul'],['Time','3:00 PM']],
    calDate:{ month:6, day:8 },
    notes:'Red polish — has a shellfish allergy, please check products.',
    status:'confirmed',
  },
]

const INITIAL_QUOTES = [
  {
    id: 1, avatar:'MT', name:'Maya Thompson', email:'maya.t@gmail.com',
    badge:'Quote', badgeVariant:'info', status:'open',
    details:[['Service','Full Sleeve Tattoo'],['Sessions','Est. 8–10'],['Received','Today, 9:14 AM']],
    message:"Hi, I'm interested in getting a full sleeve done — floral and botanical theme. Could you give me a rough idea of price and how many sessions? Happy to come in for a consultation first.",
  },
  {
    id: 2, avatar:'JF', name:'Jake Foster', email:'j.foster@work.com',
    badge:'Quote', badgeVariant:'info', status:'open',
    details:[['Service','Nail Art (Bridal Party)'],['Group','6 people'],['Received','Yesterday']],
    message:"We have a wedding in August and I'm looking to get gel nails done for myself and 5 bridesmaids. Can you do group bookings and what would the cost be?",
  },
]

const INITIAL_COMPLAINTS = [
  {
    id: 1, avatar:'NR', name:'Nicole Reed', email:'nicole.r@gmail.com',
    badge:'Complaint', badgeVariant:'danger',
    avatarStyle:{ background:'#FEE2E2', color:'#EF4444' },
    status:'open',
    details:[['Service','Acrylic Full Set'],['Date','Mon 22 Jun'],['Received','Today, 8:02 AM']],
    message:"One of my acrylics lifted after only 3 days. I looked after them exactly as advised. Really disappointed as it was for a special occasion. Would like this looked into.",
    aiSuggest:`"Hi Nicole, I'm really sorry to hear this — that's not the standard I aim for at all. I'd love to have you back in to fix the lift at no charge, and take a look at what might have caused it. When would suit you?"`,
  },
]

const INITIAL_ENQUIRIES = [
  {
    id: 1, avatar:'SF', name:'Sienna Fox', email:'sienna.fox@gmail.com',
    badge:'Enquiry', badgeVariant:'neutral', status:'open',
    details:[['Topic','Availability'],['Channel','Instagram'],['Received','Today, 10:22 AM']],
    message:"Hi! Do you have any availability this week or next for a gel manicure? Totally flexible on times.",
  },
  {
    id: 2, avatar:'BN', name:'Ben Nash', email:'b.nash@outlook.com',
    badge:'Enquiry', badgeVariant:'neutral', status:'open',
    details:[['Topic','Patch Test'],['Channel','Booking page'],['Received','Yesterday']],
    message:"I've never had a lash tint before — do I need to come in for a patch test first? And how long before my appointment would I need to do it?",
  },
  {
    id: 3, avatar:'HW', name:'Holly Ward', email:'h.ward@icloud.com',
    badge:'Enquiry', badgeVariant:'neutral', status:'open',
    details:[['Topic','Products'],['Channel','Facebook'],['Received','2 days ago']],
    message:"Do you use vegan/cruelty-free products? I'm vegan and want to make sure before booking.",
  },
]

const INITIAL_ACTIVITY = [
  { id:1, color:'var(--success)', text:'Amber Clarke confirmed for Thu 2 Jul', bold:'Amber Clarke', time:'Just now' },
  { id:2, color:'var(--info)',    text:'New booking from Zara Mitchell — Gel Manicure', bold:'New booking', time:'18 min ago' },
  { id:3, color:'var(--warning)', text:'Lash lift enquiry from Lexi Burns — missing info flagged', bold:'Lexi Burns', time:'45 min ago' },
  { id:4, color:'var(--danger)',  text:'Complaint from Nicole Reed — Acrylic Full Set', bold:'Complaint', time:'2 hr ago' },
  { id:5, color:'var(--primary)', text:'Kieran O\'Brien submitted a tattoo consultation request', bold:'Kieran O\'Brien', time:'3 hr ago' },
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

  const showToast = useCallback((message, variant = 'success') => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const addActivity = useCallback((text, bold, color = 'var(--primary)') => {
    setActivity(prev => [{ id:Date.now(), color, text, bold, time:'Just now' }, ...prev.slice(0,7)])
  }, [])

  // ── Bookings ─────────────────────────────────────────────
  const approveBooking = useCallback((id) => {
    setBookings(prev => prev.map(b => b.id === id
      ? { ...b, badge:'Confirmed', badgeVariant:'success', status:'confirmed' } : b))
    const b = bookings.find(x => x.id === id)
    if (b) { showToast(`Booking confirmed for ${b.name}`); addActivity(`${b.name} booking confirmed`, b.name, 'var(--success)') }
  }, [bookings, showToast, addActivity])

  const declineBooking = useCallback((id) => {
    setBookings(prev => prev.map(b => b.id === id
      ? { ...b, badge:'Declined', badgeVariant:'danger', status:'declined' } : b))
    const b = bookings.find(x => x.id === id)
    if (b) { showToast(`Booking declined for ${b.name}`, 'warning'); addActivity(`${b.name} booking declined`, b.name, 'var(--danger)') }
  }, [bookings, showToast, addActivity])

  const addBooking = useCallback((booking) => {
    setBookings(prev => [booking, ...prev])
    addActivity(`New booking from ${booking.name}`, 'New booking', 'var(--info)')
  }, [addActivity])

  const sendSuggestedReply = useCallback((id, type = 'booking') => {
    if (type === 'booking')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, badge:'Replied', badgeVariant:'primary', status:'replied' } : b))
    else if (type === 'complaint')
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, badge:'Replied', badgeVariant:'primary', status:'replied' } : c))
    showToast('Suggested reply sent ✓')
  }, [showToast])

  // ── Quotes ───────────────────────────────────────────────
  const sendQuote = useCallback((id) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, badge:'Sent', badgeVariant:'success', status:'sent' } : q))
    const q = quotes.find(x => x.id === id)
    if (q) { showToast(`Quote sent to ${q.name}`); addActivity(`Quote sent to ${q.name}`, q.name, 'var(--success)') }
  }, [quotes, showToast, addActivity])

  // ── Complaints — resolve removes ─────────────────────────
  const resolveComplaint = useCallback((id) => {
    const c = complaints.find(x => x.id === id)
    setComplaints(prev => prev.filter(x => x.id !== id))
    if (c) { showToast('Complaint resolved'); addActivity(`Complaint from ${c.name} resolved`, c.name, 'var(--success)') }
  }, [complaints, showToast, addActivity])

  // ── Enquiries ────────────────────────────────────────────
  const replyEnquiry = useCallback((id) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, badge:'Replied', badgeVariant:'primary', status:'replied' } : e))
    showToast('Reply sent ✓')
  }, [showToast])

  const archiveEnquiry = useCallback((id) => {
    setEnquiries(prev => prev.filter(e => e.id !== id))
    showToast('Enquiry archived', 'neutral')
  }, [showToast])

  const convertToBooking = useCallback((id) => {
    const enq = enquiries.find(e => e.id === id)
    if (!enq) return
    const newBooking = {
      id:Date.now(), avatar:initials(enq.name), name:enq.name, email:enq.email,
      phone:'', badge:'Pending', badgeVariant:'warning', notes:enq.message,
      details:[['Service','TBC'],['Date','TBC'],['Time','TBC']], status:'pending',
    }
    setEnquiries(prev => prev.filter(e => e.id !== id))
    addBooking(newBooking)
    showToast(`${enq.name} moved to Bookings`)
  }, [enquiries, addBooking, showToast])

  const convertToQuote = useCallback((id) => {
    const enq = enquiries.find(e => e.id === id)
    if (!enq) return
    setEnquiries(prev => prev.filter(e => e.id !== id))
    setQuotes(prev => [{
      id:Date.now(), avatar:initials(enq.name), name:enq.name, email:enq.email,
      badge:'Quote', badgeVariant:'info', status:'open',
      details:[['Service','TBC'],['Received','Just now']], message:enq.message,
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
