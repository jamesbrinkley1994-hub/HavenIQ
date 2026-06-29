// Shared primitives used across all pages

export function Badge({ variant = 'neutral', children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

export function Btn({ variant = 'secondary', size, full, onClick, children, type = 'button', style }) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size ? `btn-${size}` : '',
    full ? 'btn-full' : '',
  ].filter(Boolean).join(' ')
  return <button type={type} className={cls} onClick={onClick} style={style}>{children}</button>
}

export function FormGroup({ label, children }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {children}
    </div>
  )
}

export function Card({ children, style, className = '' }) {
  return <div className={`card ${className}`} style={style}>{children}</div>
}

export function AiChip({ label = 'AI Active' }) {
  return <span className="ai-chip">✦ {label}</span>
}

export function Toggle({ on, onClick }) {
  return <button className={`toggle${on ? ' on' : ''}`} onClick={onClick} aria-pressed={on} />
}

export function LogoMark({ size = 28 }) {
  return (
    <div
      className="sidebar-logo-mark"
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
    >
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none"
        stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </div>
  )
}

export function HouseIcon({ size = 15, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
