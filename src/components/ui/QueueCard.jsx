import { Badge, Btn } from '../ui'

export function QueueCard({ avatar, name, email, badge, badgeVariant, details, message, missingInfo, aiSuggest, actions, avatarStyle }) {
  return (
    <div className="queue-card">
      {/* Header */}
      <div className="queue-card-header">
        <div className="queue-customer">
          <div className="queue-avatar" style={avatarStyle}>{avatar}</div>
          <div>
            <div className="queue-name">{name}</div>
            <div className="queue-email">{email}</div>
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
      {message && <div className="queue-message">"{message}"</div>}

      {/* AI Suggest */}
      {aiSuggest && (
        <div className="ai-suggest-box">
          <div className="ai-suggest-label">✦ AI Suggested Reply</div>
          {aiSuggest}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="queue-actions" style={{ marginTop: aiSuggest ? 8 : 0 }}>
          {actions}
        </div>
      )}
    </div>
  )
}
