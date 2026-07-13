import { useState, useEffect } from 'react'
import { useStore } from '../../store'
import { supabase } from '../../supabase'
import AppShell from '../../components/layout/AppShell'
import { AiChip, Btn } from '../../components/ui'

// ── Info categories (knowledge base) ─────────────────────
const INFO_CATEGORIES = [
  { id:'booking',      label:'Booking Policy',      icon:CalIcon },
  { id:'cancellation', label:'Cancellation Policy', icon:ClockIcon },
  { id:'deposit',      label:'Deposit Policy',      icon:CoinIcon },
  { id:'aftercare',    label:'Aftercare Advice',    icon:HeartIcon },
  { id:'location',     label:'Location & Parking',  icon:PinIcon },
]

const OPEN_TIMES  = ['7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','12:00 PM']
const CLOSE_TIMES = ['3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM']
const ALL_DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export default function Knowledge() {
  const { business, showToast } = useStore()

  const [activeCategory, setActiveCategory] = useState('services')
  const [blocks,         setBlocks]         = useState({})
  const [services,       setServices]       = useState([])
  const [hours,          setHours]          = useState(ALL_DAYS.map(day => ({ day, open:false, start:'9:00 AM', end:'5:00 PM' })))
  const [editingId,      setEditingId]      = useState(null)
  const [editValues,     setEditValues]     = useState({})
  const [saving,         setSaving]         = useState(false)
  const [loading,        setLoading]        = useState(true)

  // Load everything from Supabase
  useEffect(() => {
    if (!business?.id) return
    const load = async () => {
      setLoading(true)
      // Load knowledge blocks
      const { data: kbData } = await supabase
        .from('knowledge_blocks')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at')

      const grouped = {}
      INFO_CATEGORIES.forEach(c => { grouped[c.id] = [] })
      ;(kbData || []).forEach(row => {
        if (!grouped[row.category]) grouped[row.category] = []
        grouped[row.category].push({ id: row.id, label: row.label || '', content: row.content || '' })
      })
      setBlocks(grouped)

      // Load services and hours from business_settings
      const { data: settings } = await supabase
        .from('business_settings')
        .select('services, working_hours')
        .eq('business_id', business.id)
        .single()

      if (settings?.services?.length)      setServices(settings.services)
      if (settings?.working_hours?.length) setHours(settings.working_hours)
      setLoading(false)
    }
    load()
  }, [business?.id])

  // ── Knowledge block actions ───────────────────────────────
  const addBlock = async (catId) => {
    if (!business?.id) return
    const { data } = await supabase.from('knowledge_blocks').insert({
      business_id: business.id, category: catId, label: 'New entry', content: '',
    }).select().single()
    if (data) setBlocks(prev => ({ ...prev, [catId]: [...(prev[catId]||[]), { id:data.id, label:data.label, content:data.content }] }))
  }

  const updateBlock = (catId, blockId, field, value) => {
    setBlocks(prev => ({
      ...prev,
      [catId]: prev[catId].map(b => b.id === blockId ? { ...b, [field]: value } : b),
    }))
  }

  const deleteBlock = async (catId, blockId) => {
    await supabase.from('knowledge_blocks').delete().eq('id', blockId)
    setBlocks(prev => ({ ...prev, [catId]: prev[catId].filter(b => b.id !== blockId) }))
    showToast('Block removed')
  }

  const saveBlocks = async (catId) => {
    setSaving(true)
    const catBlocks = blocks[catId] || []
    for (const b of catBlocks) {
      await supabase.from('knowledge_blocks').update({ label: b.label, content: b.content }).eq('id', b.id)
    }
    setSaving(false)
    showToast('Saved ✓')
  }

  // ── Service actions ───────────────────────────────────────
  const addService    = () => setServices(prev => [...prev, { id: Date.now(), name:'', price:'', duration:'' }])
  const removeService = async (id) => {
    setServices(prev => prev.filter(s => s.id !== id))
    await saveSettings({ services: services.filter(s => s.id !== id) })
  }
  const startEdit = (s) => { setEditingId(s.id); setEditValues({ name:s.name, price:s.price||'', duration:s.duration||'' }) }
  const saveEdit  = async (id) => {
    const updated = services.map(s => s.id === id ? { ...s, ...editValues } : s)
    setServices(updated)
    setEditingId(null)
    await saveSettings({ services: updated })
  }

  // ── Hours actions ─────────────────────────────────────────
  const toggleDay  = (day) => setHours(prev => prev.map(h => h.day===day ? {...h,open:!h.open} : h))
  const updateHour = (day, field, value) => setHours(prev => prev.map(h => h.day===day ? {...h,[field]:value} : h))

  // ── Save settings to Supabase ─────────────────────────────
  const saveSettings = async (overrides = {}) => {
    if (!business?.id) return
    setSaving(true)
    const payload = { services, working_hours: hours, ...overrides }
    await supabase.from('business_settings').upsert({
      business_id: business.id,
      services:      payload.services,
      working_hours: payload.working_hours,
      updated_at:    new Date().toISOString(),
    }, { onConflict: 'business_id' })
    setSaving(false)
    showToast('Saved ✓')
  }

  const currentBlocks = blocks[activeCategory] || []
  const catLabel = INFO_CATEGORIES.find(c => c.id === activeCategory)?.label

  if (loading) return (
    <AppShell title="Business Knowledge">
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:200,color:'var(--text-muted)',fontSize:13}}>
        Loading...
      </div>
    </AppShell>
  )

  return (
    <AppShell title="Business Knowledge" topbarRight={<AiChip label="Used by AI"/>}>
      <div className="page-header">
        <div>
          <h1>Business Knowledge</h1>
          <p>Manage your services, hours and policies. This information powers your booking page and AI responses.</p>
        </div>
      </div>

      <div className="kb-grid">
        {/* ── Left nav ── */}
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          {/* Services */}
          <button className={`kb-category${activeCategory==='services'?' active':''}`} onClick={() => setActiveCategory('services')}>
            <ScissorsIcon/> Services Offered
          </button>
          {/* Hours */}
          <button className={`kb-category${activeCategory==='hours'?' active':''}`} onClick={() => setActiveCategory('hours')}>
            <ClockIcon/> Working Hours
          </button>
          {/* Divider */}
          <div style={{height:1,background:'var(--border)',margin:'6px 0'}}/>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-light)',padding:'0 10px 4px'}}>Policies & Info</div>
          {INFO_CATEGORIES.map(cat => (
            <button key={cat.id} className={`kb-category${activeCategory===cat.id?' active':''}`} onClick={() => setActiveCategory(cat.id)}>
              <cat.icon/> {cat.label}
            </button>
          ))}
        </div>

        {/* ── Right panel ── */}
        <div className="kb-editor">

          {/* ═══ SERVICES ═══ */}
          {activeCategory === 'services' && (
            <>
              <div className="kb-editor-header">
                <div>
                  <div className="kb-editor-title">Services Offered</div>
                  <div style={{fontSize:11.5,color:'var(--text-muted)',marginTop:2}}>These appear on your public booking page</div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <Btn variant="secondary" size="sm" onClick={addService}>+ Add</Btn>
                  <Btn variant="primary" size="sm" onClick={() => saveSettings()}>{saving?'Saving...':'Save'}</Btn>
                </div>
              </div>
              <div className="kb-editor-body">
                {services.length === 0 ? (
                  <div style={{textAlign:'center',padding:'32px 20px',color:'var(--text-muted)'}}>
                    <div style={{fontSize:28,marginBottom:10}}>✂️</div>
                    <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>No services added yet</div>
                    <div style={{fontSize:13,marginBottom:20,lineHeight:1.6}}>Add the services you offer so customers can select them when booking.</div>
                    <Btn variant="secondary" onClick={addService}>+ Add your first service</Btn>
                  </div>
                ) : services.map(s => (
                  <div key={s.id} style={{padding:12,border:'1px solid var(--border)',borderRadius:9,marginBottom:9}}>
                    {editingId === s.id ? (
                      <div style={{display:'flex',flexDirection:'column',gap:9}}>
                        <input className="form-input" placeholder="Service name"
                          value={editValues.name} onChange={e => setEditValues(p=>({...p,name:e.target.value}))}/>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
                          <input className="form-input" placeholder="Price (e.g. From £35)"
                            value={editValues.price} onChange={e => setEditValues(p=>({...p,price:e.target.value}))}/>
                          <input className="form-input" placeholder="Duration (e.g. 60 min)"
                            value={editValues.duration} onChange={e => setEditValues(p=>({...p,duration:e.target.value}))}/>
                        </div>
                        <div style={{display:'flex',gap:8}}>
                          <Btn variant="primary" size="sm" onClick={() => saveEdit(s.id)}>Save</Btn>
                          <Btn variant="secondary" size="sm" onClick={() => setEditingId(null)}>Cancel</Btn>
                          <Btn variant="danger" size="sm" onClick={() => removeService(s.id)}>Delete</Btn>
                        </div>
                      </div>
                    ) : (
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div>
                          <div style={{fontSize:13.5,fontWeight:500}}>{s.name||<span style={{color:'var(--text-light)'}}>Unnamed service</span>}</div>
                          <div style={{fontSize:12,color:'var(--text-muted)'}}>{[s.price,s.duration].filter(Boolean).join(' · ')||'No price or duration set'}</div>
                        </div>
                        <div style={{display:'flex',gap:7}}>
                          <Btn variant="secondary" size="sm" onClick={() => startEdit(s)}>Edit</Btn>
                          <Btn variant="danger" size="sm" onClick={() => removeService(s.id)}>Remove</Btn>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ WORKING HOURS ═══ */}
          {activeCategory === 'hours' && (
            <>
              <div className="kb-editor-header">
                <div>
                  <div className="kb-editor-title">Working Hours</div>
                  <div style={{fontSize:11.5,color:'var(--text-muted)',marginTop:2}}>Toggle days on to set your availability</div>
                </div>
                <Btn variant="primary" size="sm" onClick={() => saveSettings()}>{saving?'Saving...':'Save'}</Btn>
              </div>
              <div className="kb-editor-body">
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {hours.map(h => (
                    <div key={h.day} style={{display:'grid',gridTemplateColumns:'110px auto 1fr 1fr',gap:10,alignItems:'center',opacity:h.open?1:0.5}}>
                      <span style={{fontSize:13,fontWeight:500}}>{h.day}</span>
                      <button className={`toggle${h.open?' on':''}`} onClick={() => toggleDay(h.day)}/>
                      <select className="form-input" disabled={!h.open} value={h.start} onChange={e => updateHour(h.day,'start',e.target.value)}>
                        {OPEN_TIMES.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <select className="form-input" disabled={!h.open} value={h.end} onChange={e => updateHour(h.day,'end',e.target.value)}>
                        {CLOSE_TIMES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══ INFO / POLICY CATEGORIES ═══ */}
          {INFO_CATEGORIES.some(c => c.id === activeCategory) && (
            <>
              <div className="kb-editor-header">
                <div>
                  <div className="kb-editor-title">{catLabel}</div>
                  <div style={{fontSize:11.5,color:'var(--text-muted)',marginTop:2}}>
                    {currentBlocks.length} block{currentBlocks.length!==1?'s':''}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <Btn variant="secondary" size="sm" onClick={() => addBlock(activeCategory)}>+ Add</Btn>
                  <Btn variant="primary" size="sm" onClick={() => saveBlocks(activeCategory)}>{saving?'Saving...':'Save'}</Btn>
                </div>
              </div>
              <div className="kb-editor-body">
                {currentBlocks.length === 0 ? (
                  <div style={{textAlign:'center',padding:'40px 20px',color:'var(--text-muted)'}}>
                    <div style={{fontSize:28,marginBottom:12}}>📝</div>
                    <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Nothing here yet</div>
                    <div style={{fontSize:13,lineHeight:1.6,maxWidth:320,margin:'0 auto 20px'}}>
                      Add information about your {catLabel?.toLowerCase()} here.
                    </div>
                    <button className="kb-add-btn" style={{maxWidth:240,margin:'0 auto'}} onClick={() => addBlock(activeCategory)}>
                      + Add your first block
                    </button>
                  </div>
                ) : (
                  <>
                    {currentBlocks.map(block => (
                      <div key={block.id} className="kb-block">
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                          <input
                            style={{fontSize:10.5,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-light)',background:'none',border:'none',outline:'none',width:'100%',fontFamily:'inherit'}}
                            value={block.label}
                            onChange={e => updateBlock(activeCategory, block.id, 'label', e.target.value)}
                            placeholder="Label..."
                          />
                          <button
                            onClick={() => deleteBlock(activeCategory, block.id)}
                            style={{background:'none',border:'none',cursor:'pointer',color:'var(--danger)',fontSize:14,padding:'0 4px',flexShrink:0,opacity:0.7}}
                            title="Remove block"
                          >✕</button>
                        </div>
                        <div
                          className="kb-block-content"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={e => updateBlock(activeCategory, block.id, 'content', e.target.innerText)}
                        >
                          {block.content}
                        </div>
                      </div>
                    ))}
                    <button className="kb-add-btn" onClick={() => addBlock(activeCategory)}>+ Add block</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function ScissorsIcon(){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> }
function CalIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function ClockIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
function CoinIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2m-4-6h8"/></svg> }
function HeartIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> }
function PinIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> }
