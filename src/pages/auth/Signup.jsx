import { useNavigate } from 'react-router-dom'
import { Btn, FormGroup, LogoMark } from '../../components/ui'

function AuthLogo() {
  return (
    <div className="auth-logo">
      <div className="auth-logo-mark">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <span style={{ fontSize: 16, fontWeight: 700 }}>HavenIQ</span>
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  return (
    <div className="auth-page">
      <div className="auth-box">
        <AuthLogo />
        <div className="auth-title">Create your account</div>
        <div className="auth-sub">Start your free 14-day trial. No card required.</div>
        <div className="auth-form">
          <FormGroup label="Full name">
            <input className="form-input" type="text" placeholder="Sarah Mitchell" />
          </FormGroup>
          <FormGroup label="Email address">
            <input className="form-input" type="email" placeholder="sarah@yourbusiness.co.uk" />
          </FormGroup>
          <FormGroup label="Password">
            <input className="form-input" type="password" placeholder="At least 8 characters" />
          </FormGroup>
          <Btn variant="primary" full size="lg" onClick={() => navigate('/haven/onboarding')}>
            Create account
          </Btn>
          <p style={{ textAlign:'center', fontSize:12, color:'var(--text-light)' }}>
            By signing up you agree to our{' '}
            <span className="auth-link">Terms</span> and{' '}
            <span className="auth-link">Privacy Policy</span>
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
