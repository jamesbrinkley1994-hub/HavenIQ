import { useState } from 'react'
import { useStore } from '../../store'
import { supabase } from '../../supabase'
import AppShell from '../../components/layout/AppShell'
import { Btn, Card } from '../../components/ui'

const TYPES = [
  { id:'bug',     label:'🐛 Bug report',       desc:'Something isn\'t working as expected' },
  { id:'feature', label:'💡 Feature request',  desc:'Something you\'d like to see added' },
  { id:'general', label:'💬 General feedback', desc:'Anything else on your mind' },
]

export default function Feedback() {
  const { business, user, showToast } = useStore()
  const [type,      setType]      = useState('general')
  const [message,   setMessage]   = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [sending,   setSending]   = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async () => {
    if (!message.trim()) { setError('Please enter your feedback before sending.'); return }
    setSending(true)
    setError('')
    try {
      // Save to Supabase
      await supabase.from('feedback').insert({
        business_id:   business?.id || null,
        business_name: business?.name || 'Unknown',
        user_email:    user?.email || '',
        type,
        message:       message.trim(),
      })

      // Email notification to HavenIQ
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          type: 'feedback',
          feedback: {
            type,
            message: message.trim(),
            business_name: business?.name || 'Unknown',
            user_email:    user?.email || '',
          },
        }),
      })
      if (!res.ok) {
        // Feedback is still saved in Supabase either way — this only means
        // the email notification to the team didn't go out.
        setError('Feedback saved, but the notification email failed to send. The team may not see it right away.')
        setSending(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('Failed to send feedback. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (submitted) return (
    <AppShell title="Feedback">
      <div style={{maxWidth:560,margin:'0 auto',textAlign:'center',padding:'60px 20px'}}>
        <div style={{fontSize:48,marginBottom:16}}>🙏</div>
        <h2 style={{fontSize:20,fontWeight:700,marginBottom:8}}>Thank you!</h2>
        <p style={{fontSize:14,color:'var(--text-muted)',lineHeight:1.7,marginBottom:24}}>
          Your feedback has been sent to the HavenIQ team. We read every single submission and use it to make the product better.
        </p>
        <Btn variant="secondary" onClick={() => { setSubmitted(false); setMessage(''); setType('general') }}>
          Send more feedback
        </Btn>
      </div>
    </AppShell>
  )

  return (
    <AppShell title="Feedback">
      <div className="page-header">
        <div>
          <h1>Feedback</h1>
          <p>Help us improve HavenIQ — every report and idea goes directly to the team.</p>
        </div>
      </div>

      <div style={{maxWidth:600}}>
        <Card>
          {/* Type selector */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>What type of feedback is this?</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)} style={{
                  display:'flex',alignItems:'center',gap:12,padding:'11px 14px',
                  border:`1.5px solid ${type===t.id?'var(--primary)':'var(--border)'}`,
                  borderRadius:10,background:type===t.id?'var(--primary-tint)':'var(--surface)',
                  cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'all .12s',
                }}>
                  <div style={{fontSize:18,flexShrink:0}}>{t.label.split(' ')[0]}</div>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:type===t.id?600:500,color:type===t.id?'var(--primary)':'var(--text)'}}>
                      {t.label.split(' ').slice(1).join(' ')}
                    </div>
                    <div style={{fontSize:12,color:'var(--text-muted)',marginTop:1}}>{t.desc}</div>
                  </div>
                  {type===t.id && (
                    <div style={{marginLeft:'auto',width:18,height:18,borderRadius:'50%',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div style={{marginBottom:16}}>
            <label style={{fontSize:13,fontWeight:600,display:'block',marginBottom:8}}>
              {type==='bug'     ? 'Describe the bug — what happened and how to reproduce it' :
               type==='feature' ? 'Describe the feature — what it is and why it would help' :
               'Your feedback'}
            </label>
            <textarea
              style={{
                width:'100%',minHeight:120,padding:'10px 12px',
                border:`1.5px solid ${error?'var(--danger)':'var(--border)'}`,
                borderRadius:9,fontSize:13.5,fontFamily:'inherit',
                resize:'vertical',background:'var(--surface)',color:'var(--text)',
                outline:'none',boxSizing:'border-box',lineHeight:1.6,
              }}
              placeholder={
                type==='bug'     ? 'e.g. When I click Approve on a booking, the card doesn\'t move to the Confirmed tab...' :
                type==='feature' ? 'e.g. It would be really useful to be able to set different time slots for different services...' :
                'Share your thoughts...'
              }
              value={message}
              onChange={e => { setMessage(e.target.value); setError('') }}
            />
            {error && <div style={{fontSize:12,color:'var(--danger)',marginTop:4}}>⚠ {error}</div>}
          </div>

          {/* From */}
          <div style={{
            padding:'10px 12px',background:'var(--bg)',borderRadius:8,
            fontSize:12,color:'var(--text-muted)',marginBottom:16,
          }}>
            Sending as <strong>{business?.name || 'your business'}</strong> · {user?.email}
          </div>

          <Btn variant="primary" onClick={handleSubmit}>
            {sending ? 'Sending...' : 'Send feedback'}
          </Btn>
        </Card>

        {/* Note */}
        <div style={{
          marginTop:16,padding:'12px 16px',background:'var(--bg)',
          borderRadius:10,border:'1px solid var(--border)',
          fontSize:12.5,color:'var(--text-muted)',lineHeight:1.65,
        }}>
          💬 <strong>We read everything.</strong> Feedback goes directly to the HavenIQ team. We may follow up via your registered email if we need more detail. Thank you for helping us build a better product.
        </div>
      </div>
    </AppShell>
  )
}
