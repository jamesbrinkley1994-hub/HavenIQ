import { useState } from 'react'
import { useStore } from '../../store'
import AppShell from '../../components/layout/AppShell'
import { Btn, Badge } from '../../components/ui'

const DOW_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

// Convert JS getDay() (0=Sun) to Mon-first index (0=Mon)
function monFirstDow(jsDay) {
  return (jsDay + 6) % 7
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getMonthOffset(year, month) {
  // Day of week of the 1st, Mon-first
  return monFirstDow(new Date(year, month, 1).getDay())
}

export default function Calendar() {
  const { bookings } = useStore()

  // Start on current real month
  const now = new Date()
  const [viewYear,  setViewYear]  = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [manualDays, setManualDays] = useState({}) // { 'YYYY-M-D': 'blocked'|'available'|null }
  const [mode,       setMode]       = useState(null)
  const [popover,    setPopover]    = useState(null) // { day, bookings[] }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const offset      = getMonthOffset(viewYear, viewMonth)

  // Build booking lookup: { 'YYYY-M-D': [booking, ...] }
  const bookingsByDay = {}
  bookings.forEach((b) => {
    if (!b.calDate) return
    const key = `${b.calDate.month === viewMonth && b.calDate.month !== undefined
      ? viewYear : (b.calDate.month === viewMonth ? viewYear : '__')}-${b.calDate.month}-${b.calDate.day}`
    // Only show if this booking's month matches current view
    if (b.calDate.month !== viewMonth) return
    const k = `${viewYear}-${viewMonth}-${b.calDate.day}`
    if (!bookingsByDay[k]) bookingsByDay[k] = []
    bookingsByDay[k].push(b)
  })

  // Also include bookings from public booking form (no calDate, but try to parse date string)
  bookings.forEach((b) => {
    if (b.calDate) return
    const dateStr = b.details?.find(([l]) => l === 'Date')?.[1]
    if (!dateStr || dateStr === 'TBC' || dateStr === '—') return
    // Try to parse "Wed 1 Jul" style
    const match = dateStr.match(/(\d+)\s+(\w+)/)
    if (!match) return
    const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 }
    const day = parseInt(match[1])
    const month = months[match[2]]
    if (month === undefined || month !== viewMonth) return
    const k = `${viewYear}-${viewMonth}-${day}`
    if (!bookingsByDay[k]) bookingsByDay[k] = []
    bookingsByDay[k].push(b)
  })

  // Navigate months
  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setPopover(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setPopover(null)
  }

  const monthName = new Date(viewYear, viewMonth, 1)
    .toLocaleString('en-GB', { month:'long', year:'numeric' })

  // Build cell array
  const cells = []
  for (let i = 0; i < offset; i++) {
    const prevDays = getDaysInMonth(viewYear, viewMonth - 1)
    cells.push({ type:'other', n: prevDays - offset + i + 1 })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = monFirstDow(new Date(viewYear, viewMonth, d).getDay())
    cells.push({ type:'day', n: d, dow })
  }
  const trailing = (7 - (cells.length % 7)) % 7
  for (let i = 1; i <= trailing; i++) cells.push({ type:'other', n: i })

  const manualKey = (d) => `${viewYear}-${viewMonth}-${d}`

  const handleDayClick = (d, dow) => {
    const isWeekend = dow === 5 || dow === 6
    const key = manualKey(d)
    const dayBookings = bookingsByDay[key] || []

    if (dayBookings.length > 0 && !mode) {
      // Show popover
      setPopover(popover?.day === d ? null : { day: d, bookings: dayBookings })
      return
    }

    if (isWeekend || !mode) return
    setPopover(null)
    setManualDays((prev) => {
      const cur = prev[key]
      if (mode === 'block')     return { ...prev, [key]: cur === 'blocked'   ? null : 'blocked' }
      if (mode === 'available') return { ...prev, [key]: cur === 'available' ? null : 'available' }
      return prev
    })
  }

  const getDayState = (d) => {
    const key = manualKey(d)
    const manual = manualDays[key]
    if (manual) return manual
    const dayBookings = bookingsByDay[key] || []
    if (dayBookings.length === 0) return null
    const hasConfirmed = dayBookings.some(b => b.status === 'confirmed')
    const hasPending   = dayBookings.some(b => b.status === 'pending' || b.status === 'missing')
    if (hasConfirmed && !hasPending) return 'confirmed'
    if (hasPending)  return 'pending'
    return null
  }

  const isToday = (d) =>
    d === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear()

  const getDayClass = (d, dow) => {
    const state = getDayState(d)
    const weekend = dow === 5 || dow === 6
    let cls = 'cal-day'
    if (weekend) cls += ' empty'
    if (state === 'blocked')   cls += ' blocked'
    if (state === 'available') cls += ' available'
    if (state === 'confirmed') cls += ' confirmed'
    if (state === 'pending')   cls += ' pending'
    if (isToday(d)) cls += ' today'
    return cls
  }

  const getDotColor = (d) => {
    const key = manualKey(d)
    const dayBookings = bookingsByDay[key] || []
    if (dayBookings.length === 0) return null
    const hasConfirmed = dayBookings.some(b => b.status === 'confirmed')
    const hasPending   = dayBookings.some(b => b.status === 'pending' || b.status === 'missing')
    if (hasConfirmed && !hasPending) return 'var(--primary)'
    if (hasPending) return 'var(--warning)'
    return null
  }

  return (
    <AppShell
      title="Calendar"
      topbarRight={
        <>
          <Btn
            variant={mode === 'block' ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => { setMode(m => m === 'block' ? null : 'block'); setPopover(null) }}
          >
            {mode === 'block' ? '✕ Stop blocking' : 'Block day'}
          </Btn>
          <Btn
            variant={mode === 'available' ? 'success' : 'secondary'}
            size="sm"
            onClick={() => { setMode(m => m === 'available' ? null : 'available'); setPopover(null) }}
          >
            {mode === 'available' ? '✕ Stop marking' : 'Mark available'}
          </Btn>
        </>
      }
    >
      <div className="page-header">
        <div>
          <h1>Calendar</h1>
          <p>
            {mode === 'block'     && 'Click days to block or unblock them.'}
            {mode === 'available' && 'Click days to mark or unmark as available.'}
            {!mode                && 'Click a day with a booking dot to see details.'}
          </p>
        </div>
      </div>

      <div className="calendar-wrap" onClick={(e) => { if (e.target === e.currentTarget) setPopover(null) }}>
        {/* Header */}
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={prevMonth}>← Prev</button>
          <div style={{ textAlign:'center' }}>
            <div className="calendar-month">{monthName}</div>
            <div className="calendar-legend" style={{ justifyContent:'center', marginTop:8 }}>
              {[
                ['var(--primary)','Confirmed'],
                ['var(--warning)','Pending'],
                ['var(--danger)', 'Blocked'],
                ['var(--success)','Available'],
              ].map(([color, label]) => (
                <div key={label} className="calendar-legend-item">
                  <div className="calendar-legend-dot" style={{ background:color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <button className="calendar-nav-btn" onClick={nextMonth}>Next →</button>
        </div>

        {/* Grid */}
        <div className="cal-grid">
          {DOW_LABELS.map((d) => <div key={d} className="cal-day-header">{d}</div>)}

          {cells.map((cell, i) => {
            if (cell.type === 'other') {
              return (
                <div key={`o-${i}`} className="cal-day empty other">
                  <div className="cal-day-num">{cell.n}</div>
                </div>
              )
            }

            const { n, dow } = cell
            const isWeekend = dow === 5 || dow === 6
            const dotColor  = getDotColor(n)
            const hasBookings = (bookingsByDay[manualKey(n)] || []).length > 0
            const isPopoverDay = popover?.day === n

            return (
              <div
                key={n}
                className={getDayClass(n, dow)}
                onClick={() => handleDayClick(n, dow)}
                style={{
                  cursor: (hasBookings && !mode) || (mode && !isWeekend) ? 'pointer' : 'default',
                  outline: isPopoverDay ? '2px solid var(--primary)' : 'none',
                  position: 'relative',
                }}
              >
                <div className="cal-day-num">{n}</div>
                {dotColor && <div className="cal-dot" style={{ background: dotColor }} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Booking popover */}
      {popover && (
        <div style={{
          marginTop: 16,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
          padding: 18, animation: 'fadeIn 0.15s ease',
        }}>
          <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }`}</style>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700 }}>
              Bookings for {new Date(viewYear, viewMonth, popover.day).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}
            </div>
            <button
              onClick={() => setPopover(null)}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:'var(--text-muted)', padding:'0 4px' }}
            >✕</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {popover.bookings.map((b) => (
              <div key={b.id} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'10px 14px', background:'var(--bg)',
                border:'1px solid var(--border)', borderRadius:'var(--radius)',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:32, height:32, borderRadius:'50%',
                    background:'var(--primary-tint)', display:'flex',
                    alignItems:'center', justifyContent:'center',
                    fontSize:12, fontWeight:700, color:'var(--primary)',
                  }}>
                    {b.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize:13.5, fontWeight:600 }}>{b.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                      {b.details?.[0]?.[1]} · {b.details?.[2]?.[1]}
                    </div>
                  </div>
                </div>
                <Badge variant={b.badgeVariant}>{b.badge}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  )
}
