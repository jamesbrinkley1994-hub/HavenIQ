import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, FormGroup } from '../../components/ui'

const SERVICES = ['Regular Clean','Deep Clean','End of Tenancy','Office Clean','Window Cleaning','Carpet Cleaning','Oven Cleaning']
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState(['Regular Clean'])
  const [selectedDays, setSelectedDays] = useState(['Mon','Tue','Wed','Thu','Fri'])

  const toggleService = (s) =>
    setSelectedServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])

  const toggleDay = (d) =>
    setSelectedDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])

  return (
    <div className="onboarding-page">
      <div className="onboarding-box">
        {/* Logo */}
        <div className="auth-logo" style={{ marginBottom: 20 }}>
          <div className="auth-logo-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>HavenIQ</span>
        </div>

        {/* Step dots */}
        <div className="ob-steps">
          {[1,2,3,4].map((n) => (
            <div
              key={n}
              className={`ob-dot ${n < step ? 'done' : n === step ? 'current' : 'upcoming'}`}
            />
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <div className="ob-title">Let's set up your business</div>
            <div className="ob-sub">This helps HavenIQ personalise your experience and booking page.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
              <FormGroup label="Business name">
                <input className="form-input" type="text" placeholder="e.g. Mitchell's Cleaning Services" />
              </FormGroup>
              <FormGroup label="Business type">
                <select className="form-input">
                  <option>Cleaning Services</option>
                  <option>Plumbing & Heating</option>
                  <option>Hair & Beauty</option>
                  <option>Personal Training</option>
                  <option>Photography</option>
                  <option>Landscaping</option>
                  <option>Other</option>
                </select>
              </FormGroup>
            </div>
            <div className="ob-actions">
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>Step 1 of 4</span>
              <Btn variant="primary" onClick={() => setStep(2)}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <div className="ob-title">What services do you offer?</div>
            <div className="ob-sub">Select all that apply. You can add more later.</div>
            <div className="service-tags">
              {SERVICES.map((s) => (
                <button
                  key={s}
                  className={`service-tag${selectedServices.includes(s) ? ' selected' : ''}`}
                  onClick={() => toggleService(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <FormGroup label="Appointment duration">
                <select className="form-input">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                  <option>3 hours</option>
                  <option>Half day</option>
                  <option>Full day</option>
                </select>
              </FormGroup>
            </div>
            <div className="ob-actions">
              <Btn variant="secondary" onClick={() => setStep(1)}>← Back</Btn>
              <Btn variant="primary" onClick={() => setStep(3)}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <div className="ob-title">When do you work?</div>
            <div className="ob-sub">Select your working days and set your hours.</div>
            <FormGroup label="Working days">
              <div className="days-grid">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    className={`day-btn${selectedDays.includes(d) ? ' selected' : ''}`}
                    onClick={() => toggleDay(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </FormGroup>
            <div className="hours-grid">
              <FormGroup label="Start time">
                <select className="form-input">
                  <option>7:00 AM</option><option>8:00 AM</option>
                  <option selected>9:00 AM</option><option>10:00 AM</option>
                </select>
              </FormGroup>
              <FormGroup label="End time">
                <select className="form-input">
                  <option>4:00 PM</option><option>5:00 PM</option>
                  <option selected>6:00 PM</option><option>7:00 PM</option>
                </select>
              </FormGroup>
            </div>
            <div className="ob-actions">
              <Btn variant="secondary" onClick={() => setStep(2)}>← Back</Btn>
              <Btn variant="primary" onClick={() => setStep(4)}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width:56, height:56, background:'var(--success-tint)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="ob-title">You're all set!</div>
            <div className="ob-sub">HavenIQ is ready. Your booking page is live and your dashboard is waiting.</div>
            <Btn variant="primary" size="lg" onClick={() => navigate('/haven/app')}>
              Go to my dashboard →
            </Btn>
          </div>
        )}
      </div>
    </div>
  )
}
