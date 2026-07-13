import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { Btn, FormGroup } from '../../components/ui'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useStore()
  const [form, setForm] = useState({ email:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(p => ({...p, [k]: e.target.value}))

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.password) { setError('Please enter your email and password'); return }
    setLoading(true)
    try {
      await signIn(form.email, form.password)
      navigate('/haven/app')
    } catch (e) {
      setError('Incorrect email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

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
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to your HavenIQ account.</div>
        <div className="auth-form">
          <FormGroup label="Email address">
            <input className="form-input" type="email" placeholder="you@yourbusiness.co.uk"
              value={form.email} onChange={set('email')} onKeyDown={handleKeyDown}/>
          </FormGroup>
          <FormGroup label="Password">
            <input className="form-input" type="password" placeholder="Your password"
              value={form.password} onChange={set('password')} onKeyDown={handleKeyDown}/>
          </FormGroup>
          {error && <div style={{fontSize:13,color:'var(--danger)',padding:'8px 12px',background:'var(--danger-tint)',borderRadius:8}}>⚠ {error}</div>}
          <Btn variant="primary" full size="lg" onClick={handleSubmit}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Btn>
          <p style={{textAlign:'center',fontSize:12}}>
            <span className="auth-link">Forgot your password?</span>
          </p>
        </div>
        <div className="auth-footer">
          Don't have an account?{' '}
          <span className="auth-link" onClick={() => navigate('/haven/signup')}>Sign up free</span>
        </div>
      </div>
    </div>
  )
}
