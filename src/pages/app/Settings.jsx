import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { Btn, FormGroup, Toggle, Card } from '../../components/ui'

const PANELS = ['Business', 'Working Hours', 'Services', 'Notifications', 'Account']

const HOURS_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday']
const CLOSED_DAYS = ['Saturday','Sunday']

const INITIAL_SERVICES = [
  { id: 1, name: 'Regular Clean',    sub: 'From £65 · 2 hours' },
  { id: 2, name: 'Deep Clean',       sub: 'From £130 · 4 hours' },
  { id: 3, name: 'End of Tenancy',   sub: 'Quote on inspection' },
]

const INITIAL_NOTIFS = [
  { id: 'booking',  title: 'New booking request',  sub: 'Get notified when a customer submits a booking', on: true },
  { id: 'complaint',title: 'New complaint',         sub: 'Get notified of incoming complaints immediately', on: true },
  { id: 'quote',    title: 'New quote request',     sub: 'Get notified when someone requests a quote', on: true },
  { id: 'missing',  title: 'Missing info flagged',  sub: 'AI detected an incomplete enquiry', on: true },
  { id: 'summary',  title: 'Daily summary',         sub: 'Receive a daily digest of all activity', on: false },
]

export default function Settings() {
  const navigate = useNavigate()
  const [active, setActive] = useState('Business')
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS)
  const [services, setServices] = useState(INITIAL_SERVICES)
  const [copied, setCopied] = useState(false)

  const toggleNotif = (id) =>
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, on: !n.on } : n))

  const removeService = (id) =>
    setServices((prev) => prev.filter((s) => s.id !== id))

  const copyLink = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AppShell title="Settings">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and business preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Nav */}
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          {PANELS.map((p) => (
            <button
              key={p}
              className={`settings-nav-item${active === p ? ' active' : ''}`}
              onClick={() => setActive(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Panels */}
        <div>
          {/* ── Business ── */}
          {active === 'Business' && (
            <Card>
              <div className="settings-section-title">Business Details</div>
              <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <FormGroup label="Business name">
                  <input className="form-input" defaultValue="Mitchell's Cleaning Services" />
                </FormGroup>
                <FormGroup label="Business type">
                  <select className="form-input">
                    <option>Cleaning Services</option>
                    <option>Plumbing & Heating</option>
                    <option>Hair & Beauty</option>
                    <option>Other</option>
                  </select>
                </FormGroup>
                <FormGroup label="Public booking page URL">
                  <div style={{ display:'flex', gap:8 }}>
                    <input
                      className="form-input"
                      defaultValue="haven.app/book/mitchells-cleaning"
                      readOnly
                      style={{ background:'var(--bg)', color:'var(--text-muted)' }}
                    />
                    <Btn variant="secondary" onClick={copyLink}>
                      {copied ? '✓ Copied' : 'Copy'}
                    </Btn>
                  </div>
                </FormGroup>
                <Btn variant="primary" style={{ width:'fit-content' }}>Save changes</Btn>
              </div>
            </Card>
          )}

          {/* ── Working Hours ── */}
          {active === 'Working Hours' && (
            <Card>
              <div className="settings-section-title">Working Hours</div>
              <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                {HOURS_DAYS.map((day) => (
                  <div key={day} style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr auto', gap:9, alignItems:'center' }}>
                    <span style={{ fontSize:13, fontWeight:500 }}>{day}</span>
                    <select className="form-input"><option>9:00 AM</option><option>8:00 AM</option><option>10:00 AM</option></select>
                    <select className="form-input"><option>6:00 PM</option><option>5:00 PM</option><option>7:00 PM</option></select>
                    <span className="badge badge-success">Open</span>
                  </div>
                ))}
                {CLOSED_DAYS.map((day) => (
                  <div key={day} style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr auto', gap:9, alignItems:'center' }}>
                    <span style={{ fontSize:13, fontWeight:500, color:'var(--text-muted)' }}>{day}</span>
                    <select className="form-input" disabled style={{ opacity:0.5 }}><option>Closed</option></select>
                    <select className="form-input" disabled style={{ opacity:0.5 }}><option>Closed</option></select>
                    <span className="badge badge-neutral">Closed</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:16 }}>
                <FormGroup label="Default appointment duration">
                  <select className="form-input" style={{ width:200 }}>
                    <option>1 hour</option><option selected>2 hours</option><option>3 hours</option>
                  </select>
                </FormGroup>
              </div>
              <Btn variant="primary" style={{ marginTop:16, width:'fit-content' }}>Save changes</Btn>
            </Card>
          )}

          {/* ── Services ── */}
          {active === 'Services' && (
            <Card>
              <div className="settings-section-title">Services Offered</div>
              <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:14 }}>
                {services.map((s) => (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px', border:'1px solid var(--border)', borderRadius:9 }}>
                    <div>
                      <div style={{ fontSize:13.5, fontWeight:500 }}>{s.name}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.sub}</div>
                    </div>
                    <div style={{ display:'flex', gap:7 }}>
                      <Btn variant="secondary" size="sm">Edit</Btn>
                      <Btn variant="danger" size="sm" onClick={() => removeService(s.id)}>Remove</Btn>
                    </div>
                  </div>
                ))}
              </div>
              <Btn variant="secondary" onClick={() => setServices((p) => [...p, { id: Date.now(), name: 'New Service', sub: 'Add details' }])}>
                + Add service
              </Btn>
            </Card>
          )}

          {/* ── Notifications ── */}
          {active === 'Notifications' && (
            <Card>
              <div className="settings-section-title">Notifications</div>
              {notifs.map((n) => (
                <div key={n.id} className="settings-row">
                  <div>
                    <div className="settings-row-title">{n.title}</div>
                    <div className="settings-row-sub">{n.sub}</div>
                  </div>
                  <Toggle on={n.on} onClick={() => toggleNotif(n.id)} />
                </div>
              ))}
            </Card>
          )}

          {/* ── Account ── */}
          {active === 'Account' && (
            <Card>
              <div className="settings-section-title">Account Details</div>
              <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <FormGroup label="Full name">
                  <input className="form-input" defaultValue="Sarah Mitchell" />
                </FormGroup>
                <FormGroup label="Email address">
                  <input className="form-input" type="email" defaultValue="sarah@mitchellsclean.co.uk" />
                </FormGroup>
                <FormGroup label="Change password">
                  <input className="form-input" type="password" placeholder="New password" />
                </FormGroup>
                <div style={{ display:'flex', gap:9 }}>
                  <Btn variant="primary">Save changes</Btn>
                  <Btn variant="danger" onClick={() => navigate('/haven')}>Sign out</Btn>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  )
}
