import { Badge, Btn } from '../ui'

export function QueueCard({ avatar, name, email, phone, badge, badgeVariant,
  details, message, missingInfo, aiSuggest, actions, avatarStyle, notes, attachedFile }) {
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
            ? <img src={attachedFile.preview} alt="ref" style={{width:40,height:40,borderRadius:5,objectFit:'cover',flexShrink:0,cursor:'pointer'}}
                onClick={() => window.open(attachedFile.preview, '_blank')}/>
            : <div style={{width:40,height:40,background:'#fff',borderRadius:5,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📄</div>
          }
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--primary)'}}>Reference image attached</div>
            <div style={{fontSize:11.5,color:'var(--text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:180}}>{attachedFile.name}</div>
          </div>
          <div style={{display:'flex',gap:6,flexShrink:0}}>
            {attachedFile.preview && (
              <a href={attachedFile.preview} download={attachedFile.name}
                style={{fontSize:11.5,fontWeight:600,color:'#fff',textDecoration:'none',
                  padding:'4px 9px',border:'1px solid var(--primary)',borderRadius:6,background:'var(--primary)'}}>
                ⬇ Save
              </a>
            )}
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
        <div className="queue-actions" style={{ marginTop: aiSuggest || attachedFile ? 8 : 0 }}>
          {actions}
        </div>
      )}
    </div>
  )
}
