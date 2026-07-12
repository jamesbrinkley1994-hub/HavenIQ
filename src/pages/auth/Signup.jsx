import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { Btn, FormGroup } from '../../components/ui'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp } = useStore()
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(p => ({...p, [k]: e.target.value}))

  const handleSubmit = async () => {
    setError('')
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.name)
      navigate('/haven/onboarding')
    } catch (e) {
      setError(e.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{fontSize:16,fontWeight:700}}>HavenIQ</span>
        </div>
        <div className="auth-title">Create your account</div>
        <div className="auth-sub">Start your free trial. No card required.</div>
        <div className="auth-form">
          <FormGroup label="Full name">
            <input className="form-input" type="text" placeholder="Your name" value={form.name} onChange={set('name')}/>
          </FormGroup>
          <FormGroup label="Email address">
            <input className="form-input" type="email" placeholder="you@yourbusiness.co.uk" value={form.email} onChange={set('email')}/>
          </FormGroup>
          <FormGroup label="Password">
            <input className="form-input" type="password" placeholder="At least 8 characters" value={form.password} onChange={set('password')}/>
          </FormGroup>
          {error && <div style={{fontSize:13,color:'var(--danger)',padding:'8px 12px',background:'var(--danger-tint)',borderRadius:8}}>⚠ {error}</div>}
          <Btn variant="primary" full size="lg" onClick={handleSubmit}>
            {loading ? 'Creating account...' : 'Create account'}
          </Btn>
          <p style={{textAlign:'center',fontSize:12,color:'var(--text-light)'}}>
            By signing up you agree to our <span className="auth-link">Terms</span> and <span className="auth-link">Privacy Policy</span>
          </p>
        </div>
        <div className="auth-footer">
          Already have an account?{' '}
          <span className="auth-link" onClick={() => navigate('/haven/login')}>Sign in</span>
        </div>
      </div>
    </div>
  )
}
