import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../supabase'
import { Btn } from '../../components/ui'
import DatePicker from '../../components/ui/DatePicker'

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

function toMins(t) {
  if (!t) return 0
  const [timePart, period] = t.split(' ')
  let [h, m] = timePart.split(':').map(Number)
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return h * 60 + m
}

function serviceDuration(name = '') {
  const s = name.toLowerCase()
  if (s.includes('2 hr') || s.includes('2hr') || s.includes('2 hour')) return 120
  if (s.includes('90 min') || s.includes('90min')) return 90
  if (s.includes('45 min') || s.includes('45min')) return 45
  if (s.includes('30 min') || s.includes('30min')) return 30
  return 60
}

const FULL_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

// Look up the working-hours config for a given yyyy-mm-dd date string.
// Returns null if no config is found for that day.
function getDayConfig(dateStr, workingHours) {
  if (!dateStr || !workingHours?.length) return null
  const d = new Date(dateStr)
  if (isNaN(d)) return null
  return workingHours.find(h => h.day === FULL_DAYS[d.getDay()]) || null
}

function FieldError({ msg }) {
  return <div style={{fontSize:12,color:'var(--danger)',marginTop:4}}>⚠ {msg}</div>
}

function SuccessScreen({ title, message, onReset }) {
  return (
    <div className="booking-success">
      <div className="success-icon">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h3 style={{fontSize:18,fontWeight:700}}>{title}</h3>
      <p style={{fontSize:13.5,color:'var(--text-muted)',textAlign:'center',maxWidth:300,lineHeight:1.65}}>{message}</p>
      <Btn variant="secondary" onClick={onReset}>Send another</Btn>
    </div>
  )
}

export default function BookingPage() {
  const { slug } = useParams()
  const [formType,    setFormType]    = useState('') // '', 'book', 'enquiry', 'quote', 'complaint'
  const [business,    setBusiness]    = useState(null)
  const [bizServices, setBizServices] = useState([])
  const [depositNote, setDepositNote] = useState('')
  const [takenSlots,    setTakenSlots]    = useState([])
  const [workingHours,  setWorkingHours]  = useState([])
  const [showDeposit,   setShowDeposit]   = useState(true)
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const lookupSlug = slug || 'demo'

      const { data: biz, error } = await supabase
        .from('businesses').select('*').eq('slug', lookupSlug).single()

      if (error || !biz) {
        if (!slug) { setLoading(false); return }
        setNotFound(true); setLoading(false); return
      }

      setBusiness(biz)

      // Load services, deposit toggle and working hours
      const { data: settings } = await supabase
        .from('business_settings').select('services, show_deposit, working_hours').eq('business_id', biz.id).single()
      if (settings?.services?.length)
        setBizServices(settings.services.map(s => s.name).filter(Boolean))
      if (settings?.show_deposit === false) setShowDeposit(false)
      if (settings?.working_hours?.length) setWorkingHours(settings.working_hours)

      // Load deposit policy from knowledge_blocks
      const { data: kb } = await supabase
        .from('knowledge_blocks')
        .select('content')
        .eq('business_id', biz.id)
        .eq('category', 'deposit')
        .limit(1)
        .single()
      if (kb?.content) setDepositNote(kb.content)

      // Load pending + confirmed bookings for slot blocking
      // (pending is included so two customers can't request the same slot
      // while the business owner hasn't approved/declined it yet)
      // Uses the public_booking_slots view, which only exposes
      // date/time/service/status — not customer names, emails or phone numbers.
      const { data: bookings } = await supabase
        .from('public_booking_slots').select('date, time, service')
        .eq('business_id', biz.id).in('status', ['pending', 'confirmed'])
      setTakenSlots(bookings || [])
      setLoading(false)
    }
    load()
  }, [slug])

  const isSlotTaken = (dateStr, time) => {
    if (!dateStr || !time) return false
    const slotMins = toMins(time)
    return takenSlots.some(b => {
      if (b.date !== dateStr) return false
      const start = toMins(b.time)
      const end   = start + serviceDuration(b.service)
      return slotMins >= start && slotMins < end
    })
  }

  // Check if a date is on a closed day.
  // Defaults to closed if working hours haven't loaded or the day isn't
  // configured — an unconfigured day should never be silently bookable.
  const isDateClosed = (dateStr) => {
    const dayConfig = getDayConfig(dateStr, workingHours)
    if (!dayConfig) return true
    return !dayConfig.open
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
          <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Page not found</div>
          <div style={{fontSize:13,color:'var(--text-muted)'}}>This booking & enquiry link doesn't exist. Please check the URL.</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="booking-page">
      <div className="booking-box">
        {/* Header */}
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
          <div className="booking-title">Booking & Enquiry</div>
          <div className="booking-sub">Select an option below to get started.</div>
        </div>

        <div className="booking-form-body">
          {/* Type selector */}
          <div className="form-group">
            <label className="form-label">What would you like to do? *</label>
            <select className="form-input" value={formType} onChange={e => setFormType(e.target.value)}>
              <option value="">Select an option...</option>
              <option value="book">📅 Book an appointment</option>
              <option value="quote">📋 Request a quote</option>
              <option value="enquiry">💬 Make an enquiry</option>
              <option value="complaint">⚠ Leave a complaint</option>
            </select>
          </div>

          {/* Render correct form based on selection */}
          {formType === 'book' && (
            <BookingForm
              business={business}
              bizServices={bizServices}
              depositNote={showDeposit ? depositNote : ''}
              isSlotTaken={isSlotTaken}
              isDateClosed={isDateClosed}
              workingHours={workingHours}
            />
          )}
          {formType === 'quote' && <ContactForm business={business} type="quote"/>}
          {formType === 'enquiry' && <ContactForm business={business} type="enquiry"/>}
          {formType === 'complaint' && <ContactForm business={business} type="complaint"/>}
        </div>
      </div>
    </div>
  )
}

// ── Booking form ──────────────────────────────────────────
function BookingForm({ business, bizServices, depositNote, isSlotTaken, isDateClosed, workingHours }) {
  const fileRef = useRef()
  const [selectedTime, setSelectedTime] = useState(null)
  const [submitted,    setSubmitted]    = useState(false)
  const [file,         setFile]         = useState(null)
  const [errors,       setErrors]       = useState({})
  const [submitting,   setSubmitting]   = useState(false)
  const [form, setForm] = useState({
    service:'', date:'', firstName:'', lastName:'', email:'', phone:'', message:'', contactMethod:'email',
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

  const dateStr   = formatDate(form.date)
  const dayConfig = getDayConfig(form.date, workingHours)
  const duration  = serviceDuration(form.service)

  // Only show times that fall within the selected day's working hours,
  // and where the service would finish before closing.
  const visibleTimes = form.date
    ? ALL_TIMES.filter(t => {
        if (!dayConfig?.open) return false
        const tMins = toMins(t)
        return tMins >= toMins(dayConfig.start) && (tMins + duration) <= toMins(dayConfig.end)
      })
    : ALL_TIMES
  const takenTimes = visibleTimes.filter(t => isSlotTaken(dateStr, t))

  const validate = () => {
    const e = {}
    if (!form.service)   e.service   = 'Please select a service'
    if (!form.date)      e.date      = 'Please choose a date'
    else if (isDateClosed && isDateClosed(form.date)) e.date = 'Sorry, we are closed on this day'
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
    if (!business?.id) { setErrors({ general:'Something went wrong. Please try again.' }); return }
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
        contact_method: form.contactMethod || 'email',
        status:         'pending',
        file_name:      file?.name || null,
        file_preview:   file?.preview || null,
      })
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify`, {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`},
        body: JSON.stringify({ type:'new_booking', businessId:business.id, booking:{customer_name:name,customer_email:form.email,customer_phone:form.phone,service:form.service,date:dateStr,time:selectedTime,notes:form.message,contact_method:form.contactMethod} }),
      }).catch(()=>{})
      setSubmitted(true)
    } catch { setErrors({ general:'Failed to submit. Please try again.' }) }
    finally { setSubmitting(false) }
  }

  if (submitted) return (
    <SuccessScreen
      title="Request received!"
      message={`Your booking request has been sent to ${business?.name}. They'll be in touch shortly to confirm.`}
      onReset={() => { setSubmitted(false); setForm({service:'',date:'',firstName:'',lastName:'',email:'',phone:'',message:'',contactMethod:'email'}); setSelectedTime(null); setFile(null); setErrors({}) }}
    />
  )

  return (
    <>
      {/* Deposit notice */}
      {depositNote && (
        <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:9,padding:'12px 14px',marginBottom:4}}>
          <div style={{fontSize:12,fontWeight:700,color:'#92400E',marginBottom:4}}>💳 Deposit required</div>
          <div style={{fontSize:12.5,color:'#78350F',lineHeight:1.6}}>{depositNote}</div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Service *</label>
        <select className={`form-input${errors.service?' error':''}`} value={form.service} onChange={set('service')}>
          <option value="">Select a service...</option>
          {(bizServices.length > 0 ? bizServices : ['Other / Not sure']).map(s => <option key={s}>{s}</option>)}
        </select>
        {errors.service && <FieldError msg={errors.service}/>}
      </div>

      <div className="form-group">
        <label className="form-label">Preferred date *</label>
        <DatePicker
          value={form.date}
          onChange={dateStr => {
            setForm(prev => ({ ...prev, date: dateStr }))
            setSelectedTime(null)
            if (errors.date) setErrors(prev => ({ ...prev, date: null }))
          }}
          workingHours={workingHours}
          error={!!errors.date}
        />
        {errors.date && <FieldError msg={errors.date}/>}
      </div>

      <div className="form-group">
        <label className="form-label">
          Preferred time *
          {form.date && takenTimes.length > 0 && (
            <span style={{fontWeight:400,color:'var(--text-muted)',marginLeft:6,fontSize:12}}>
              — {takenTimes.length} slot{takenTimes.length!==1?'s':''} unavailable
            </span>
          )}
        </label>
        {form.date && visibleTimes.length === 0 ? (
          <div style={{fontSize:12.5,color:'var(--text-muted)',padding:'10px 12px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8}}>
            No available times for this day{form.service ? ' with the selected service' : ''}.
          </div>
        ) : (
        <div className="time-slots">
          {visibleTimes.map(t => {
            const taken = takenTimes.includes(t)
            const active = selectedTime === t
            return (
              <button key={t} disabled={taken}
                onClick={() => { if (!taken) { setSelectedTime(t); if(errors.time) setErrors(p=>({...p,time:null})) }}}
                style={{
                  padding:'7px 4px',fontSize:12,textAlign:'center',borderRadius:8,fontFamily:'inherit',
                  cursor:taken?'not-allowed':'pointer',
                  border:`1.5px solid ${active?'var(--primary)':'var(--border)'}`,
                  background:active?'var(--primary-tint)':taken?'#F9FAFB':'var(--surface)',
                  color:active?'var(--primary)':taken?'#D1D5DB':'var(--text-muted)',
                  fontWeight:active?600:400, textDecoration:taken?'line-through':'none',
                }}>
                {t}
              </button>
            )
          })}
        </div>
        )}
        {errors.time && <FieldError msg={errors.time}/>}
      </div>

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

      <div className="form-group">
        <label className="form-label">Email address *</label>
        <input className={`form-input${errors.email?' error':''}`} type="email" placeholder="emma@email.com" value={form.email} onChange={set('email')}/>
        {errors.email && <FieldError msg={errors.email}/>}
      </div>

      <div className="form-group">
        <label className="form-label">Phone number <span style={{color:'var(--text-light)',fontWeight:400}}>(optional)</span></label>
        <input className="form-input" type="tel" placeholder="07700 000000" value={form.phone} onChange={set('phone')}/>
      </div>

      <div className="form-group">
        <label className="form-label">Preferred contact method</label>
        <select className="form-input" value={form.contactMethod} onChange={set('contactMethod')}>
          <option value="email">📧 Email</option>
          <option value="whatsapp">💬 WhatsApp</option>
          <option value="facebook">📘 Facebook Messenger</option>
          <option value="instagram">📸 Instagram DM</option>
          <option value="phone">📞 Phone call</option>
          <option value="sms">💬 Text message</option>
        </select>
        <div style={{fontSize:11.5,color:'var(--text-muted)',marginTop:4}}>
          How would you like us to get back to you?
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Message / notes <span style={{color:'var(--text-light)',fontWeight:400}}>(optional)</span></label>
        <textarea className="form-input" rows={3}
          placeholder="Any specific requests, design ideas, or anything we should know..."
          value={form.message} onChange={set('message')}/>
      </div>

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

      <div className="booking-footer" style={{marginTop:8}}>
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

// ── Contact / enquiry / complaint / quote form ────────────
function ContactForm({ business, type }) {
  const [form, setForm]         = useState({ firstName:'', lastName:'', email:'', message:'' })
  const [errors, setErrors]     = useState({})
  const [submitting, setSub]    = useState(false)
  const [submitted, setDone]    = useState(false)

  const set = k => e => { setForm(p=>({...p,[k]:e.target.value})); if(errors[k]) setErrors(p=>({...p,[k]:null})) }

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
    if (!business?.id) { setErrors({ general:'Something went wrong.' }); return }
    setSub(true)
    try {
      const name = `${form.firstName} ${form.lastName}`.trim()
      const table = type === 'complaint' ? 'complaints' : type === 'quote' ? 'quotes' : 'enquiries'
      await supabase.from(table).insert({
        business_id:    business.id,
        customer_name:  name,
        customer_email: form.email,
        message:        form.message,
        ...(type === 'enquiry' ? { topic:'General', channel:'Booking & Enquiry page' } : {}),
        ...(type === 'quote'   ? { service:'TBC' } : {}),
        status: 'open',
      })
      setDone(true)
    } catch { setErrors({ general:'Failed to send. Please try again.' }) }
    finally { setSub(false) }
  }

  const labels = { enquiry:'Enquiry', quote:'Quote Request', complaint:'Complaint' }
  const placeholders = {
    enquiry:   'How can we help you?',
    quote:     'Please describe what you need, including any relevant details...',
    complaint: 'Please describe the issue in as much detail as possible...',
  }
  const msgLabels = {
    enquiry:   'Your message *',
    quote:     'What would you like a quote for? *',
    complaint: 'Tell us what happened *',
  }

  if (submitted) return (
    <SuccessScreen
      title="Message sent!"
      message={`Your ${labels[type]?.toLowerCase()} has been sent to ${business?.name}. They'll be in touch soon.`}
      onReset={() => { setDone(false); setForm({firstName:'',lastName:'',email:'',message:''}); setErrors({}) }}
    />
  )

  return (
    <>
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

      <div className="form-group">
        <label className="form-label">Email address *</label>
        <input className={`form-input${errors.email?' error':''}`} type="email" placeholder="emma@email.com" value={form.email} onChange={set('email')}/>
        {errors.email && <FieldError msg={errors.email}/>}
      </div>

      <div className="form-group">
        <label className="form-label">{msgLabels[type]}</label>
        <textarea className={`form-input${errors.message?' error':''}`} rows={5}
          placeholder={placeholders[type]} value={form.message} onChange={set('message')}/>
        {errors.message && <FieldError msg={errors.message}/>}
      </div>

      {errors.general && <div style={{fontSize:13,color:'var(--danger)',padding:'10px 12px',background:'var(--danger-tint)',borderRadius:8}}>⚠ {errors.general}</div>}

      <div className="booking-footer" style={{marginTop:8}}>
        <Btn variant="primary" full size="lg" onClick={handleSubmit}>
          {submitting ? 'Sending...' : `Send ${labels[type]}`}
        </Btn>
        <p style={{textAlign:'center',fontSize:11.5,color:'var(--text-light)',marginTop:9}}>
          We'll get back to you as soon as possible.
        </p>
      </div>
    </>
  )
}
