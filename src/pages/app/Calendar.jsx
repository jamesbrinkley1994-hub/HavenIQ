import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { Btn } from '../../components/ui'

// July 2025 — Mon start
// day state: null=normal, 'blocked','available','confirmed','pending'
const INITIAL_DAYS = {
  7:'confirmed', 8:'confirmed', 9:'available', 10:'blocked', 11:'confirmed',
  14:'pending', 15:'confirmed', 16:'pending', 17:'pending', 18:'available',
  25:'blocked',
}
const WEEKEND = [6,7] // Sat=6, Sun=7 (0=Mon offset)

// July 2025 starts on Tuesday → offset 1
const MONTH_OFFSET = 1
const DAYS_IN_MONTH = 31

const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function Calendar() {
  const [days, setDays] = useState(INITIAL_DAYS)
  const [mode, setMode] = useState(null) // 'block' | 'available' | null

  const cells = []
  // leading empty cells
  for (let i = 0; i < MONTH_OFFSET; i++) cells.push({ type:'prev', n: 30 + i - MONTH_OFFSET + 1 })
  for (let d = 1; d <= DAYS_IN_MONTH; d++) {
    const dow = (d - 1 + MONTH_OFFSET) % 7 // 0=Mon
    cells.push({ type:'day', n: d, dow })
  }
  // trailing
  const trailing = 7 - (cells.length % 7)
  if (trailing < 7) for (let i = 1; i <= trailing; i++) cells.push({ type:'next', n: i })

  const handleClick = (d) => {
    if (!mode) return
    setDays((prev) => {
      const cur = prev[d]
      if (mode === 'block')     return { ...prev, [d]: cur === 'blocked'   ? null : 'blocked' }
      if (mode === 'available') return { ...prev, [d]: cur === 'available' ? null : 'available' }
      return prev
    })
  }

  const dayClass = (d, dow) => {
    const state = days[d]
    const isWeekend = dow === 5 || dow === 6
    const isToday = d === 14
    let cls = 'cal-day'
    if (isWeekend) cls += ' empty'
    if (state === 'blocked')   cls += ' blocked'
    if (state === 'available') cls += ' available'
    if (state === 'confirmed') cls += ' confirmed'
    if (state === 'pending')   cls += ' pending'
    if (isToday) cls += ' today'
    return cls
  }

  return (
    <AppShell
      title="Calendar"
      topbarRight={
        <>
          <Btn
            variant={mode === 'block' ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => setMode((m) => m === 'block' ? null : 'block')}
          >
            {mode === 'block' ? '✕ Stop blocking' : 'Block day'}
          </Btn>
          <Btn
            variant={mode === 'available' ? 'success' : 'secondary'}
            size="sm"
            onClick={() => setMode((m) => m === 'available' ? null : 'available')}
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
            {!mode                && 'Manage your availability and view bookings'}
          </p>
        </div>
      </div>

      <div className="calendar-wrap">
        {/* Header */}
        <div className="calendar-header">
          <button className="calendar-nav-btn">← Prev</button>
          <div style={{ textAlign:'center' }}>
            <div className="calendar-month">July 2025</div>
            <div className="calendar-legend" style={{ justifyContent:'center', marginTop:8 }}>
              {[
                ['var(--primary)','Confirmed'],
                ['var(--warning)','Pending'],
                ['var(--danger)','Blocked'],
                ['var(--success)','Available'],
              ].map(([color, label]) => (
                <div key={label} className="calendar-legend-item">
                  <div className="calendar-legend-dot" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <button className="calendar-nav-btn">Next →</button>
        </div>

        {/* Grid */}
        <div className="cal-grid">
          {DOW.map((d) => <div key={d} className="cal-day-header">{d}</div>)}

          {cells.map((cell, i) => {
            if (cell.type !== 'day') {
              return (
                <div key={`e-${i}`} className="cal-day empty other">
                  <div className="cal-day-num">{cell.n}</div>
                </div>
              )
            }
            const { n, dow } = cell
            const state = days[n]
            const isWeekend = dow === 5 || dow === 6
            const dotColor = state === 'confirmed' ? 'var(--primary)'
              : state === 'pending' ? 'var(--warning)' : null

            return (
              <div
                key={n}
                className={dayClass(n, dow)}
                onClick={() => !isWeekend && handleClick(n)}
                style={{ cursor: mode && !isWeekend ? 'pointer' : 'default' }}
              >
                <div className="cal-day-num">{n}</div>
                {dotColor && <div className="cal-dot" style={{ background: dotColor }} />}
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
