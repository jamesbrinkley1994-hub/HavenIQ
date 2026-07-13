import { useState, useRef, useEffect } from 'react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_HEADERS = ['S','M','T','W','T','F','S']
const FULL_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function pad(n) { return String(n).padStart(2, '0') }
function toISO(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}` }
function todayISO() {
  const d = new Date()
  return toISO(d.getFullYear(), d.getMonth(), d.getDate())
}

// Is this specific date bookable, based on the business's working hours?
// Defaults to closed if there's no matching or open day config (safe default).
function isDayOpen(dateStr, workingHours) {
  if (!workingHours || !workingHours.length) return false
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d)) return false
  const dayConfig = workingHours.find(h => h.day === FULL_DAYS[d.getDay()])
  return !!dayConfig?.open
}

/**
 * Custom calendar date picker.
 * - value / onChange use plain 'yyyy-mm-dd' strings, same as a native date input.
 * - Days the business is closed on (per workingHours) render grayed-out and disabled.
 * - Past dates are always disabled.
 */
export default function DatePicker({ value, onChange, workingHours, error }) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    const base = value ? new Date(value + 'T00:00:00') : new Date()
    return isNaN(base) ? new Date() : base
  })
  const wrapRef = useRef()

  useEffect(() => {
    const onClickOutside = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay()
  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const today = todayISO()

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const changeMonth = delta => setViewDate(new Date(year, month + delta, 1))

  const displayLabel = value
    ? (() => {
        const d = new Date(value + 'T00:00:00')
        return isNaN(d) ? value : `${FULL_DAYS[d.getDay()].slice(0,3)} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`
      })()
    : ''

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      <button
        type="button"
        className={`form-input${error ? ' error' : ''}`}
        onClick={() => setOpen(o => !o)}
        style={{ textAlign:'left', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}
      >
        <span style={{ color: value ? 'var(--text)' : 'var(--text-light)' }}>{displayLabel || 'Select a date...'}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color:'var(--text-muted)', flexShrink:0 }}>
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, zIndex:20,
          background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
          boxShadow:'0 12px 32px rgba(0,0,0,0.14)', padding:14, width:280,
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <button type="button" onClick={() => changeMonth(-1)} style={{ background:'none', border:'none', cursor:'pointer', padding:6, color:'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style={{ fontSize:13, fontWeight:700 }}>{MONTHS[month]} {year}</span>
            <button type="button" onClick={() => changeMonth(1)} style={{ background:'none', border:'none', cursor:'pointer', padding:6, color:'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
            {DAY_HEADERS.map((d,i) => (
              <div key={i} style={{ fontSize:10.5, fontWeight:700, color:'var(--text-light)', textAlign:'center', padding:'4px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
            {cells.map((d, i) => {
              if (d === null) return <div key={i}/>
              const dateStr = toISO(year, month, d)
              const isPast   = dateStr < today
              const dayOpen  = isDayOpen(dateStr, workingHours)
              const disabled = isPast || !dayOpen
              const selected = value === dateStr
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => { onChange(dateStr); setOpen(false) }}
                  title={disabled && !isPast ? 'Closed on this day' : undefined}
                  style={{
                    aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12.5, borderRadius:8, border:'none', fontFamily:'inherit',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: selected ? 'var(--primary)' : 'transparent',
                    color: selected ? '#fff' : disabled ? 'var(--text-light)' : 'var(--text)',
                    opacity: disabled ? 0.45 : 1,
                    fontWeight: selected ? 700 : 400,
                  }}
                  onMouseEnter={e => { if (!disabled && !selected) e.currentTarget.style.background = 'var(--bg)' }}
                  onMouseLeave={e => { if (!disabled && !selected) e.currentTarget.style.background = 'transparent' }}
                >
                  {d}
                </button>
              )
            })}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)' }}>
            <span style={{ width:9, height:9, borderRadius:3, background:'var(--bg)', border:'1px solid var(--border)', opacity:0.6 }}/>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>Grayed out days are closed</span>
          </div>
        </div>
      )}
    </div>
  )
}
