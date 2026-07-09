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

const TIMES = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
               '12:00 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM',
               '3:30 PM','4:00 PM','4:30 PM','5:00 PM']

const MONTHS = {0:'Jan',1:'Feb',2:'Mar',3:'Apr',4:'May',5:'Jun',6:'Jul',7:'Aug',8:'Sep',9:'Oct',10:'Nov',11:'Dec'}
const DAYS_SHORT = {0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat'}

function formatDate(dateStr) {
  if (!dateStr) return 'TBC'
  const d = new Date(dateStr)
  if (isNaN(d)) return 'TBC'
  return `${DAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export default function BookingPage() {
  const navigate    = useNavigate()
  const { addBooking } = useStore()
  const fileRef     = useRef()

  const [selectedTime, setSelectedTime] = useState(null)
  const [submitted,    setSubmitted]    = useState(false)
  const [file,         setFile]         = useState(null)   // { name, preview }
  const [form, setForm] = useState({
    service:'', date:'', firstName:'', lastName:'', email:'', phone:'', message:'',
  })

  const set = k => e => setForm(prev => ({...prev, [k]: e.target.value}))

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

  const handleSubmit = () => {
    const name     = `${form.firstName} ${form.lastName}`.trim() || 'New Customer'
    const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
    const service  = form.service || 'TBC'
    const dateStr  = formatDate(form.date)
    const time     = selectedTime || 'TBC'

    // Parse calDate from selected date
    let calDate = null
    if (form.date) {
      const d = new Date(form.date)
      if (!isNaN(d)) calDate = { month: d.getMonth(), day: d.getDate() }
    }

    addBooking({
      id:           Date.now(),
      avatar:       initials,
      name,
      email:        form.email || '',
      phone:        form.phone || '',
      badge:        'Pending',
      badgeVariant: 'warning',
      status:       'pending',
      notes:        form.message || '',
      attachedFile: file || null,
      calDate,
      details: [
        ['Service', service],
        ['Date',    dateStr],
        ['Time',    time],
      ],
    })
    setSubmitted(true)
  }

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
          <p style={{fontSize:13.5,color:'var(--text-muted)',textAlign:'center',maxWidth:300,lineHeight:1.6}}>
            Your booking request has been sent. We'll be in touch shortly to confirm your appointment.
          </p>
          <div style={{display:'flex',gap:10,marginTop:8,flexWrap:'wrap',justifyContent:'center'}}>
            <Btn variant="primary" onClick={() => navigate('/haven/app/bookings')}>View in dashboard</Btn>
            <Btn variant="secondary" onClick={() => {
              setSubmitted(false)
              setForm({service:'',date:'',firstName:'',lastName:'',email:'',phone:'',message:''})
              setSelectedTime(null)
              setFile(null)
            }}>Submit another</Btn>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="booking-page">
      <div className="booking-box">
        {/* Brand header */}
        <div className="booking-header">
          <div className="booking-brand">
            <div className="booking-brand-mark">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span style={{fontSize:13,fontWeight:700}}>Glam Studio</span>
          </div>
          <div className="booking-title">Book an appointment</div>
          <div className="booking-sub">Fill in your details below and we'll confirm your booking as soon as possible.</div>
        </div>

        <div className="booking-form-body">
          {/* Service */}
          <FormGroup label="Service *">
            <select className="form-input" value={form.service} onChange={set('service')}>
              <option value="">Select a service...</option>
              {SERVICES.map(s=><option key={s}>{s}</option>)}
            </select>
          </FormGroup>

          {/* Date */}
          <FormGroup label="Preferred date *">
            <input className="form-input" type="date"
              min={new Date().toISOString().split('T')[0]}
              value={form.date} onChange={set('date')}
            />
          </FormGroup>

          {/* Time */}
          <FormGroup label="Preferred time *">
            <div className="time-slots">
              {TIMES.map(t=>(
                <button key={t}
                  className={`time-slot${selectedTime===t?' selected':''}`}
                  onClick={()=>setSelectedTime(t)}>
                  {t}
                </button>
              ))}
            </div>
          </FormGroup>

          {/* Name */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:13}}>
            <FormGroup label="First name *">
              <input className="form-input" placeholder="Emma" value={form.firstName} onChange={set('firstName')}/>
            </FormGroup>
            <FormGroup label="Last name *">
              <input className="form-input" placeholder="Clarke" value={form.lastName} onChange={set('lastName')}/>
            </FormGroup>
          </div>

          {/* Contact */}
          <FormGroup label="Email address *">
            <input className="form-input" type="email" placeholder="emma@email.com" value={form.email} onChange={set('email')}/>
          </FormGroup>
          <FormGroup label="Phone number">
            <input className="form-input" type="tel" placeholder="07700 000000" value={form.phone} onChange={set('phone')}/>
          </FormGroup>

          {/* Message */}
          <FormGroup label={<>Message / notes <span style={{color:'var(--text-light)',fontWeight:400}}>(optional)</span></>}>
            <textarea className="form-input" rows={3}
              placeholder="Any specific requests, design ideas, colour preferences or information we should know..."
              value={form.message} onChange={set('message')}/>
          </FormGroup>

          {/* File upload */}
          <div>
            <label className="form-label" style={{marginBottom:6,display:'block'}}>
              Reference image <span style={{color:'var(--text-light)',fontWeight:400}}>(optional)</span>
            </label>
            <button
              onClick={()=>fileRef.current?.click()}
              style={{
                width:'100%',padding:'12px',border:'1.5px dashed var(--border)',
                borderRadius:'var(--radius)',background:'var(--bg)',
                cursor:'pointer',fontSize:13,color:'var(--text-muted)',
                fontFamily:'inherit',display:'flex',alignItems:'center',
                justifyContent:'center',gap:8,transition:'all .14s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--primary)';e.currentTarget.style.color='var(--primary)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)'}}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              {file ? 'Change image' : 'Upload reference image'}
            </button>
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={handleFile}/>

            {/* Preview */}
            {file && (
              <div style={{
                marginTop:10,padding:'10px 12px',background:'var(--surface)',
                border:'1px solid var(--border)',borderRadius:'var(--radius)',
                display:'flex',alignItems:'center',gap:12,
              }}>
                {file.preview
                  ? <img src={file.preview} alt="preview" style={{width:48,height:48,borderRadius:6,objectFit:'cover',flexShrink:0}}/>
                  : <div style={{width:48,height:48,background:'var(--bg)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:20}}>📄</div>
                }
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)'}}>Attached</div>
                </div>
                <button onClick={()=>setFile(null)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:16,padding:'0 4px',flexShrink:0}}>✕</button>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="booking-footer">
          <Btn variant="primary" full size="lg" onClick={handleSubmit}>
            Send booking request
          </Btn>
          <p style={{textAlign:'center',fontSize:11.5,color:'var(--text-light)',marginTop:9}}>
            Booking requests are confirmed by the business. You'll be contacted to confirm.
          </p>
        </div>
      </div>
    </div>
  )
}
