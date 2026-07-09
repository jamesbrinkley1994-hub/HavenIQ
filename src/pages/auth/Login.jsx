import { useNavigate } from 'react-router-dom'
import { Btn, FormGroup } from '../../components/ui'

export default function Login() {
  const navigate = useNavigate()
  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>HavenIQ</span>
        </div>
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to your HavenIQ account.</div>
        <div className="auth-form">
          <FormGroup label="Email address">
            <input className="form-input" type="email" placeholder="sarah@yourbusiness.co.uk" />
          </FormGroup>
          <FormGroup label="Password">
            <input className="form-input" type="password" placeholder="Your password" />
          </FormGroup>
          <Btn variant="primary" full size="lg" onClick={() => navigate('/haven/app')}>
            Sign in
          </Btn>
          <p style={{ textAlign:'center', fontSize:12 }}>
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
