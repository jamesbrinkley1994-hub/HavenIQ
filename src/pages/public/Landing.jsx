import { useNavigate } from 'react-router-dom'
import { Btn, LogoMark } from '../../components/ui'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="lp">
      {/* ── Nav ── */}
      <nav className="lp-nav">
        <div className="lp-logo">
          <div className="lp-logo-mark">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>HavenIQ</span>
        </div>
        <div className="lp-nav-links">
          <a>Features</a>
          <a>How it works</a>
          <a>Pricing</a>
        </div>
        <div className="lp-nav-actions">
          <Btn variant="secondary" onClick={() => navigate('/haven/login')}>Sign in</Btn>
          <Btn variant="primary" onClick={() => navigate('/haven/signup')}>Get started free</Btn>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-badge">✦ Now in early access</div>
        <h1>Your enquiries,<br /><span>organised for you.</span></h1>
        <p className="lp-hero-sub">
          HavenIQ automatically sorts your emails, booking requests, quotes, and complaints —
          so you focus on running your business, not your inbox.
        </p>
        <div className="lp-hero-actions">
          <Btn variant="primary" size="lg" onClick={() => navigate('/haven/signup')}>Start for free</Btn>
          <Btn variant="secondary" size="lg">See how it works</Btn>
        </div>
        <p className="lp-hero-note">Free 14-day trial · No credit card required</p>

        {/* Mockup */}
        <div className="lp-mockup">
          <div className="lp-mockup-window">
            <div className="lp-mockup-bar">
              <div className="lp-mockup-dot" style={{ background: '#FF5F57' }} />
              <div className="lp-mockup-dot" style={{ background: '#FEBC2E' }} />
              <div className="lp-mockup-dot" style={{ background: '#28C840' }} />
            </div>
            <div className="lp-mockup-inner">
              <div className="lp-mockup-sidebar">
                {['Dashboard', 'Bookings', 'Quotes', 'Complaints', 'Enquiries', 'Calendar'].map((item, i) => (
                  <div key={item} className={`lp-mockup-sidebar-item${i === 0 ? ' active' : ''}`}>
                    <div className="lp-mockup-sidebar-dot" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="lp-mockup-main">
                <div className="lp-mockup-title">Good morning, Sarah 👋</div>
                <div className="lp-mockup-cards">
                  {[['5','New Bookings'],['2','Quotes'],['1','Complaints'],['3','Enquiries']].map(([n,l]) => (
                    <div key={l} className="lp-mockup-card">
                      <div className="lp-mockup-card-num">{n}</div>
                      <div className="lp-mockup-card-label">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="lp-mockup-rows">
                  {[
                    ['JH','James Harper','Deep Clean · Mon 14 Jul','warning','Pending'],
                    ['EC','Emma Clarke','Regular Clean · Tue 15 Jul','success','Confirmed'],
                    ['RB','Rachel Burns','Quote Request · ⚠ Missing info','info','Quote'],
                  ].map(([av,name,sub,variant,label]) => (
                    <div key={name} className="lp-mockup-row">
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <div className="lp-mockup-av">{av}</div>
                        <div>
                          <div style={{ fontSize:11, fontWeight:500 }}>{name}</div>
                          <div style={{ fontSize:9.5, color:'var(--text-muted)' }}>{sub}</div>
                        </div>
                      </div>
                      <span className={`badge badge-${variant}`} style={{ fontSize:9 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-features">
        <div className="lp-section-label">Features</div>
        <div className="lp-section-title">Everything in one place. Nothing lost.</div>
        <div className="lp-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-feature-card">
              <div className="lp-feature-icon">{f.icon}</div>
              <div className="lp-feature-title">{f.title}</div>
              <div className="lp-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="lp-pricing">
        <div className="lp-pricing-inner">
          <div className="lp-pricing-header">
            <div className="lp-section-label" style={{ textAlign: 'center' }}>Pricing</div>
            <div className="lp-section-title" style={{ textAlign: 'center' }}>Simple, honest pricing.</div>
            <p style={{ textAlign:'center', marginTop:10, color:'var(--text-muted)', fontSize:14 }}>
              No hidden fees. Cancel any time.
            </p>
          </div>
          <div className="lp-pricing-grid">
            {PLANS.map((p) => (
              <div key={p.tier} className={`lp-price-card${p.featured ? ' featured' : ''}`}>
                <div className="lp-price-tier">{p.tier}</div>
                <div className="lp-price-amount">{p.price}</div>
                <div className="lp-price-period">{p.period}</div>
                <div className="lp-price-desc">{p.desc}</div>
                <div className="lp-price-features">
                  {p.features.map((f) => <div key={f} className="lp-price-feature">{f}</div>)}
                </div>
                <Btn
                  variant={p.featured ? 'primary' : 'secondary'}
                  full
                  onClick={() => navigate('/haven/signup')}
                >
                  {p.cta}
                </Btn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <h2>Stop losing enquiries in your inbox.</h2>
        <p>Join hundreds of small businesses already using HavenIQ to stay organised.</p>
        <div style={{ marginTop: 24 }}>
          <Btn variant="primary" size="lg" onClick={() => navigate('/haven/signup')}>
            Get started free →
          </Btn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:18, height:18, borderRadius:5, background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span style={{ fontWeight:600, color:'var(--text)' }}>HavenIQ</span>
        </div>
        <span>© 2026 HavenIQ. All rights reserved.</span>
        <div style={{ display:'flex', gap:18 }}>
          <a style={{ cursor:'pointer' }}>Privacy</a>
          <a style={{ cursor:'pointer' }}>Terms</a>
        </div>
      </footer>
    </div>
  )
}

// ── Data ────────────────────────────────────────────────
const FEATURES = [
  {
    title: 'AI Email Sorting',
    desc: 'Incoming emails are automatically classified as bookings, quotes, complaints, or enquiries — ready for your review.',
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  },
  {
    title: 'Booking Management',
    desc: 'Approve or decline bookings with one click. Customers book through your personal HavenIQ page.',
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    title: 'Missing Info Detection',
    desc: 'HavenIQ spots incomplete enquiries and prepares a suggested reply to collect what\'s needed — instantly.',
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  },
  {
    title: 'Quote Queue',
    desc: 'All quote requests in one organised queue. No more hunting through emails to find what a customer wanted.',
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  },
  {
    title: 'Business Knowledge',
    desc: 'Store your policies, services, and rules. HavenIQ uses this context to handle enquiries intelligently.',
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  },
  {
    title: 'Public Booking Page',
    desc: 'Share a clean booking page with customers. All requests flow straight into your dashboard.',
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
]

const PLANS = [
  {
    tier: 'Starter', price: 'Free', period: 'Forever', featured: false, cta: 'Get started',
    desc: 'Perfect for testing HavenIQ with a handful of bookings per month.',
    features: ['Up to 20 bookings/month','Public booking page','Basic categorisation','Email support'],
  },
  {
    tier: 'Pro', price: '£19', period: 'per month', featured: true, cta: 'Start free trial',
    desc: 'Everything a self-employed professional needs to run smoothly.',
    features: ['Unlimited bookings','AI email categorisation','Missing info detection','Business knowledge base','Priority support'],
  },
  {
    tier: 'Business', price: '£49', period: 'per month', featured: false, cta: 'Get started',
    desc: 'For small teams managing higher volumes of enquiries.',
    features: ['Everything in Pro','Up to 5 team members','Custom booking domains','API access (coming soon)','Dedicated support'],
  },
]
