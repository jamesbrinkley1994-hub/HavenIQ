import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { supabase } from '../../supabase'
import { Btn, FormGroup } from '../../components/ui'

const BUSINESS_TYPES = [
  'Nail Technician','Lash & Brow Technician','Tattoo Artist','Tattoo Studio',
  'Hair Salon','Barbershop','Beauty Therapist','Makeup Artist','Spray Tan',
  'Massage Therapist','Personal Trainer','Yoga / Pilates Instructor',
  'Photographer','Videographer','Cleaning Services','Dog Groomer',
  'Dog Walker','Driving Instructor','Tutor','Music Teacher',
  'Landscaping / Gardening','Plumbing & Heating','Electrician',
  'Handyman','Painter & Decorator','Other',
]

// Services grouped — shown all together, user picks what applies
const ALL_SERVICES = [
  // Nails
  'Gel Manicure','Acrylic Full Set','Gel Pedicure','Nail Art','Nail Removal','Infill',
  // Lash & Brow
  'Lash Lift & Tint','Lash Extensions','Brow Lamination','Brow Tint','Brow Wax & Shape',
  // Tattoo
  'Tattoo Consultation','Tattoo Session','Touch-up Session','Piercing',
  // Hair
  'Hair Cut & Style','Colour & Highlights','Balayage','Blowdry','Hair Treatment',
  'Beard Trim & Shape',
  // Beauty
  'Facial','Spray Tan','Waxing','Threading','Dermaplaning','Massage',
  // Fitness
  'Personal Training Session','Group Class','Online Coaching',
  // Other
  'Photography Session','Cleaning Session','Dog Grooming','Driving Lesson',
  '1-to-1 Tutoring','Other / Custom',
]

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

export default function Onboarding() {
  const navigate  = useNavigate()
  const { user, showToast } = useStore()

  const [step,             setStep]             = useState(1)
  const [businessName,     setBusinessName]     = useState('')
  const [businessType,     setBusinessType]     = useState('')
  const [selectedServices, setSelectedServices] = useState([])
  const [customService,    setCustomService]    = useState('')
  const [selectedDays,     setSelectedDays]     = useState(['Mon','Tue','Wed','Thu','Fri'])
  const [startTime,        setStartTime]        = useState('9:00 AM')
  const [endTime,          setEndTime]          = useState('6:00 PM')
  const [duration,         setDuration]         = useState('60 minutes')
  const [saving,           setSaving]           = useState(false)
  const [nameError,        setNameError]        = useState('')

  const toggleService = (s) =>
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const addCustomService = () => {
    const t = customService.trim()
    if (!t) return
    if (!selectedServices.includes(t)) setSelectedServices(prev => [...prev, t])
    setCustomService('')
  }

  const toggleDay = (d) =>
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  const handleFinish = async () => {
    if (!user) return
    setSaving(true)
    try {
      const slug = slugify(businessName || user.email.split('@')[0])

      // Update business record
      await supabase.from('businesses').update({
        name:  businessName || null,
        type:  businessType || null,
        email: user.email,
        slug,
      }).eq('user_id', user.id)

      // Save settings
      const hours = DAYS.map(day => ({
        day: day === 'Mon' ? 'Monday' : day === 'Tue' ? 'Tuesday' : day === 'Wed' ? 'Wednesday'
           : day === 'Thu' ? 'Thursday' : day === 'Fri' ? 'Friday' : day === 'Sat' ? 'Saturday' : 'Sunday',
        open:  selectedDays.includes(day),
        start: startTime,
        end:   endTime,
      }))

      const services = selectedServices.map((name, i) => ({
        id: i + 1, name, price: '', duration: '',
      }))

      await supabase.from('business_settings').upsert({
        business_id:          (await supabase.from('businesses').select('id').eq('user_id', user.id).single()).data?.id,
        services,
        working_hours:        hours,
        appointment_duration: duration,
        notifications:        { booking:true, complaint:true, quote:true, missing:true, summary:false },
        updated_at:           new Date().toISOString(),
      }, { onConflict: 'business_id' })

      navigate('/haven/app')
    } catch (e) {
      showToast('Something went wrong — you can finish setup in Settings', 'warning')
      navigate('/haven/app')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-box">
        {/* Logo */}
        <div className="auth-logo" style={{ marginBottom:20 }}>
          <div className="auth-logo-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{fontSize:16,fontWeight:700}}>HavenIQ</span>
        </div>

        {/* Progress dots */}
        <div className="ob-steps">
          {[1,2,3,4].map(n => (
            <div key={n} className={`ob-dot ${n < step ? 'done' : n === step ? 'current' : 'upcoming'}`}/>
          ))}
        </div>

        {/* ── Step 1: Business details ── */}
        {step === 1 && (
          <div>
            <div className="ob-title">Let's set up your business</div>
            <div className="ob-sub">This helps HavenIQ personalise your booking page and experience.</div>
            <div style={{display:'flex',flexDirection:'column',gap:13}}>
              <FormGroup label="Business name *">
                <input className={`form-input${nameError?' error':''}`} type="text"
                  placeholder="e.g. Sarah's Nail Studio"
                  value={businessName}
                  onChange={e => { setBusinessName(e.target.value); setNameError('') }}/>
                {nameError && <div style={{fontSize:12,color:'var(--danger)',marginTop:4}}>⚠ {nameError}</div>}
              </FormGroup>
              <FormGroup label="Business type">
                <select className="form-input" value={businessType} onChange={e => setBusinessType(e.target.value)}>
                  <option value="">Select your business type...</option>
                  {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </FormGroup>
            </div>
            <div className="ob-actions">
              <span style={{fontSize:12,color:'var(--text-muted)'}}>Step 1 of 4</span>
              <Btn variant="primary" onClick={() => {
                if (!businessName.trim()) { setNameError('Please enter your business name'); return }
                setStep(2)
              }}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* ── Step 2: Services ── */}
        {step === 2 && (
          <div>
            <div className="ob-title">What services do you offer?</div>
            <div className="ob-sub">Select all that apply. You can edit these later in Settings.</div>

            <div className="service-tags" style={{maxHeight:220,overflowY:'auto',paddingRight:4}}>
              {ALL_SERVICES.map(s => (
                <button key={s}
                  className={`service-tag${selectedServices.includes(s) ? ' selected' : ''}`}
                  onClick={() => toggleService(s)}>
                  {s}
                </button>
              ))}
            </div>

            {/* Custom service input */}
            <div style={{display:'flex',gap:8,marginTop:12}}>
              <input className="form-input" placeholder="Add your own service..."
                value={customService} onChange={e => setCustomService(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomService()}
                style={{flex:1}}/>
              <Btn variant="secondary" onClick={addCustomService}>Add</Btn>
            </div>

            {selectedServices.length > 0 && (
              <div style={{marginTop:10,fontSize:12,color:'var(--text-muted)'}}>
                ✓ {selectedServices.length} service{selectedServices.length!==1?'s':''} selected
              </div>
            )}

            <div style={{marginTop:14}}>
              <FormGroup label="Default appointment duration">
                <select className="form-input" value={duration} onChange={e => setDuration(e.target.value)}>
                  {['30 minutes','45 minutes','60 minutes','90 minutes','2 hours','Half day','Full day'].map(o => <option key={o}>{o}</option>)}
                </select>
              </FormGroup>
            </div>

            <div className="ob-actions">
              <Btn variant="secondary" onClick={() => setStep(1)}>← Back</Btn>
              <Btn variant="primary" onClick={() => setStep(3)}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* ── Step 3: Working hours ── */}
        {step === 3 && (
          <div>
            <div className="ob-title">When do you work?</div>
            <div className="ob-sub">Select your working days and hours. You can adjust these any time.</div>
            <FormGroup label="Working days">
              <div className="days-grid">
                {DAYS.map(d => (
                  <button key={d}
                    className={`day-btn${selectedDays.includes(d) ? ' selected' : ''}`}
                    onClick={() => toggleDay(d)}>
                    {d}
                  </button>
                ))}
              </div>
            </FormGroup>
            <div className="hours-grid">
              <FormGroup label="Start time">
                <select className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)}>
                  {['7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','11:00 AM'].map(t => <option key={t}>{t}</option>)}
                </select>
              </FormGroup>
              <FormGroup label="End time">
                <select className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)}>
                  {['3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM'].map(t => <option key={t}>{t}</option>)}
                </select>
              </FormGroup>
            </div>
            <div className="ob-actions">
              <Btn variant="secondary" onClick={() => setStep(2)}>← Back</Btn>
              <Btn variant="primary" onClick={() => setStep(4)}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === 4 && (
          <div style={{textAlign:'center'}}>
            <div style={{width:56,height:56,background:'var(--success-tint)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="ob-title">You're all set!</div>
            <div className="ob-sub">
              Your booking page is live at:<br/>
              <strong style={{color:'var(--primary)',wordBreak:'break-all'}}>
                {window.location.host}/haven/book/{slugify(businessName || 'my-business')}
              </strong>
            </div>
            <Btn variant="primary" size="lg" onClick={handleFinish} style={{marginTop:8}}>
              {saving ? 'Setting up...' : 'Go to my dashboard →'}
            </Btn>
          </div>
        )}
      </div>
    </div>
  )
}
