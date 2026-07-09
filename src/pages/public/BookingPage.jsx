import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { Btn, FormGroup } from '../../components/ui'

const SERVICES = [
  'Gel Manicure','Acrylic Full Set','Gel Pedicure','Nail Art',
  'Lash Lift & Tint','Brow Lamination','Brow Tint','Lash Extensions',
  'Tattoo Consultation','Tattoo Session','Touch-up Session',
  'Other / Not sure',
]

const ALL_TIMES = [
  '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM',
  '3:30 PM','4:00 PM','4:30 PM','5:00 PM',
]

const MONTHS   = {0:'Jan',1:'Feb',2:'Mar',3:'Apr',4:'May',5:'Jun',6:'Jul',7:'Aug',8:'Sep',9:'Oct',10:'Nov',11:'Dec'}
const DAYS_SH  = {0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat'}

function formatDate(str) {
  if (!str) return 'TBC'
  const d = new Date(str)
  if (isNaN(d)) return 'TBC'
  return `${DAYS_SH[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export default function BookingPage() {
  const navigate = useNavigate()
  const { addBooking, isSlotTaken } = useStore()
  const fileRef  = useRef()

  const [selectedTime, setSelectedTime] = useState(null)
  const [submitted,    setSubmitted]    = useState(false)
  const [file,         setFile]         = useState(null)
  const [errors,       setErrors]       = useState({})
  const [form, setForm] = useState({
    service:'', date:'', firstName:'', lastName:'', email:'', phone:'', message:'',
  })

  const set = k => e => {
    setForm(prev => ({...prev, [k]: e.target.value}))
    // Clear error on change
    if (errors[k]) setErrors(prev => ({...prev, [k]: null}))
    // If date changes, reset time selection (slots may differ)
    if (k === 'date') setSelectedTime(null)
  }

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => setFile({ name:f.name, preview:ev.target.result, type:'image' })
      reader.readAsDataURL(f)
    } else {
      setFile({ name:f.name, preview:null, type:'file' })
    }
  }

  // Compute which slots are already taken for the selected date
  const dateStr   = formatDate(form.date)
  const takenTimes = ALL_TIMES.filter(t => isSlotTaken(dateStr, t))

  const handleTimeSelect = (t) => {
    if (takenTimes.includes(t)) return // silently block — button is visually disabled
    setSelectedTime(t)
    if (errors.time) setErrors(prev => ({...prev, time: null}))
  }

  // Validate before submit
  const validate = () => {
    const e = {}
    if (!form.service)   e.service   = 'Please select a service'
    if (!form.date)      e.date      = 'Please choose a date'
    if (!selectedTime)   e.time      = 'Please choose a time slot'
    if (!form.firstName) e.firstName = 'First name is required'
    if (!form.lastName)  e.lastName  = 'Last name is required'
    if (!form.email)     e.email     = 'Email address is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email'
    // Double-check slot hasn't been taken since page loaded
    if (selectedTime && isSlotTaken(dateStr, selectedTime)) {
      e.time = 'This slot has just been taken — please choose another'
      setSelectedTime(null)
    }
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    const name   = `${form.firstName} ${form.lastName}`.trim()
    const initls = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

    let calDate = null
    if (form.date) {
      const d = new Date(form.date)
      if (!isNaN(d)) calDate = { month: d.getMonth(), day: d.getDate() }
    }

    addBooking({
      id:           Date.now(),
      avatar:       initls,
      name,
      email:        form.email,
      phone:        form.phone || '',
      badge:        'Pending',
      badgeVariant: 'warning',
      status:       'pending',
      notes:        form.message || '',
      attachedFile: file || null,
      calDate,
      details: [
        ['Service', form.service],
        ['Date',    dateStr],
        ['Time',    selectedTime],
      ],
    })
    setSubmitted(true)
  }

  // ── Success screen ────────────────────────────────────────
  if (submitted) return (
    <div className="booking-page">
      <div className="booking-box">
        <div className="booking-success">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 style={{fontSize:18,fontWeight:700}}>Request received!</h3>
          <p style={{fontSize:13.5,color:'var(--text-muted)',textAlign:'center',maxWidth:300,lineHeight:1.65}}>
            Your booking request has been sent. We'll be in touch shortly to confirm your appointment.
          </p>
          <Btn variant="secondary" onClick={() => {
            setSubmitted(false)
            setForm({service:'',date:'',firstName:'',lastName:'',email:'',phone:'',message:''})
            setSelectedTime(null)
            setFile(null)
            setErrors({})
          }}>
            Make another request
          </Btn>
        </div>
      </div>
    </div>
  )

  // ── Form ──────────────────────────────────────────────────
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
            <span style={{fontSize:13,fontWeight:700}}>Book an appointment</span>
          </div>
          <div className="booking-title">Request a booking</div>
          <div className="booking-sub">
            Fill in your details and we'll confirm your appointment as soon as possible.
          </div>
        </div>

        <div className="booking-form-body">

          {/* Service */}
          <div className="form-group">
            <label className="form-label">Service *</label>
            <select className={`form-input${errors.service?' error':''}`}
              value={form.service} onChange={set('service')}>
              <option value="">Select a service...</option>
              {SERVICES.map(s => <option key={s}>{s}</option>)}
            </select>
            {errors.service && <FieldError msg={errors.service}/>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Preferred date *</label>
            <input className={`form-input${errors.date?' error':''}`} type="date"
              min={new Date().toISOString().split('T')[0]}
              value={form.date} onChange={set('date')}/>
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
                  <button key={t}
                    onClick={() => handleTimeSelect(t)}
                    disabled={taken}
                    title={taken ? 'This slot is already booked' : ''}
                    style={{
                      padding:'7px 4px', fontSize:12, textAlign:'center',
                      borderRadius:8, fontFamily:'inherit',
                      cursor: taken ? 'not-allowed' : 'pointer',
                      border: active ? '1.5px solid var(--primary)'
                            : taken  ? '1.5px solid var(--border)'
                            : '1.5px solid var(--border)',
                      background: active ? 'var(--primary-tint)'
                                : taken  ? '#F9FAFB'
                                : 'var(--surface)',
                      color: active ? 'var(--primary)'
                           : taken  ? '#D1D5DB'
                           : 'var(--text-muted)',
                      fontWeight: active ? 600 : 400,
                      textDecoration: taken ? 'line-through' : 'none',
                      position:'relative',
                    }}
                  >
                    {t}
                    {taken && (
                      <span style={{
                        position:'absolute',top:-5,right:-5,width:10,height:10,
                        borderRadius:'50%',background:'var(--danger)',
                      }}/>
                    )}
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
              <input className={`form-input${errors.firstName?' error':''}`}
                placeholder="Emma" value={form.firstName} onChange={set('firstName')}/>
              {errors.firstName && <FieldError msg={errors.firstName}/>}
            </div>
            <div className="form-group">
              <label className="form-label">Last name *</label>
              <input className={`form-input${errors.lastName?' error':''}`}
                placeholder="Clarke" value={form.lastName} onChange={set('lastName')}/>
              {errors.lastName && <FieldError msg={errors.lastName}/>}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email address *</label>
            <input className={`form-input${errors.email?' error':''}`}
              type="email" placeholder="emma@email.com"
              value={form.email} onChange={set('email')}/>
            {errors.email && <FieldError msg={errors.email}/>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">
              Phone number <span style={{color:'var(--text-light)',fontWeight:400}}>(optional)</span>
            </label>
            <input className="form-input" type="tel"
              placeholder="07700 000000" value={form.phone} onChange={set('phone')}/>
          </div>

          {/* Message */}
          <div className="form-group">
            <label className="form-label">
              Message / notes <span style={{color:'var(--text-light)',fontWeight:400}}>(optional)</span>
            </label>
            <textarea className="form-input" rows={3}
              placeholder="Any specific requests, design ideas, colour preferences or anything we should know..."
              value={form.message} onChange={set('message')}/>
          </div>

          {/* File upload */}
          <div className="form-group">
            <label className="form-label">
              Reference image <span style={{color:'var(--text-light)',fontWeight:400}}>(optional)</span>
            </label>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width:'100%', padding:'12px', border:'1.5px dashed var(--border)',
                borderRadius:'var(--radius)', background:'var(--bg)',
                cursor:'pointer', fontSize:13, color:'var(--text-muted)',
                fontFamily:'inherit', display:'flex', alignItems:'center',
                justifyContent:'center', gap:8, transition:'all .14s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--primary)';e.currentTarget.style.color='var(--primary)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)'}}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              {file ? 'Change image' : 'Upload reference image'}
            </button>
            <input ref={fileRef} type="file" accept="image/*,.pdf"
              style={{display:'none'}} onChange={handleFile}/>
            {file && (
              <div style={{
                marginTop:10, padding:'10px 12px', background:'var(--surface)',
                border:'1px solid var(--border)', borderRadius:'var(--radius)',
                display:'flex', alignItems:'center', gap:12,
              }}>
                {file.preview
                  ? <img src={file.preview} alt="preview" style={{width:48,height:48,borderRadius:6,objectFit:'cover',flexShrink:0}}/>
                  : <div style={{width:48,height:48,background:'var(--bg)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>📄</div>
                }
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)'}}>Attached</div>
                </div>
                <button onClick={() => setFile(null)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:16,padding:'0 4px',flexShrink:0}}>✕</button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="booking-footer">
          <Btn variant="primary" full size="lg" onClick={handleSubmit}>
            Send booking request
          </Btn>
          <p style={{textAlign:'center',fontSize:11.5,color:'var(--text-light)',marginTop:9}}>
            Bookings are confirmed by the business. You'll be contacted to confirm your slot.
          </p>
        </div>
      </div>
    </div>
  )
}

function FieldError({ msg }) {
  return (
    <div style={{fontSize:12,color:'var(--danger)',marginTop:4,display:'flex',alignItems:'center',gap:4}}>
      <span>⚠</span> {msg}
    </div>
  )
}
