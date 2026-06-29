import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { Btn, FormGroup } from '../../components/ui'

const SERVICES = ['Regular Clean','Deep Clean','End of Tenancy','Office Clean','Carpet Clean']
const TIMES    = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM']

export default function BookingPage() {
  const navigate    = useNavigate()
  const { addBooking } = useStore()

  const [selectedTime, setSelectedTime] = useState(null)
  const [submitted,    setSubmitted]    = useState(false)
  const [form, setForm] = useState({
    service:'', date:'', firstName:'', lastName:'', email:'', phone:'', notes:''
  })

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = () => {
    const name     = `${form.firstName} ${form.lastName}`.trim() || 'New Customer'
    const initials = name.split(' ').map((w) => w[0]).join('').slice(0,2).toUpperCase()
    const service  = form.service  || 'Regular Clean'
    const date     = form.date     ? new Date(form.date).toLocaleDateString('en-GB',{ weekday:'short', day:'numeric', month:'short' }) : 'TBC'
    const time     = selectedTime  || 'TBC'

    addBooking({
      id:           Date.now(),
      avatar:       initials,
      name,
      email:        form.email || 'customer@email.com',
      badge:        'Pending',
      badgeVariant: 'warning',
      status:       'pending',
      details: [
        ['Service', service],
        ['Date',    date],
        ['Time',    time],
      ],
    })

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="booking-page">
        <div className="booking-box">
          <div className="booking-success">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{ fontSize:17, fontWeight:700 }}>Request submitted!</h3>
            <p style={{ fontSize:13, color:'var(--text-muted)', textAlign:'center', maxWidth:300 }}>
              Mitchell's Cleaning Services will review and confirm your appointment shortly.
            </p>
            <p style={{ fontSize:12, color:'var(--primary)', fontWeight:600, textAlign:'center' }}>
              Your booking has appeared in the owner's dashboard →
            </p>
            <div style={{ display:'flex', gap:10, marginTop:6 }}>
              <Btn variant="primary" onClick={() => navigate('/haven/app/bookings')}>
                View in dashboard
              </Btn>
              <Btn variant="secondary" onClick={() => { setSubmitted(false); setForm({ service:'', date:'', firstName:'', lastName:'', email:'', phone:'', notes:'' }); setSelectedTime(null) }}>
                Submit another
              </Btn>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-page">
      <div className="booking-box">
        {/* Header */}
        <div className="booking-header">
          <div className="booking-brand">
            <div className="booking-brand-mark">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span style={{ fontSize:13, fontWeight:700 }}>Mitchell's Cleaning Services</span>
          </div>
          <div className="booking-title">Book an appointment</div>
          <div className="booking-sub">Fill in your details and we'll confirm your booking as soon as possible.</div>
        </div>

        {/* Form */}
        <div className="booking-form-body">
          <FormGroup label="Service">
            <select className="form-input" value={form.service} onChange={set('service')}>
              <option value="">Select a service...</option>
              {SERVICES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormGroup>

          <FormGroup label="Preferred date">
            <input className="form-input" type="date" value={form.date} onChange={set('date')} />
          </FormGroup>

          <FormGroup label="Preferred time">
            <div className="time-slots">
              {TIMES.map((t) => (
                <button
                  key={t}
                  className={`time-slot${selectedTime === t ? ' selected' : ''}`}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </FormGroup>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13 }}>
            <FormGroup label="First name">
              <input className="form-input" type="text" placeholder="Emma" value={form.firstName} onChange={set('firstName')} />
            </FormGroup>
            <FormGroup label="Last name">
              <input className="form-input" type="text" placeholder="Clarke" value={form.lastName} onChange={set('lastName')} />
            </FormGroup>
          </div>

          <FormGroup label="Email address">
            <input className="form-input" type="email" placeholder="emma@email.com" value={form.email} onChange={set('email')} />
          </FormGroup>

          <FormGroup label="Phone number">
            <input className="form-input" type="tel" placeholder="07700 000000" value={form.phone} onChange={set('phone')} />
          </FormGroup>

          <FormGroup label={<>Notes <span style={{ color:'var(--text-light)', fontWeight:400 }}>(optional)</span></>}>
            <textarea className="form-input" placeholder="Access instructions, pets, areas to focus on..." value={form.notes} onChange={set('notes')} />
          </FormGroup>
        </div>

        {/* Footer */}
        <div className="booking-footer">
          <Btn variant="primary" full size="lg" onClick={handleSubmit}>
            Submit booking request
          </Btn>
          <p style={{ textAlign:'center', fontSize:11.5, color:'var(--text-light)', marginTop:9 }}>
            Subject to availability and owner approval.
          </p>
        </div>
      </div>
    </div>
  )
}
