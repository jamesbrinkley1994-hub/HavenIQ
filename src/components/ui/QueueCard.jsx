import { Badge } from '../ui'

const CONTACT_ICONS = {
  email:     { icon:'📧', label:'Email',              color:'#3B82F6' },
  whatsapp:  { icon:'💬', label:'WhatsApp',           color:'#25D366' },
  facebook:  { icon:'📘', label:'Facebook Messenger', color:'#1877F2' },
  instagram: { icon:'📸', label:'Instagram DM',       color:'#E1306C' },
  phone:     { icon:'📞', label:'Phone call',         color:'#10B981' },
  sms:       { icon:'💬', label:'Text message',       color:'#6C63FF' },
}

export function QueueCard({ avatar, name, email, phone, badge, badgeVariant,
  details, message, missingInfo, aiSuggest, actions, avatarStyle, notes,
  attachedFile, contactMethod }) {

  const contact = CONTACT_ICONS[contactMethod] || CONTACT_ICONS.email

  return (
    <div className="queue-card">
      {/* Header */}
      <div className="queue-card-header">
        <div className="queue-customer">
          <div className="queue-avatar" style={avatarStyle}>{avatar}</div>
          <div>
            <div className="queue-name">{name}</div>
            <div className="queue-email">{email}{phone ? ` · ${phone}` : ''}</div>
          </div>
        </div>
        <Badge variant={badgeVariant}>{badge}</Badge>
      </div>

      {/* Missing info */}
      {missingInfo && (
        <div className="missing-box">
          <div className="missing-title">⚠ Missing information</div>
          <div className="missing-items">{missingInfo}</div>
        </div>
      )}

      {/* Details grid */}
      {details && (
        <div className="queue-details">
          {details.map(([label, value]) => (
            <div key={label}>
              <div className="queue-detail-label">{label}</div>
              <div className="queue-detail-value">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Customer message */}
      {message && (
        <div className="queue-message">"{message}"</div>
      )}

      {/* Notes */}
      {notes && (
        <div style={{
          fontSize:12.5, color:'var(--text-muted)', padding:'8px 10px',
          background:'var(--bg)', borderRadius:7, marginBottom:8,
          borderLeft:'3px solid var(--border)',
        }}>
          <span style={{fontWeight:600,color:'var(--text-muted)',fontSize:11,textTransform:'uppercase',letterSpacing:'0.04em'}}>Note · </span>
          {notes}
        </div>
      )}

      {/* Attached file / image */}
      {attachedFile && (
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'8px 10px', background:'var(--primary-tint)',
          border:'1px solid #C4BFFF', borderRadius:8, marginBottom:8,
        }}>
          {attachedFile.preview
            ? <img src={attachedFile.preview} alt="ref"
                style={{width:40,height:40,borderRadius:5,objectFit:'cover',flexShrink:0}}/>
            : <div style={{width:40,height:40,background:'#fff',borderRadius:5,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📄</div>
          }
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--primary)'}}>Reference image attached</div>
            <div style={{fontSize:11.5,color:'var(--text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:180}}>{attachedFile.name}</div>
          </div>
          {attachedFile.preview && (
            <a href={attachedFile.preview} download={attachedFile.name}
              style={{fontSize:11.5,fontWeight:600,color:'#fff',textDecoration:'none',
                padding:'4px 9px',border:'1px solid var(--primary)',borderRadius:6,
                background:'var(--primary)',flexShrink:0}}>
              ⬇ Save
            </a>
          )}
        </div>
      )}

      {/* Contact customer panel */}
      {(email || phone) && (
        <div style={{
          padding:'10px 12px', background:'var(--bg)',
          border:'1px solid var(--border)', borderRadius:8,
          marginBottom:8, display:'flex', alignItems:'center',
          justifyContent:'space-between', gap:10, flexWrap:'wrap',
        }}>
          <div>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',
              letterSpacing:'0.05em',color:'var(--text-muted)',marginBottom:5}}>
              Contact customer
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
              {email && (
                <a href={`mailto:${email}`} style={{
                  fontSize:12.5,color:'var(--primary)',textDecoration:'none',
                  display:'flex',alignItems:'center',gap:4,fontWeight:500,
                }}>
                  📧 {email}
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} style={{
                  fontSize:12.5,color:'var(--text)',textDecoration:'none',
                  display:'flex',alignItems:'center',gap:4,fontWeight:500,
                }}>
                  📞 {phone}
                </a>
              )}
            </div>
          </div>
          {/* Preferred contact method */}
          <div style={{
            display:'flex',alignItems:'center',gap:6,
            padding:'5px 10px',borderRadius:20,
            background:`${contact.color}15`,
            border:`1px solid ${contact.color}40`,
            flexShrink:0,
          }}>
            <span style={{fontSize:14}}>{contact.icon}</span>
            <span style={{fontSize:12,fontWeight:600,color:contact.color}}>
              Prefers {contact.label}
            </span>
          </div>
        </div>
      )}

      {/* AI Suggest */}
      {aiSuggest && (
        <div className="ai-suggest-box">
          <div className="ai-suggest-label">✦ AI Suggested Reply</div>
          {aiSuggest}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="queue-actions">
          {actions}
        </div>
      )}
    </div>
  )
}
