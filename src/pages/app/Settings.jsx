import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { supabase } from '../../supabase'
import AppShell from '../../components/layout/AppShell'
import { Btn, FormGroup, Toggle, Card } from '../../components/ui'

const PANELS = ['Business','Booking Link','Notifications','Account']

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}
const ALL_DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const OPEN_TIMES  = ['7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','12:00 PM']
const CLOSE_TIMES = ['3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM']

const INITIAL_HOURS = ALL_DAYS.map(day => ({ day, open:false, start:'9:00 AM', end:'5:00 PM' }))
const INITIAL_NOTIFS = [
  { id:'booking',   title:'New booking request',  sub:'Get notified when a customer submits a booking', on:true },
  { id:'complaint', title:'New complaint',         sub:'Get notified of incoming complaints immediately', on:true },
  { id:'quote',     title:'New quote request',     sub:'Get notified when someone requests a quote', on:true },
  { id:'missing',   title:'Missing info flagged',  sub:'AI detected an incomplete enquiry', on:true },
  { id:'summary',   title:'Daily summary email',   sub:'Receive a morning digest of all activity', on:false },
]

export default function Settings() {
  const navigate = useNavigate()
  const { business, user, signOut, updateBusiness, showToast } = useStore()

  const [active,      setActive]      = useState('Business')
  const [notifs,      setNotifs]      = useState(INITIAL_NOTIFS)
  const [services,    setServices]    = useState([])
  const [hours,       setHours]       = useState(INITIAL_HOURS)
  const [linkCopied,  setLinkCopied]  = useState(false)
  const [bizForm,     setBizForm]     = useState({ name:'', type:'', email:'', phone:'' })
  const [savingBiz,   setSavingBiz]   = useState(false)
  const [showDeposit,  setShowDeposit]  = useState(true)

  // Load business settings from Supabase
  useEffect(() => {
    if (business) {
      setBizForm({ name:business.name||'', type:business.type||'', email:business.email||'', phone:business.phone||'' })
      // Load settings
      supabase.from('business_settings').select('*').eq('business_id', business.id).single()
        .then(({ data }) => {
          if (data) {
            if (data.services?.length)      setServices(data.services)
            if (data.working_hours?.length) setHours(data.working_hours)
            if (data.notifications)         setNotifs(prev => prev.map(n => ({ ...n, on: data.notifications[n.id] ?? n.on })))
            if (data.show_deposit !== undefined) setShowDeposit(data.show_deposit)
          }
        })
    }
  }, [business])

  const saveBusiness = async () => {
    setSavingBiz(true)
    const slug = slugify(bizForm.name || '')
    await updateBusiness({ ...bizForm, slug: slug || undefined })
    setSavingBiz(false)
  }

  const saveSettings = async () => {
    if (!business) return
    const notifObj = notifs.reduce((acc, n) => ({ ...acc, [n.id]: n.on }), {})
    await supabase.from('business_settings').upsert({
      business_id: business.id,
      services, working_hours: hours, notifications: notifObj,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'business_id' })
    showToast('Settings saved')
  }

  const toggleNotif = id => setNotifs(prev => prev.map(n => n.id===id ? {...n,on:!n.on} : n))
  const toggleDay   = day => setHours(prev => prev.map(h => h.day===day ? {...h,open:!h.open} : h))
  const updateHour  = (day, field, value) => setHours(prev => prev.map(h => h.day===day ? {...h,[field]:value} : h))
  const removeService = id => setServices(prev => prev.filter(s => s.id!==id))
  const addService    = () => setServices(prev => [...prev, { id:Date.now(), name:'', price:'', duration:'' }])
  const startEdit     = s => { setEditingId(s.id); setEditValues({ name:s.name, price:s.price||'', duration:s.duration||'' }) }
  const saveEdit      = id => { setServices(prev => prev.map(s => s.id===id ? {...s,...editValues} : s)); setEditingId(null) }

  const copyLink = () => {
    const url = business?.slug
      ? `${window.location.origin}/haven/book/${business.slug}`
      : `${window.location.origin}/haven/book/demo`
    navigator.clipboard?.writeText(url).catch(()=>{})
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  const bookingUrl = business?.slug
    ? `${window.location.host}/haven/book/${business.slug}`
    : business
    ? `${window.location.host}/haven/book/demo (set a business name to get your unique link)`
    : `${window.location.host}/haven/book/demo`

  const handleSignOut = async () => {
    await signOut()
    navigate('/haven/login')
  }

  return (
    <AppShell title="Settings">
      <div className="page-header">
        <div><h1>Settings</h1><p>Manage your account and business preferences</p></div>
      </div>

      <div className="settings-grid">
        <div style={{display:'flex',flexDirection:'column',gap:2}}>
          {PANELS.map(p => (
            <button key={p} className={`settings-nav-item${active===p?' active':''}`} onClick={() => setActive(p)}>{p}</button>
          ))}
        </div>

        <div>
          {/* ── Business ── */}
          {active==='Business' && (
            <Card>
              <div className="settings-section-title">Business Details</div>
              <div style={{display:'flex',flexDirection:'column',gap:13}}>
                <FormGroup label="Business name">
                  <input className="form-input" placeholder="e.g. Sarah's Nail Studio"
                    value={bizForm.name} onChange={e => setBizForm(p=>({...p,name:e.target.value}))}/>
                </FormGroup>
                <FormGroup label="Business type">
                  <select className="form-input" value={bizForm.type} onChange={e => setBizForm(p=>({...p,type:e.target.value}))}>
                    <option value="">Select your business type...</option>
                    {['Nail Technician','Tattoo Studio','Lash & Brow','Hair Salon','Beauty Therapist','Barbershop','Cleaning Services','Personal Trainer','Photographer','Other'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Business email">
                  <input className="form-input" type="email" placeholder="hello@yourbusiness.co.uk"
                    value={bizForm.email} onChange={e => setBizForm(p=>({...p,email:e.target.value}))}/>
                </FormGroup>
                <FormGroup label="Phone number">
                  <input className="form-input" type="tel" placeholder="07700 000000"
                    value={bizForm.phone} onChange={e => setBizForm(p=>({...p,phone:e.target.value}))}/>
                </FormGroup>
                <Btn variant="primary" style={{width:'fit-content'}} onClick={saveBusiness}>
                  {savingBiz ? 'Saving...' : 'Save changes'}
                </Btn>
              </div>
            </Card>
          )}

          {/* ── Booking Link ── */}
          {active==='Booking Link' && (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <Card>
                <div className="settings-section-title">Your Public Booking Link</div>
                <p style={{fontSize:13.5,color:'var(--text-muted)',lineHeight:1.65,marginBottom:18}}>
                  Share this link with customers so they can request a booking directly. Works on Instagram, Facebook, WhatsApp, and anywhere you have an online presence.
                </p>
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'11px 14px',background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:'var(--radius)',marginBottom:14}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                  </svg>
                  <span style={{flex:1,fontSize:13.5,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bookingUrl}</span>
                </div>
                <div style={{display:'flex',gap:9,flexWrap:'wrap',marginBottom:20}}>
                  <Btn variant="primary" onClick={copyLink}>{linkCopied?'✓ Copied!':'Copy link'}</Btn>
                  <Btn variant="secondary" onClick={() => navigate('/haven/book/demo')}>Open Booking & Enquiry page ↗</Btn>
                </div>
                {/* Deposit notice toggle */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'12px 14px',background:'var(--bg)',border:'1px solid var(--border)',
                  borderRadius:9,marginBottom:16}}>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:600}}>Show deposit notice</div>
                    <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>
                      Display your deposit policy on the booking form
                    </div>
                  </div>
                  <Toggle on={showDeposit} onClick={() => {
                    setShowDeposit(p => !p)
                    supabase.from('business_settings').upsert({
                      business_id: business?.id,
                      show_deposit: !showDeposit,
                      updated_at: new Date().toISOString(),
                    }, { onConflict: 'business_id' })
                    showToast(showDeposit ? 'Deposit notice hidden' : 'Deposit notice shown')
                  }}/>
                </div>

                <div style={{background:'var(--primary-tint)',border:'1px solid #C4BFFF',borderRadius:10,padding:'14px 16px'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--primary)',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.05em'}}>💡 Where to share this link</div>
                  {[
                    {icon:'📸',label:'Instagram',tip:'Add to your bio — tap Edit Profile → Website'},
                    {icon:'📘',label:'Facebook',tip:'Add as a "Book Now" button on your page'},
                    {icon:'💬',label:'WhatsApp',tip:'Pin it to the top of your WhatsApp Business profile'},
                    {icon:'🌐',label:'Website',tip:'Embed as a button or link in your contact page'},
                  ].map(({icon,label,tip})=>(
                    <div key={label} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:8}}>
                      <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
                      <div><span style={{fontSize:13,fontWeight:600}}>{label} — </span><span style={{fontSize:13,color:'var(--text-muted)'}}>{tip}</span></div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <div className="settings-section-title">Booking & Enquiry Page Preview</div>
                <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:14}}>See exactly what your customers see when they visit your Booking & Enquiry page link.</p>
                <Btn variant="secondary" onClick={() => window.open(`${window.location.origin}/haven/book/${business?.slug || 'demo'}`, '_blank')}>Preview Booking & Enquiry page →</Btn>
              </Card>
            </div>
          )}

          {/* ── Working Hours ── */}
          {active==='Working Hours' && (
            <Card>
              <div className="settings-section-title">Working Hours</div>
              <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:16}}>Toggle each day on to set your opening hours.</p>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {hours.map(h=>(
                  <div key={h.day} style={{display:'grid',gridTemplateColumns:'110px auto 1fr 1fr',gap:10,alignItems:'center',opacity:h.open?1:0.5}}>
                    <span style={{fontSize:13,fontWeight:500}}>{h.day}</span>
                    <button className={`toggle${h.open?' on':''}`} onClick={() => toggleDay(h.day)}/>
                    <select className="form-input" disabled={!h.open} value={h.start} onChange={e=>updateHour(h.day,'start',e.target.value)}>
                      {OPEN_TIMES.map(t=><option key={t}>{t}</option>)}
                    </select>
                    <select className="form-input" disabled={!h.open} value={h.end} onChange={e=>updateHour(h.day,'end',e.target.value)}>
                      {CLOSE_TIMES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <Btn variant="primary" style={{marginTop:16,width:'fit-content'}} onClick={saveSettings}>Save hours</Btn>
            </Card>
          )}

          {/* ── Services ── */}
          {active==='Services' && (
            <Card>
              <div className="settings-section-title">Services Offered</div>
              {services.length===0 ? (
                <div style={{textAlign:'center',padding:'32px 20px',color:'var(--text-muted)'}}>
                  <div style={{fontSize:28,marginBottom:10}}>✂️</div>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>No services added yet</div>
                  <div style={{fontSize:13,marginBottom:20,lineHeight:1.6}}>Add the services you offer so customers can select them when booking.</div>
                  <Btn variant="secondary" onClick={addService}>+ Add your first service</Btn>
                </div>
              ) : (
                <>
                  <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:14}}>
                    {services.map(s=>(
                      <div key={s.id} style={{padding:12,border:'1px solid var(--border)',borderRadius:9}}>
                        {editingId===s.id ? (
                          <div style={{display:'flex',flexDirection:'column',gap:9}}>
                            <input className="form-input" placeholder="Service name" value={editValues.name} onChange={e=>setEditValues(p=>({...p,name:e.target.value}))}/>
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
                              <input className="form-input" placeholder="Price (e.g. From £35)" value={editValues.price} onChange={e=>setEditValues(p=>({...p,price:e.target.value}))}/>
                              <input className="form-input" placeholder="Duration (e.g. 60 min)" value={editValues.duration} onChange={e=>setEditValues(p=>({...p,duration:e.target.value}))}/>
                            </div>
                            <div style={{display:'flex',gap:8}}>
                              <Btn variant="primary" size="sm" onClick={()=>saveEdit(s.id)}>Save</Btn>
                              <Btn variant="secondary" size="sm" onClick={()=>setEditingId(null)}>Cancel</Btn>
                              <Btn variant="danger" size="sm" onClick={()=>{removeService(s.id);setEditingId(null)}}>Delete</Btn>
                            </div>
                          </div>
                        ) : (
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                            <div>
                              <div style={{fontSize:13.5,fontWeight:500}}>{s.name||<span style={{color:'var(--text-light)'}}>Unnamed service</span>}</div>
                              <div style={{fontSize:12,color:'var(--text-muted)'}}>{[s.price,s.duration].filter(Boolean).join(' · ')||'No price or duration set'}</div>
                            </div>
                            <div style={{display:'flex',gap:7}}>
                              <Btn variant="secondary" size="sm" onClick={()=>startEdit(s)}>Edit</Btn>
                              <Btn variant="danger" size="sm" onClick={()=>removeService(s.id)}>Remove</Btn>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:9}}>
                    <Btn variant="secondary" onClick={addService}>+ Add service</Btn>
                    <Btn variant="primary" onClick={saveSettings}>Save services</Btn>
                  </div>
                </>
              )}
            </Card>
          )}

          {/* ── Notifications ── */}
          {active==='Notifications' && (
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
                  📧 <strong>Email notifications</strong> — notification emails will be sent to <strong>{user?.email}</strong> when new bookings arrive.
                </div>
              </div>
              <Btn variant="primary" style={{marginTop:14,width:'fit-content'}} onClick={saveSettings}>Save preferences</Btn>
            </Card>
          )}

          {/* ── Account ── */}
          {active==='Account' && (
            <Card>
              <div className="settings-section-title">Account Details</div>
              <div style={{display:'flex',flexDirection:'column',gap:13}}>
                <FormGroup label="Email address">
                  <input className="form-input" type="email" value={user?.email || ''} readOnly style={{background:'var(--bg)',color:'var(--text-muted)'}}/>
                </FormGroup>
                <div style={{padding:'12px 14px',background:'var(--bg)',borderRadius:9,border:'1px solid var(--border)'}}>
                  <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.6}}>
                    To change your password, use the <strong>Forgot password</strong> link on the sign in page.
                  </div>
                </div>
                <div style={{display:'flex',gap:9,paddingTop:4}}>
                  <Btn variant="danger" onClick={handleSignOut}>Sign out</Btn>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  )
}
