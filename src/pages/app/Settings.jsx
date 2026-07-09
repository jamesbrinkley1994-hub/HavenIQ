import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { Btn, FormGroup, Toggle, Card } from '../../components/ui'

const PANELS = ['Business','Booking Link','Working Hours','Services','Notifications','Account']

const HOURS_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const CLOSED_DAYS = ['Sunday']

const INITIAL_SERVICES = [
  { id:1, name:'Gel Manicure',      sub:'From £35 · 60 min' },
  { id:2, name:'Acrylic Full Set',  sub:'From £50 · 90 min' },
  { id:3, name:'Lash Lift & Tint',  sub:'From £55 · 60 min' },
  { id:4, name:'Brow Lamination',   sub:'From £40 · 45 min' },
  { id:5, name:'Tattoo Consultation',sub:'Free · 30 min' },
]

const INITIAL_NOTIFS = [
  { id:'booking',   title:'New booking request',  sub:'Get notified when a customer submits a booking', on:true },
  { id:'complaint', title:'New complaint',         sub:'Get notified of incoming complaints immediately', on:true },
  { id:'quote',     title:'New quote request',     sub:'Get notified when someone requests a quote', on:true },
  { id:'missing',   title:'Missing info flagged',  sub:'AI detected an incomplete enquiry', on:true },
  { id:'summary',   title:'Daily summary email',   sub:'Receive a morning digest of all activity', on:false },
]

const BOOKING_URL = 'haveniq.app/book/glam-studio'

export default function Settings() {
  const navigate = useNavigate()
  const [active,   setActive]   = useState('Business')
  const [notifs,   setNotifs]   = useState(INITIAL_NOTIFS)
  const [services, setServices] = useState(INITIAL_SERVICES)
  const [copied,   setCopied]   = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const toggleNotif  = id => setNotifs(prev => prev.map(n => n.id===id?{...n,on:!n.on}:n))
  const removeService= id => setServices(prev => prev.filter(s => s.id!==id))

  const copyBusinessLink = () => { setCopied(true); setTimeout(()=>setCopied(false),2000) }
  const copyBookingLink  = () => { setLinkCopied(true); setTimeout(()=>setLinkCopied(false),2500) }

  return (
    <AppShell title="Settings">
      <div className="page-header">
        <div><h1>Settings</h1><p>Manage your account and business preferences</p></div>
      </div>

      <div className="settings-grid">
        {/* Nav */}
        <div style={{display:'flex',flexDirection:'column',gap:2}}>
          {PANELS.map(p=>(
            <button key={p} className={`settings-nav-item${active===p?' active':''}`} onClick={()=>setActive(p)}>
              {p}
            </button>
          ))}
        </div>

        {/* Panels */}
        <div>

          {/* ── Business ── */}
          {active==='Business'&&(
            <Card>
              <div className="settings-section-title">Business Details</div>
              <div style={{display:'flex',flexDirection:'column',gap:13}}>
                <FormGroup label="Business name">
                  <input className="form-input" defaultValue="Glam Studio"/>
                </FormGroup>
                <FormGroup label="Business type">
                  <select className="form-input">
                    <option>Nail Technician</option>
                    <option>Tattoo Studio</option>
                    <option>Lash & Brow</option>
                    <option>Hair & Beauty</option>
                    <option>Cleaning Services</option>
                    <option>Other</option>
                  </select>
                </FormGroup>
                <FormGroup label="Business email">
                  <input className="form-input" type="email" defaultValue="hello@glamstudio.co.uk"/>
                </FormGroup>
                <FormGroup label="Phone number">
                  <input className="form-input" type="tel" defaultValue="07700 123456"/>
                </FormGroup>
                <Btn variant="primary" style={{width:'fit-content'}}>Save changes</Btn>
              </div>
            </Card>
          )}

          {/* ── Booking Link ── */}
          {active==='Booking Link'&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <Card>
                <div className="settings-section-title">Your Public Booking Link</div>
                <p style={{fontSize:13.5,color:'var(--text-muted)',lineHeight:1.65,marginBottom:18}}>
                  Share this link with customers so they can request a booking directly. Works on Instagram, Facebook, WhatsApp, and anywhere you have an online presence.
                </p>

                {/* Link display */}
                <div style={{
                  display:'flex',alignItems:'center',gap:8,padding:'11px 14px',
                  background:'var(--bg)',border:'1.5px solid var(--border)',
                  borderRadius:'var(--radius)',marginBottom:14,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  <span style={{flex:1,fontSize:13.5,color:'var(--text)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{BOOKING_URL}</span>
                </div>

                <div style={{display:'flex',gap:9,flexWrap:'wrap',marginBottom:20}}>
                  <Btn variant="primary" onClick={copyBookingLink}>
                    {linkCopied?'✓ Copied!':'Copy link'}
                  </Btn>
                  <Btn variant="secondary" onClick={()=>window.open(`https://${BOOKING_URL}`,'_blank')}>
                    Open booking page ↗
                  </Btn>
                </div>

                <div style={{
                  background:'var(--primary-tint)',border:'1px solid #C4BFFF',
                  borderRadius:10,padding:'14px 16px',
                }}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--primary)',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.05em'}}>
                    💡 Where to share this link
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {[
                      { icon:'📸', label:'Instagram', tip:'Add to your bio — tap Edit Profile → Website' },
                      { icon:'📘', label:'Facebook',  tip:'Add as a "Book Now" button on your page' },
                      { icon:'💬', label:'WhatsApp',  tip:'Pin it to the top of your WhatsApp Business profile' },
                      { icon:'🌐', label:'Website',   tip:'Embed as a button or link in your contact page' },
                    ].map(({icon,label,tip})=>(
                      <div key={label} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                        <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
                        <div>
                          <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{label} — </span>
                          <span style={{fontSize:13,color:'var(--text-muted)'}}>{tip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="settings-section-title">Booking Page Preview</div>
                <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:14}}>This is what customers see when they visit your booking link.</p>
                <Btn variant="secondary" onClick={()=>navigate('/haven/book/demo')}>
                  Preview booking page →
                </Btn>
              </Card>
            </div>
          )}

          {/* ── Working Hours ── */}
          {active==='Working Hours'&&(
            <Card>
              <div className="settings-section-title">Working Hours</div>
              <div style={{display:'flex',flexDirection:'column',gap:11}}>
                {HOURS_DAYS.map(day=>(
                  <div key={day} style={{display:'grid',gridTemplateColumns:'110px 1fr 1fr auto',gap:9,alignItems:'center'}}>
                    <span style={{fontSize:13,fontWeight:500}}>{day}</span>
                    <select className="form-input">
                      {['9:00 AM','10:00 AM','11:00 AM'].map(o=><option key={o}>{o}</option>)}
                    </select>
                    <select className="form-input">
                      {['5:00 PM','6:00 PM','7:00 PM','8:00 PM'].map(o=><option key={o}>{o}</option>)}
                    </select>
                    <span className="badge badge-success">Open</span>
                  </div>
                ))}
                {CLOSED_DAYS.map(day=>(
                  <div key={day} style={{display:'grid',gridTemplateColumns:'110px 1fr 1fr auto',gap:9,alignItems:'center'}}>
                    <span style={{fontSize:13,fontWeight:500,color:'var(--text-muted)'}}>{day}</span>
                    <select className="form-input" disabled style={{opacity:.5}}><option>Closed</option></select>
                    <select className="form-input" disabled style={{opacity:.5}}><option>Closed</option></select>
                    <span className="badge badge-neutral">Closed</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:16}}>
                <FormGroup label="Default appointment slot">
                  <select className="form-input" style={{width:200}}>
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                    <option selected>60 minutes</option>
                    <option>90 minutes</option>
                    <option>2 hours</option>
                  </select>
                </FormGroup>
              </div>
              <Btn variant="primary" style={{marginTop:16,width:'fit-content'}}>Save changes</Btn>
            </Card>
          )}

          {/* ── Services ── */}
          {active==='Services'&&(
            <Card>
              <div className="settings-section-title">Services Offered</div>
              <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:14}}>
                {services.map(s=>(
                  <div key={s.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:11,border:'1px solid var(--border)',borderRadius:9}}>
                    <div>
                      <div style={{fontSize:13.5,fontWeight:500}}>{s.name}</div>
                      <div style={{fontSize:12,color:'var(--text-muted)'}}>{s.sub}</div>
                    </div>
                    <div style={{display:'flex',gap:7}}>
                      <Btn variant="secondary" size="sm">Edit</Btn>
                      <Btn variant="danger" size="sm" onClick={()=>removeService(s.id)}>Remove</Btn>
                    </div>
                  </div>
                ))}
              </div>
              <Btn variant="secondary" onClick={()=>setServices(p=>[...p,{id:Date.now(),name:'New Service',sub:'Add price & duration'}])}>
                + Add service
              </Btn>
            </Card>
          )}

          {/* ── Notifications ── */}
          {active==='Notifications'&&(
            <Card>
              <div className="settings-section-title">Notifications</div>
              {notifs.map(n=>(
                <div key={n.id} className="settings-row">
                  <div>
                    <div className="settings-row-title">{n.title}</div>
                    <div className="settings-row-sub">{n.sub}</div>
                  </div>
                  <Toggle on={n.on} onClick={()=>toggleNotif(n.id)}/>
                </div>
              ))}
              <div style={{marginTop:16,padding:'12px 14px',background:'var(--bg)',borderRadius:9,border:'1px solid var(--border)'}}>
                <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.6}}>
                  📧 <strong>Email notifications</strong> — coming soon. You'll be able to receive booking alerts to your inbox when the backend is connected.
                </div>
              </div>
            </Card>
          )}

          {/* ── Account ── */}
          {active==='Account'&&(
            <Card>
              <div className="settings-section-title">Account Details</div>
              <div style={{display:'flex',flexDirection:'column',gap:13}}>
                <FormGroup label="Full name">
                  <input className="form-input" defaultValue="Sarah Mitchell"/>
                </FormGroup>
                <FormGroup label="Email address">
                  <input className="form-input" type="email" defaultValue="sarah@glamstudio.co.uk"/>
                </FormGroup>
                <FormGroup label="Change password">
                  <input className="form-input" type="password" placeholder="New password"/>
                </FormGroup>
                <div style={{display:'flex',gap:9}}>
                  <Btn variant="primary">Save changes</Btn>
                  <Btn variant="danger" onClick={()=>navigate('/haven')}>Sign out</Btn>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  )
}
