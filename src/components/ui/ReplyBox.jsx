import { useState } from 'react'
import { Btn } from '../ui'

export function ReplyBox({ id, type, customerEmail, customerName, onSend, onCancel }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!text.trim()) return
    setSending(true)
    await onSend(id, type, text, customerEmail, customerName)
    setSending(false)
  }

  return (
    <div style={{
      marginTop:10, padding:'12px 14px',
      background:'var(--primary-tint)', border:'1px solid #C4BFFF',
      borderRadius:10,
    }}>
      <div style={{fontSize:12,fontWeight:700,color:'var(--primary)',marginBottom:8}}>
        ✉ Reply to {customerName}
        {customerEmail && <span style={{fontWeight:400,color:'var(--text-muted)',marginLeft:6}}>({customerEmail})</span>}
      </div>
      <textarea
        style={{
          width:'100%', minHeight:80, padding:'9px 11px',
          border:'1.5px solid var(--border)', borderRadius:8,
          fontSize:13, fontFamily:'inherit', resize:'vertical',
          background:'var(--surface)', color:'var(--text)',
          boxSizing:'border-box', outline:'none',
        }}
        placeholder={`Type your reply to ${customerName}...`}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <div style={{display:'flex',gap:8,marginTop:9}}>
        <Btn variant="primary" size="sm" onClick={handleSend}>
          {sending ? 'Sending...' : 'Send reply'}
        </Btn>
        <Btn variant="secondary" size="sm" onClick={onCancel}>Cancel</Btn>
      </div>
      <div style={{fontSize:11,color:'var(--text-muted)',marginTop:7}}>
        This will send an email directly to the customer.
      </div>
    </div>
  )
}
