import { createContext, useContext, useState, useCallback } from 'react'

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
}

// ── Start completely empty — no demo data ─────────────────
const INITIAL_BOOKINGS   = []
const INITIAL_QUOTES     = []
const INITIAL_COMPLAINTS = []
const INITIAL_ENQUIRIES  = []
const INITIAL_ACTIVITY   = []

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
    setActivity(prev => [{ id:Date.now(), color, text, bold, time:'Just now' }, ...prev.slice(0,7)])
  }, [])

  // ── Bookings ─────────────────────────────────────────────
  // Approve: moves card OUT of pending queue into confirmed
  const approveBooking = useCallback((id) => {
    const b = bookings.find(x => x.id === id)
    setBookings(prev => prev.map(x => x.id === id
      ? { ...x, badge:'Confirmed', badgeVariant:'success', status:'confirmed' } : x))
    if (b) {
      showToast(`✓ Booking confirmed for ${b.name}`)
      addActivity(`${b.name} booking confirmed`, b.name, 'var(--success)')
    }
  }, [bookings, showToast, addActivity])

  // Decline: removes card from queue entirely
  const declineBooking = useCallback((id) => {
    const b = bookings.find(x => x.id === id)
    setBookings(prev => prev.filter(x => x.id !== id))
    if (b) {
      showToast(`Booking declined for ${b.name}`, 'warning')
      addActivity(`${b.name} booking declined`, b.name, 'var(--danger)')
    }
  }, [bookings, showToast, addActivity])

  const addBooking = useCallback((booking) => {
    setBookings(prev => [booking, ...prev])
    addActivity(`New booking request from ${booking.name}`, 'New booking', 'var(--info)')
  }, [addActivity])

  const sendSuggestedReply = useCallback((id, type = 'booking') => {
    if (type === 'booking')
      setBookings(prev => prev.map(b => b.id === id
        ? { ...b, badge:'Reply sent', badgeVariant:'primary', status:'replied' } : b))
    else if (type === 'complaint')
      setComplaints(prev => prev.map(c => c.id === id
        ? { ...c, badge:'Reply sent', badgeVariant:'primary', status:'replied' } : c))
    showToast('Suggested reply sent ✓')
  }, [showToast])

  // ── Slot conflict detection ───────────────────────────────
  // Returns true if a confirmed booking already exists for the same date + time
  const isSlotTaken = useCallback((dateStr, time) => {
    if (!dateStr || !time || dateStr === 'TBC' || time === 'TBC') return false
    return bookings.some(b =>
      b.status === 'confirmed' &&
      b.details?.find(([l]) => l === 'Date')?.[1] === dateStr &&
      b.details?.find(([l]) => l === 'Time')?.[1] === time
    )
  }, [bookings])

  // ── Quotes ───────────────────────────────────────────────
  const sendQuote = useCallback((id) => {
    const q = quotes.find(x => x.id === id)
    setQuotes(prev => prev.map(x => x.id === id
      ? { ...x, badge:'Sent', badgeVariant:'success', status:'sent' } : x))
    if (q) {
      showToast(`Quote sent to ${q.name}`)
      addActivity(`Quote sent to ${q.name}`, q.name, 'var(--success)')
    }
  }, [quotes, showToast, addActivity])

  // ── Complaints — resolve removes card ────────────────────
  const resolveComplaint = useCallback((id) => {
    const c = complaints.find(x => x.id === id)
    setComplaints(prev => prev.filter(x => x.id !== id))
    if (c) {
      showToast('Complaint marked as resolved')
      addActivity(`Complaint from ${c.name} resolved`, c.name, 'var(--success)')
    }
  }, [complaints, showToast, addActivity])

  // ── Enquiries ────────────────────────────────────────────
  const replyEnquiry = useCallback((id) => {
    setEnquiries(prev => prev.map(e => e.id === id
      ? { ...e, badge:'Replied', badgeVariant:'primary', status:'replied' } : e))
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
      isSlotTaken,
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
