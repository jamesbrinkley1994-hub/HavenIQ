import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../supabase'
import { Btn } from '../../components/ui'

const ALL_TIMES = [
  '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM',
  '3:30 PM','4:00 PM','4:30 PM','5:00 PM',
]

const MONTHS  = {0:'Jan',1:'Feb',2:'Mar',3:'Apr',4:'May',5:'Jun',6:'Jul',7:'Aug',8:'Sep',9:'Oct',10:'Nov',11:'Dec'}
const DAYS_SH = {0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat'}

function formatDate(str) {
  if (!str) return 'TBC'
  const d = new Date(str)
  if (isNaN(d)) return 'TBC'
  return `${DAYS_SH[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

// Convert time string to minutes since midnight
function toMins(t) {
  if (!t) return 0
  const [timePart, period] = t.split(' ')
  let [h, m] = timePart.split(':').map(Number)
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return h * 60 + m
}

// Work out how many minutes a service takes from its name
function serviceDuration(serviceName) {
  if (!serviceName) return 60
  const s = serviceName.toLowerCase()
  if (s.includes('2 hr') || s.includes('2hr') || s.includes('2 hour')) return 120
  if (s.includes('90 min') || s.includes('90min')) return 90
  if (s.includes('45 min') || s.includes('45min')) return 45
  if (s.includes('30 min') || s.includes('30min')) return 30
  return 60
}

function FieldError({ msg }) {
  return <div style={{fontSize:12,color:'var(--danger)',marginTop:4}}>⚠ {msg}</div>
}

// ── Shared page wrapper ───────────────────────────────────
function PageShell({ business, tab, setTab, children }) {
  return (
    <div className="booking-page">
      <div className="booking-box">
        <div className="booking-header">
          <div className="booking-brand">
            <div className="booking-brand-mark">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span style={{fontSize:13,fontWeight:700}}>{business?.name || 'HavenIQ'}</span>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:0,borderBottom:'1px solid rgba(255,255,255,0.15)',marginTop:16}}>
            {[['book','📅 Book appointment'],['contact','✉ Contact us']].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding:'8px 16px', border:'none', borderBottom: tab===id ? '2px solid #fff' : '2px solid transparent',
                background:'none', cursor:'pointer', fontSize:13, fontWeight: tab===id ? 600 : 400,
                color: tab===id ? '#fff' : 'rgba(255,255,255,0.6)', fontFamily:'inherit', marginBottom:-1,
              }}>{label}</button>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────
export default function BookingPage() {
  const { slug } = useParams()
  const [tab, setTab] = useState('book')

  // Load business data completely independently of auth state
  const [business,     setBusiness]     = useState(null)
  const [bizServices,  setBizServices]  = useState([])
  const [takenSlots,   setTakenSlots]   = useState([]) // { date, time, service }
  const [loading,      setLoading]      = useState(true)
  const [notFound,     setNotFound]     = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      // Determine slug — from URL param or fall back to demo
      const lookupSlug = slug || 'demo'

      // Look up business by slug
      const { data: biz, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', lookupSlug)
        .single()

      if (error || !biz) {
        // Try loading any business as fallback for /demo
        if (!slug) {
          setLoading(false)
          return
        }
        setNotFound(true)
        setLoading(false)
        return
      }

      setBusiness(biz)

      // Load services
      const { data: settings } = await supabase
        .from('business_settings')
        .select('services')
        .eq('business_id', biz.id)
        .single()

      if (settings?.services?.length) {
        setBizServices(settings.services.map(s => s.name).filter(Boolean))
      }

      // Load confirmed bookings for slot blocking
      const { data: bookings } = await supabase
        .from('bookings')
        .select('date, time, service')
        .eq('business_id', biz.id)
        .eq('status', 'confirmed')

      setTakenSlots(bookings || [])
      setLoading(false)
    }
    load()
  }, [slug])

  // Check if a slot is taken, accounting for service duration
  const isSlotTaken = (dateStr, time) => {
    if (!dateStr || !time) return false
    const slotMins = toMins(time)
    return takenSlots.some(b => {
      if (b.date !== dateStr) return false
      const bookedStart = toMins(b.time)
      const bookedEnd   = bookedStart + serviceDuration(b.service)
      return slotMins >= bookedStart && slotMins < bookedEnd
    })
  }

  if (loading) return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <span style={{fontSize:13,color:'var(--text-muted)'}}>Loading...</span>
    </div>
  )

  if (notFound) return (
    <div className="booking-page">
      <div className="booking-box">
        <div style={{textAlign:'center',padding:'48px 24px'}}>
          <div style={{fontSize:32,marginBottom:12}}>🔍</div>
          <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Booking page not found</div>
          <div style={{fontSize:13,color:'var(--text-muted)'}}>This booking link doesn't appear to exist. Please check the URL and try again.</div>
        </div>
      </div>
    </div>
  )

  return (
    <PageShell business={business} tab={tab} setTab={setTab}>
      {tab === 'book'
        ? <BookingForm business={business} bizServices={bizServices} isSlotTaken={isSlotTaken}/>
        : <ContactForm business={business}/>
      }
    </PageShell>
  )
}

// ── Booking form ──────────────────────────────────────────
function BookingForm({ business, bizServices, isSlotTaken }) {
  const fileRef = useRef()
  const [selectedTime, setSelectedTime] = useState(null)
  const [submitted,    setSubmitted]    = useState(false)
  const [file,         setFile]         = useState(null)
  const [errors,       setErrors]       = useState({})
  const [submitting,   setSubmitting]   = useState(false)
  const [form, setForm] = useState({
    service:'', date:'', firstName:'', lastName:'', email:'', phone:'', message:'',
  })

  const set = k => e => {
    setForm(prev => ({...prev, [k]: e.target.value}))
    if (errors[k]) setErrors(prev => ({...prev, [k]: null}))
    if (k === 'date') setSelectedTime(null)
  }

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => setFile({ name:f.name, preview:ev.target.result })
      reader.readAsDataURL(f)
    } else {
      setFile({ name:f.name, preview:null })
    }
  }

  const dateStr    = formatDate(form.date)
  const takenTimes = ALL_TIMES.filter(t => isSlotTaken(dateStr, t))

  const validate = () => {
    const e = {}
    if (!form.service)   e.service   = 'Please select a service'
    if (!form.date)      e.date      = 'Please choose a date'
    if (!selectedTime)   e.time      = 'Please choose a time slot'
    if (!form.firstName) e.firstName = 'First name is required'
    if (!form.lastName)  e.lastName  = 'Last name is required'
    if (!form.email)     e.email     = 'Email address is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email'
    if (selectedTime && isSlotTaken(dateStr, selectedTime)) {
      e.time = 'This slot was just taken — please choose another'
      setSelectedTime(null)
    }
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    if (!business?.id) { setErrors({ general: 'Booking page error. Please try again.' }); return }

    setSubmitting(true)
    try {
      const name = `${form.firstName} ${form.lastName}`.trim()
      await supabase.from('bookings').insert({
        business_id:    business.id,
        customer_name:  name,
        customer_email: form.email,
        customer_phone: form.phone || '',
        service:        form.service,
        date:           dateStr,
        time:           selectedTime,
        notes:          form.message || '',
        status:         'pending',
        file_name:      file?.name || null,
        file_preview:   file?.preview || null,
      })

      // Notify owner
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          type: 'new_booking',
          businessId: business.id,
          booking: { customer_name:name, customer_email:form.email, customer_phone:form.phone, service:form.service, date:dateStr, time:selectedTime, notes:form.message },
        }),
      }).catch(() => {})

      setSubmitted(true)
    } catch {
      setErrors({ general: 'Failed to submit. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <div className="booking-success">
      <div className="success-icon">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h3 style={{fontSize:18,fontWeight:700}}>Request received!</h3>
      <p style={{fontSize:13.5,color:'var(--text-muted)',textAlign:'center',maxWidth:300,lineHeight:1.65}}>
        Your booking request has been sent to {business?.name}. They'll be in touch shortly to confirm.
      </p>
      <Btn variant="secondary" onClick={() => {
        setSubmitted(false)
        setForm({service:'',date:'',firstName:'',lastName:'',email:'',phone:'',message:''})
        setSelectedTime(null); setFile(null); setErrors({})
      }}>Make another request</Btn>
    </div>
  )

  return (
    <>
      <div className="booking-form-body">
        {/* Service */}
        <div className="form-group">
          <label className="form-label">Service *</label>
          <select className={`form-input${errors.service?' error':''}`} value={form.service} onChange={set('service')}>
            <option value="">Select a service...</option>
            {(bizServices.length > 0 ? bizServices : ['Other / Not sure']).map(s => <option key={s}>{s}</option>)}
          </select>
          {errors.service && <FieldError msg={errors.service}/>}
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">Preferred date *</label>
          <input className={`form-input${errors.date?' error':''}`} type="date"
            min={new Date().toISOString().split('T')[0]} value={form.date} onChange={set('date')}/>
          {errors.date && <FieldError msg={errors.date}/>}
        </div>

        {/* Time slots */}
        <div className="form-group">
          <label className="form-label">
            Preferred time *
            {form.date && takenTimes.length > 0 && (
              <span style={{fontWeight:400,color:'var(--text-muted)',marginLeft:6,fontSize:12}}>
                — {takenTimes.length} slot{takenTimes.length!==1?'s':''} unavailable
              </span>
            )}
          </label>
          <div className="time-slots">
            {ALL_TIMES.map(t => {
              const taken  = takenTimes.includes(t)
              const active = selectedTime === t
              return (
                <button key={t} disabled={taken}
                  onClick={() => { if (!taken) { setSelectedTime(t); if(errors.time) setErrors(p=>({...p,time:null})) }}}
                  style={{
                    padding:'7px 4px', fontSize:12, textAlign:'center', borderRadius:8, fontFamily:'inherit',
                    cursor: taken?'not-allowed':'pointer',
                    border:`1.5px solid ${active?'var(--primary)':'var(--border)'}`,
                    background: active?'var(--primary-tint)':taken?'#F9FAFB':'var(--surface)',
                    color: active?'var(--primary)':taken?'#D1D5DB':'var(--text-muted)',
                    fontWeight: active?600:400,
                    textDecoration: taken?'line-through':'none',
                  }}>
                  {t}
                </button>
              )
            })}
          </div>
          {errors.time && <FieldError msg={errors.time}/>}
        </div>

        {/* Name */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:13}}>
          <div className="form-group">
            <label className="form-label">First name *</label>
            <input className={`form-input${errors.firstName?' error':''}`} placeholder="Emma" value={form.firstName} onChange={set('firstName')}/>
            {errors.firstName && <FieldError msg={errors.firstName}/>}
          </div>
          <div className="form-group">
            <label className="form-label">Last name *</label>
            <input className={`form-input${errors.lastName?' error':''}`} placeholder="Clarke" value={form.lastName} onChange={set('lastName')}/>
            {errors.lastName && <FieldError msg={errors.lastName}/>}
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email address *</label>
          <input className={`form-input${errors.email?' error':''}`} type="email" placeholder="emma@email.com" value={form.email} onChange={set('email')}/>
          {errors.email && <FieldError msg={errors.email}/>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label">Phone number <span style={{color:'var(--text-light)',fontWeight:400}}>(optional)</span></label>
          <input className="form-input" type="tel" placeholder="07700 000000" value={form.phone} onChange={set('phone')}/>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Message / notes <span style={{color:'var(--text-light)',fontWeight:400}}>(optional)</span></label>
          <textarea className="form-input" rows={3}
            placeholder="Any specific requests, design ideas, or anything we should know..."
            value={form.message} onChange={set('message')}/>
        </div>

        {/* File upload */}
        <div className="form-group">
          <label className="form-label">Reference image <span style={{color:'var(--text-light)',fontWeight:400}}>(optional)</span></label>
          <button onClick={() => fileRef.current?.click()} style={{
            width:'100%',padding:'12px',border:'1.5px dashed var(--border)',borderRadius:'var(--radius)',
            background:'var(--bg)',cursor:'pointer',fontSize:13,color:'var(--text-muted)',
            fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            {file ? 'Change image' : 'Upload reference image'}
          </button>
          <input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={handleFile}/>
          {file && (
            <div style={{marginTop:10,padding:'10px 12px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',display:'flex',alignItems:'center',gap:12}}>
              {file.preview
                ? <img src={file.preview} alt="preview" style={{width:48,height:48,borderRadius:6,objectFit:'cover',flexShrink:0}}/>
                : <div style={{width:48,height:48,background:'var(--bg)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>📄</div>
              }
              <div style={{minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>Attached</div>
              </div>
              <button onClick={() => setFile(null)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:16,padding:'0 4px'}}>✕</button>
            </div>
          )}
        </div>

        {errors.general && <div style={{fontSize:13,color:'var(--danger)',padding:'10px 12px',background:'var(--danger-tint)',borderRadius:8}}>⚠ {errors.general}</div>}
      </div>

      <div className="booking-footer">
        <Btn variant="primary" full size="lg" onClick={handleSubmit}>
          {submitting ? 'Sending...' : 'Send booking request'}
        </Btn>
        <p style={{textAlign:'center',fontSize:11.5,color:'var(--text-light)',marginTop:9}}>
          Bookings are confirmed by the business. You'll be contacted to confirm your slot.
        </p>
      </div>
    </>
  )
}

// ── Contact / enquiry form ────────────────────────────────
function ContactForm({ business }) {
  const [form, setForm] = useState({ type:'enquiry', firstName:'', lastName:'', email:'', message:'' })
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)

  const set = k => e => {
    setForm(prev => ({...prev, [k]: e.target.value}))
    if (errors[k]) setErrors(prev => ({...prev, [k]: null}))
  }

  const validate = () => {
    const e = {}
    if (!form.firstName) e.firstName = 'First name is required'
    if (!form.lastName)  e.lastName  = 'Last name is required'
    if (!form.email)     e.email     = 'Email address is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email'
    if (!form.message)   e.message   = 'Please enter your message'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    if (!business?.id) { setErrors({ general: 'Something went wrong. Please try again.' }); return }

    setSubmitting(true)
    try {
      const name = `${form.firstName} ${form.lastName}`.trim()
      const table = form.type === 'complaint' ? 'complaints' : form.type === 'quote' ? 'quotes' : 'enquiries'

      if (form.type === 'complaint') {
        await supabase.from('complaints').insert({
          business_id:    business.id,
          customer_name:  name,
          customer_email: form.email,
          message:        form.message,
          status:         'open',
        })
      } else if (form.type === 'quote') {
        await supabase.from('quotes').insert({
          business_id:    business.id,
          customer_name:  name,
          customer_email: form.email,
          message:        form.message,
          status:         'open',
        })
      } else {
        await supabase.from('enquiries').insert({
          business_id:    business.id,
          customer_name:  name,
          customer_email: form.email,
          message:        form.message,
          topic:          'General',
          channel:        'Booking page',
          status:         'open',
        })
      }

      setSubmitted(true)
    } catch {
      setErrors({ general: 'Failed to send. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const typeLabels = { enquiry:'General Enquiry', complaint:'Complaint', quote:'Quote Request' }

  if (submitted) return (
    <div className="booking-success">
      <div className="success-icon">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h3 style={{fontSize:18,fontWeight:700}}>Message sent!</h3>
      <p style={{fontSize:13.5,color:'var(--text-muted)',textAlign:'center',maxWidth:300,lineHeight:1.65}}>
        Your {typeLabels[form.type]?.toLowerCase()} has been sent to {business?.name}. They'll be in touch soon.
      </p>
      <Btn variant="secondary" onClick={() => {
        setSubmitted(false)
        setForm({ type:'enquiry', firstName:'', lastName:'', email:'', message:'' })
        setErrors({})
      }}>Send another message</Btn>
    </div>
  )

  return (
    <>
      <div className="booking-form-body">
        {/* Type selector */}
        <div className="form-group">
          <label className="form-label">What is this about?</label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
            {[['enquiry','💬 Enquiry'],['quote','📋 Quote'],['complaint','⚠ Complaint']].map(([val,label]) => (
              <button key={val} onClick={() => setForm(p=>({...p,type:val}))} style={{
                padding:'10px 6px', borderRadius:9, border:`1.5px solid ${form.type===val?'var(--primary)':'var(--border)'}`,
                background: form.type===val?'var(--primary-tint)':'var(--surface)',
                color: form.type===val?'var(--primary)':'var(--text-muted)',
                fontSize:12, fontWeight: form.type===val?600:400, cursor:'pointer', fontFamily:'inherit',
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:13}}>
          <div className="form-group">
            <label className="form-label">First name *</label>
            <input className={`form-input${errors.firstName?' error':''}`} placeholder="Emma" value={form.firstName} onChange={set('firstName')}/>
            {errors.firstName && <FieldError msg={errors.firstName}/>}
          </div>
          <div className="form-group">
            <label className="form-label">Last name *</label>
            <input className={`form-input${errors.lastName?' error':''}`} placeholder="Clarke" value={form.lastName} onChange={set('lastName')}/>
            {errors.lastName && <FieldError msg={errors.lastName}/>}
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email address *</label>
          <input className={`form-input${errors.email?' error':''}`} type="email" placeholder="emma@email.com" value={form.email} onChange={set('email')}/>
          {errors.email && <FieldError msg={errors.email}/>}
        </div>

        {/* Message */}
        <div className="form-group">
          <label className="form-label">
            {form.type === 'complaint' ? 'Tell us what happened *' : form.type === 'quote' ? 'What would you like a quote for? *' : 'Your message *'}
          </label>
          <textarea className={`form-input${errors.message?' error':''}`} rows={5}
            placeholder={
              form.type === 'complaint' ? 'Please describe the issue in as much detail as possible...'
              : form.type === 'quote' ? 'Please describe what you need, including any relevant details...'
              : 'How can we help you?'
            }
            value={form.message} onChange={set('message')}/>
          {errors.message && <FieldError msg={errors.message}/>}
        </div>

        {errors.general && <div style={{fontSize:13,color:'var(--danger)',padding:'10px 12px',background:'var(--danger-tint)',borderRadius:8}}>⚠ {errors.general}</div>}
      </div>

      <div className="booking-footer">
        <Btn variant="primary" full size="lg" onClick={handleSubmit}>
          {submitting ? 'Sending...' : `Send ${typeLabels[form.type]}`}
        </Btn>
        <p style={{textAlign:'center',fontSize:11.5,color:'var(--text-light)',marginTop:9}}>
          We'll get back to you as soon as possible.
        </p>
      </div>
    </>
  )
}
