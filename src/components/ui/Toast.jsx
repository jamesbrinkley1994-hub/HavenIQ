import { useStore } from '../../store'

const STYLES = {
  success: { background: 'var(--success)',     color: '#fff' },
  warning: { background: 'var(--warning)',     color: '#fff' },
  danger:  { background: 'var(--danger)',      color: '#fff' },
  neutral: { background: 'var(--sidebar-bg)', color: '#fff' },
  primary: { background: 'var(--primary)',     color: '#fff' },
}

export default function Toast() {
  const { toast } = useStore()
  if (!toast) return null

  const style = STYLES[toast.variant] || STYLES.success

  return (
    <div style={{
      position: 'fixed', bottom: 72, right: 24, zIndex: 10000,
      padding: '11px 18px',
      borderRadius: 10,
      fontSize: 13, fontWeight: 600,
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'slideUp 0.2s ease',
      ...style,
    }}>
      <span style={{ fontSize: 15 }}>
        {toast.variant === 'warning' ? '⚠' : toast.variant === 'danger' ? '✕' : '✓'}
      </span>
      {toast.message}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
