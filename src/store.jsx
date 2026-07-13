import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [user,       setUser]       = useState(null)
  const [business,   setBusiness]   = useState(null)
  const [bookings,   setBookings]   = useState([])
  const [quotes,     setQuotes]     = useState([])
  const [complaints, setComplaints] = useState([])
  const [enquiries,  setEnquiries]  = useState([])
  const [activity,   setActivity]   = useState([])
  const [toast,      setToast]      = useState(null)
  const [loading,    setLoading]    = useState(true)

  // ── Toast ────────────────────────────────────────────────
  const showToast = useCallback((message, variant = 'success') => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const addActivity = useCallback((text, bold, color = 'var(--primary)') => {
    setActivity(prev => [{ id: Date.now(), color, text, bold, time: 'Just now' }, ...prev.slice(0, 7)])
  }, [])

  // ── Auth listener ────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadBusiness(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadBusiness(session.user)
      else {
        setBusiness(null)
        setBookings([])
        setQuotes([])
        setComplaints([])
        setEnquiries([])
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Load business + all data ─────────────────────────────
  const loadBusiness = async (u) => {
    const { data: biz } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', u.id)
      .single()
    setBusiness(biz)
    if (biz) await loadAllData(biz.id)
    setLoading(false)
  }

  const loadAllData = async (bizId) => {
    const [bk, qt, cp, en] = await Promise.all([
      supabase.from('bookings').select('*').eq('business_id', bizId).order('created_at', { ascending: false }),
      supabase.from('quotes').select('*').eq('business_id', bizId).order('created_at', { ascending: false }),
      supabase.from('complaints').select('*').eq('business_id', bizId).order('created_at', { ascending: false }),
      supabase.from('enquiries').select('*').eq('business_id', bizId).order('created_at', { ascending: false }),
    ])
    setBookings(mapBookings(bk.data || []))
    setQuotes(mapQuotes(qt.data || []))
    setComplaints(mapComplaints(cp.data || []))
    setEnquiries(mapEnquiries(en.data || []))
  }

  // ── Data mappers (DB → UI shape) ─────────────────────────
  const mapBookings = (rows) => rows.map(r => ({
    id: r.id, avatar: initials(r.customer_name), name: r.customer_name,
    email: r.customer_email || '', phone: r.customer_phone || '',
    badge: statusLabel(r.status), badgeVariant: statusVariant(r.status),
    status: r.status, notes: r.notes || '',
    contactMethod: r.contact_method || 'email',
    attachedFile: r.file_name ? { name: r.file_name, preview: r.file_preview || null } : null,
    calDate: parseCalDate(r.date),
    details: [['Service', r.service || 'TBC'], ['Date', r.date || 'TBC'], ['Time', r.time || 'TBC']],
    missingInfo: r.status === 'missing' ? 'Preferred date · Phone number' : null,
    aiSuggest: r.status === 'missing'
      ? `"Hi ${r.customer_name?.split(' ')[0]}, thanks for getting in touch! To get you booked in, could you let me know your preferred date and the best number to reach you?"`
      : null,
    createdAt: r.created_at,
  }))

  const mapQuotes = (rows) => rows.map(r => ({
    id: r.id, avatar: initials(r.customer_name), name: r.customer_name,
    email: r.customer_email || '', status: r.status,
    badge: r.status === 'sent' ? 'Sent' : 'Quote',
    badgeVariant: r.status === 'sent' ? 'success' : 'info',
    details: [['Service', r.service || 'TBC'], ['Received', fmtDate(r.created_at)]],
    message: r.message || '',
  }))

  const mapComplaints = (rows) => rows.map(r => ({
    id: r.id, avatar: initials(r.customer_name), name: r.customer_name,
    email: r.customer_email || '', status: r.status,
    badge: r.status === 'resolved' ? 'Resolved' : r.status === 'replied' ? 'Replied' : 'Complaint',
    badgeVariant: r.status === 'resolved' ? 'success' : r.status === 'replied' ? 'primary' : 'danger',
    avatarStyle: { background: '#FEE2E2', color: '#EF4444' },
    details: [['Service', r.service || 'TBC'], ['Date', r.date || 'TBC'], ['Received', fmtDate(r.created_at)]],
    message: r.message || '',
    aiSuggest: `"Hi ${r.customer_name?.split(' ')[0]}, I'm really sorry to hear this — that's not the standard I aim for. I'd love to make it right. When would suit you to come back in, at no charge?"`,
  }))

  const mapEnquiries = (rows) => rows.map(r => ({
    id: r.id, avatar: initials(r.customer_name), name: r.customer_name,
    email: r.customer_email || '', status: r.status,
    badge: r.status === 'replied' ? 'Replied' : 'Enquiry',
    badgeVariant: r.status === 'replied' ? 'primary' : 'neutral',
    details: [['Topic', r.topic || 'General'], ['Channel', r.channel || 'Booking page'], ['Received', fmtDate(r.created_at)]],
    message: r.message || '',
  }))

  // ── Auth actions ─────────────────────────────────────────
  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    })
    if (error) {
      const err = new Error(error.message || error.error_description || JSON.stringify(error))
      throw err
    }
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // ── Update business profile ──────────────────────────────
  const updateBusiness = async (fields) => {
    if (!business) return
    const { error } = await supabase.from('businesses').update(fields).eq('id', business.id)
    if (error) { showToast('Failed to save', 'danger'); return }
    setBusiness(prev => ({ ...prev, ...fields }))
    showToast('Business details saved')
  }

  // ── Booking actions ──────────────────────────────────────
  const approveBooking = useCallback(async (id) => {
    const { error } = await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id)
    if (error) { showToast('Failed to update', 'danger'); return }
    const b = bookings.find(x => x.id === id)
    setBookings(prev => prev.map(x => x.id === id ? { ...x, status: 'confirmed', badge: 'Confirmed', badgeVariant: 'success' } : x))
    showToast(`✓ Booking confirmed for ${b?.name}`)
    addActivity(`${b?.name} booking confirmed`, b?.name, 'var(--success)')
    // Send notification email
    if (business) notifyOwner('booking_confirmed', b, business)
  }, [bookings, business, showToast, addActivity])

  const declineBooking = useCallback(async (id) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (error) { showToast('Failed to update', 'danger'); return }
    const b = bookings.find(x => x.id === id)
    setBookings(prev => prev.filter(x => x.id !== id))
    showToast(`Booking declined for ${b?.name}`, 'warning')
    addActivity(`${b?.name} booking declined`, b?.name, 'var(--danger)')
  }, [bookings, showToast, addActivity])

  // Cancel a booking that's already confirmed — frees the slot back up
  // on the public booking page.
  const cancelBooking = useCallback(async (id) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (error) { showToast('Failed to cancel booking', 'danger'); return }
    const b = bookings.find(x => x.id === id)
    setBookings(prev => prev.filter(x => x.id !== id))
    showToast(`Booking cancelled for ${b?.name}`, 'warning')
    addActivity(`${b?.name} booking cancelled`, b?.name, 'var(--danger)')
  }, [bookings, showToast, addActivity])

  const addBooking = useCallback(async (booking) => {
    if (!business) return
    const row = {
      business_id:    business.id,
      customer_name:  booking.name,
      customer_email: booking.email,
      customer_phone: booking.phone,
      service:        booking.details?.find(([l]) => l === 'Service')?.[1],
      date:           booking.details?.find(([l]) => l === 'Date')?.[1],
      time:           booking.details?.find(([l]) => l === 'Time')?.[1],
      notes:          booking.notes,
      status:         'pending',
      file_name:      booking.attachedFile?.name || null,
      file_preview:   booking.attachedFile?.preview || null,
    }
    const { data, error } = await supabase.from('bookings').insert(row).select().single()
    if (error) { showToast('Failed to submit booking', 'danger'); return }
    setBookings(prev => [mapBookings([data])[0], ...prev])
    addActivity(`New booking from ${booking.name}`, 'New booking', 'var(--info)')
    // Notify owner
    notifyOwner('new_booking', booking, business)
    return data
  }, [business, addActivity])

  const sendSuggestedReply = useCallback(async (id, type = 'booking') => {
    if (type === 'booking') {
      await supabase.from('bookings').update({ status: 'replied' }).eq('id', id)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'replied', badge: 'Replied', badgeVariant: 'primary' } : b))
    } else if (type === 'complaint') {
      await supabase.from('complaints').update({ status: 'replied' }).eq('id', id)
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'replied', badge: 'Replied', badgeVariant: 'primary' } : c))
    }
    showToast('Suggested reply sent ✓')
  }, [showToast])

  const isSlotTaken = useCallback((dateStr, time) => {
    if (!dateStr || !time || dateStr === 'TBC' || time === 'TBC') return false

    // Convert a time string like "9:00 AM" to minutes since midnight
    const toMins = (t) => {
      if (!t) return 0
      const [timePart, period] = t.split(' ')
      let [h, m] = timePart.split(':').map(Number)
      if (period === 'PM' && h !== 12) h += 12
      if (period === 'AM' && h === 12) h = 0
      return h * 60 + m
    }

    // Duration string to minutes
    const durationToMins = (dur) => {
      if (!dur) return 60
      if (dur.includes('2 hr') || dur === '2 hours') return 120
      if (dur.includes('90') || dur === '90 minutes') return 90
      if (dur.includes('45') || dur === '45 minutes') return 45
      if (dur.includes('30') || dur === '30 minutes') return 30
      return 60 // default 1 hour
    }

    const slotMins = toMins(time)

    return bookings.some(b => {
      if (b.status !== 'confirmed') return false
      if (b.details?.find(([l]) => l === 'Date')?.[1] !== dateStr) return false

      const bookedTime = b.details?.find(([l]) => l === 'Time')?.[1]
      if (!bookedTime) return false

      const bookedStart = toMins(bookedTime)
      // Try to get duration from the service name heuristic
      const serviceName = b.details?.find(([l]) => l === 'Service')?.[1] || ''
      let durationMins = 60 // default
      if (/2\s*hr/i.test(serviceName) || /2\s*hour/i.test(serviceName)) durationMins = 120
      else if (/90\s*min/i.test(serviceName)) durationMins = 90
      else if (/30\s*min/i.test(serviceName)) durationMins = 30
      else if (/45\s*min/i.test(serviceName)) durationMins = 45

      const bookedEnd = bookedStart + durationMins

      // Slot is taken if it falls within the booked window
      return slotMins >= bookedStart && slotMins < bookedEnd
    })
  }, [bookings])

  // ── Quote actions ────────────────────────────────────────
  const sendQuote = useCallback(async (id) => {
    await supabase.from('quotes').update({ status: 'sent' }).eq('id', id)
    const q = quotes.find(x => x.id === id)
    setQuotes(prev => prev.map(x => x.id === id ? { ...x, status: 'sent', badge: 'Sent', badgeVariant: 'success' } : x))
    showToast(`Quote sent to ${q?.name}`)
    addActivity(`Quote sent to ${q?.name}`, q?.name, 'var(--success)')
  }, [quotes, showToast, addActivity])

  const clearQuote = useCallback(async (id) => {
    await supabase.from('quotes').delete().eq('id', id)
    setQuotes(prev => prev.filter(x => x.id !== id))
    showToast('Quote cleared', 'neutral')
  }, [showToast])

  // ── Complaint actions ────────────────────────────────────
  const resolveComplaint = useCallback(async (id) => {
    const { error } = await supabase.from('complaints').update({ status: 'resolved' }).eq('id', id)
    if (error) { showToast('Failed to update', 'danger'); return }
    const c = complaints.find(x => x.id === id)
    setComplaints(prev => prev.map(x => x.id === id ? { ...x, status: 'resolved', badge: 'Resolved', badgeVariant: 'success' } : x))
    showToast('Complaint resolved')
    addActivity(`Complaint from ${c?.name} resolved`, c?.name, 'var(--success)')
  }, [complaints, showToast, addActivity])

  const clearComplaint = useCallback(async (id) => {
    await supabase.from('complaints').delete().eq('id', id)
    setComplaints(prev => prev.filter(x => x.id !== id))
    showToast('Complaint cleared', 'neutral')
  }, [showToast])

  // ── Send reply to customer via email ────────────────────
  const sendReply = useCallback(async (id, type, replyText, customerEmail, customerName) => {
    if (!business || !replyText.trim()) return
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          type: 'owner_reply',
          businessId: business.id,
          business: { name: business.name, email: business.email },
          reply: { text: replyText, to: customerEmail, toName: customerName },
        }),
      })
      // Mark as replied in database
      const table = type === 'booking' ? 'bookings' : type === 'complaint' ? 'complaints' : type === 'quote' ? 'quotes' : 'enquiries'
      await supabase.from(table).update({ status: 'replied' }).eq('id', id)
      // Update local state
      if (type === 'booking')   setBookings(prev => prev.map(b => b.id===id ? {...b, status:'replied', badge:'Replied', badgeVariant:'primary'} : b))
      if (type === 'complaint') setComplaints(prev => prev.map(c => c.id===id ? {...c, status:'replied', badge:'Replied', badgeVariant:'primary'} : c))
      if (type === 'quote')     setQuotes(prev => prev.map(q => q.id===id ? {...q, status:'replied', badge:'Replied', badgeVariant:'primary'} : q))
      if (type === 'enquiry')   setEnquiries(prev => prev.map(e => e.id===id ? {...e, status:'replied', badge:'Replied', badgeVariant:'primary'} : e))
      showToast(`Reply sent to ${customerName} ✓`)
      addActivity(`Reply sent to ${customerName}`, customerName, 'var(--primary)')
    } catch {
      showToast('Failed to send reply', 'danger')
    }
  }, [business, showToast, addActivity])

  // ── Enquiry actions ──────────────────────────────────────
  const replyEnquiry = useCallback(async (id) => {
    await supabase.from('enquiries').update({ status: 'replied' }).eq('id', id)
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: 'replied', badge: 'Replied', badgeVariant: 'primary' } : e))
    showToast('Reply sent ✓')
  }, [showToast])

  const archiveEnquiry = useCallback(async (id) => {
    await supabase.from('enquiries').delete().eq('id', id)
    setEnquiries(prev => prev.filter(e => e.id !== id))
    showToast('Enquiry archived', 'neutral')
  }, [showToast])

  const convertToBooking = useCallback(async (id) => {
    const enq = enquiries.find(e => e.id === id)
    if (!enq || !business) return
    await supabase.from('enquiries').delete().eq('id', id)
    setEnquiries(prev => prev.filter(e => e.id !== id))
    const row = {
      business_id: business.id, customer_name: enq.name,
      customer_email: enq.email, notes: enq.message, status: 'pending',
    }
    const { data } = await supabase.from('bookings').insert(row).select().single()
    if (data) setBookings(prev => [mapBookings([data])[0], ...prev])
    showToast(`${enq.name} moved to Bookings`)
    addActivity(`${enq.name} converted to booking`, enq.name, 'var(--info)')
  }, [enquiries, business, showToast, addActivity])

  const convertToQuote = useCallback(async (id) => {
    const enq = enquiries.find(e => e.id === id)
    if (!enq || !business) return
    await supabase.from('enquiries').delete().eq('id', id)
    setEnquiries(prev => prev.filter(e => e.id !== id))
    const row = {
      business_id: business.id, customer_name: enq.name,
      customer_email: enq.email, message: enq.message, status: 'open',
    }
    const { data } = await supabase.from('quotes').insert(row).select().single()
    if (data) setQuotes(prev => [mapQuotes([data])[0], ...prev])
    showToast(`${enq.name} moved to Quotes`)
    addActivity(`${enq.name} converted to quote`, enq.name, 'var(--info)')
  }, [enquiries, business, showToast, addActivity])

  // ── Public booking submit (no auth needed) ───────────────
  const submitPublicBooking = useCallback(async (businessId, booking) => {
    const row = {
      business_id:    businessId,
      customer_name:  booking.name,
      customer_email: booking.email,
      customer_phone: booking.phone,
      service:        booking.service,
      date:           booking.date,
      time:           booking.time,
      notes:          booking.notes,
      status:         'pending',
      file_name:      booking.attachedFile?.name || null,
      file_preview:   booking.attachedFile?.preview || null,
    }
    const { data, error } = await supabase.from('bookings').insert(row).select().single()
    if (error) throw error
    // Notify owner via edge function
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ type: 'new_booking', booking: row, businessId }),
    }).catch(() => {}) // don't block UI if email fails
    return data
  }, [])

  return (
    <StoreContext.Provider value={{
      user, business, loading,
      bookings, quotes, complaints, enquiries, activity, toast,
      signUp, signIn, signOut, updateBusiness,
      approveBooking, declineBooking, cancelBooking, addBooking, sendSuggestedReply, isSlotTaken,
      sendQuote, clearQuote, resolveComplaint, clearComplaint,
      replyEnquiry, archiveEnquiry, convertToBooking, convertToQuote,
      submitPublicBooking, sendReply, showToast,
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

// ── Helpers ──────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function statusLabel(s) {
  return { pending:'Pending', confirmed:'Confirmed', declined:'Declined', missing:'Missing Info', replied:'Replied' }[s] || 'Pending'
}

function statusVariant(s) {
  return { pending:'warning', confirmed:'success', declined:'danger', missing:'warning', replied:'primary' }[s] || 'warning'
}

function fmtDate(ts) {
  if (!ts) return 'Recently'
  return new Date(ts).toLocaleDateString('en-GB', { day:'numeric', month:'short' })
}

function parseCalDate(str) {
  if (!str || str === 'TBC' || str === '—') return null
  const MONTHS = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 }
  const match = str.match(/(\d+)\s+(\w+)/)
  if (!match) return null
  const day = parseInt(match[1])
  const month = MONTHS[match[2]]
  return month !== undefined ? { month, day } : null
}

async function notifyOwner(type, booking, business) {
  try {
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ type, booking, business }),
    })
  } catch (_) {}
}
