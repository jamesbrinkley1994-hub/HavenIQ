import { useState, useEffect } from 'react'
import { useStore } from '../../store'
import { supabase } from '../../supabase'
import AppShell from '../../components/layout/AppShell'
import { Btn, Badge } from '../../components/ui'

const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const MONTHS = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 }

function monFirstDow(jsDay) { return (jsDay + 6) % 7 }
function getDaysInMonth(y,m) { return new Date(y, m+1, 0).getDate() }
function getOffset(y,m) { return monFirstDow(new Date(y,m,1).getDay()) }

// Try to parse "Tue 30 Jun" → { month, day } or null
function parseDateStr(str) {
  if (!str || str === 'TBC' || str === '—') return null
  const match = str.match(/(\d+)\s+(\w+)/)
  if (!match) return null
  const day = parseInt(match[1])
  const month = MONTHS[match[2]]
  return month !== undefined ? { month, day } : null
}

// Colour tokens per state
const STATE_STYLE = {
  confirmed: { bg:'#EDE9FE', border:'#C4B5FD', dot:'var(--primary)',  label:'Confirmed' },
  pending:   { bg:'#FFFBEB', border:'#FDE68A', dot:'var(--warning)',  label:'Pending'   },
  blocked:   { bg:'#FEF2F2', border:'#FCA5A5', dot:'var(--danger)',   label:'Blocked'   },
  available: { bg:'#ECFDF5', border:'#6EE7B7', dot:'var(--success)',  label:'Available' },
  mixed:     { bg:'#F0F9FF', border:'#BAE6FD', dot:'#0EA5E9',         label:'Mixed'     },
}

export default function Calendar() {
  const { bookings, business } = useStore()
  const now = new Date()
  const [viewYear,   setViewYear]   = useState(now.getFullYear())
  const [viewMonth,  setViewMonth]  = useState(now.getMonth())
  const [manualDays, setManualDays] = useState({})
  const [mode,       setMode]       = useState(null)
  const [selected,   setSelected]   = useState(null)

  // Load persisted block/available day overrides
  useEffect(() => {
    if (!business?.id) return
    supabase.from('business_settings').select('date_overrides').eq('business_id', business.id).maybeSingle()
      .then(({ data }) => { if (data?.date_overrides) setManualDays(data.date_overrides) })
  }, [business?.id])

  // Persist block/available day overrides so they survive a refresh and
  // reach the public booking page
  const saveOverrides = async (overrides) => {
    if (!business?.id) return
    await supabase.from('business_settings').upsert({
      business_id: business.id,
      date_overrides: overrides,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'business_id' })
  }

  // Build booking map for current view month
  const byDay = {}
  bookings.forEach(b => {
    // Use calDate if present
    let cd = b.calDate
    // Otherwise try to parse date string
    if (!cd) cd = parseDateStr(b.details?.find(([l]) => l==='Date')?.[1])
    if (!cd || cd.month !== viewMonth) return
    const k = cd.day
    if (!byDay[k]) byDay[k] = []
    byDay[k].push(b)
  })

  // Navigation
  const prevMonth = () => { setSelected(null); setViewMonth(m => { if(m===0){setViewYear(y=>y-1);return 11} return m-1 }) }
  const nextMonth = () => { setSelected(null); setViewMonth(m => { if(m===11){setViewYear(y=>y+1);return 0} return m+1 }) }

  const monthLabel = new Date(viewYear,viewMonth,1).toLocaleString('en-GB',{month:'long',year:'numeric'})
  const daysInMonth = getDaysInMonth(viewYear,viewMonth)
  const offset = getOffset(viewYear,viewMonth)

  // Cells
  const cells = []
  for(let i=0;i<offset;i++) cells.push({type:'other',n:getDaysInMonth(viewYear,viewMonth-1)-offset+i+1})
  for(let d=1;d<=daysInMonth;d++) cells.push({type:'day',n:d,dow:monFirstDow(new Date(viewYear,viewMonth,d).getDay())})
  const trail=(7-(cells.length%7))%7
  for(let i=1;i<=trail;i++) cells.push({type:'other',n:i})

  const key = d => `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  // Day state: manual override first, then booking state
  const getDayState = (d) => {
    const man = manualDays[key(d)]
    if (man) return man
    const bs = byDay[d] || []
    if (!bs.length) return null
    const hasConf = bs.some(b=>b.status==='confirmed')
    const hasPend = bs.some(b=>b.status==='pending'||b.status==='missing')
    if (hasConf && hasPend) return 'mixed'
    if (hasConf) return 'confirmed'
    if (hasPend) return 'pending'
    return null
  }

  // Is this day "fully booked" — 3+ bookings and all confirmed
  const isFullyBooked = (d) => {
    const bs = byDay[d] || []
    return bs.length >= 3 && bs.every(b=>b.status==='confirmed')
  }

  const handleDayClick = (d,dow) => {
    const isWeekend = dow===5||dow===6
    if (mode && !isWeekend) {
      setSelected(null)
      setManualDays(prev => {
        const cur = prev[key(d)]
        let next = prev
        if(mode==='block')     next = {...prev,[key(d)]:cur==='blocked'?null:'blocked'}
        if(mode==='available') next = {...prev,[key(d)]:cur==='available'?null:'available'}
        // Clean up null entries before saving
        const cleaned = Object.fromEntries(Object.entries(next).filter(([,v]) => v))
        saveOverrides(cleaned)
        return next
      })
    } else {
      setSelected(prev => prev===d ? null : d)
    }
  }

  const isToday = d => d===now.getDate()&&viewMonth===now.getMonth()&&viewYear===now.getFullYear()
  const selectedBookings = selected ? (byDay[selected]||[]) : []
  const selectedDate = selected ? new Date(viewYear,viewMonth,selected).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}) : ''

  return (
    <AppShell
      title="Calendar"
      topbarRight={
        <>
          <Btn variant={mode==='block'?'danger':'secondary'} size="sm"
            onClick={() => {setMode(m=>m==='block'?null:'block'); setSelected(null)}}>
            {mode==='block'?'✕ Stop':'Block day'}
          </Btn>
          <Btn variant={mode==='available'?'success':'secondary'} size="sm"
            onClick={() => {setMode(m=>m==='available'?null:'available'); setSelected(null)}}>
            {mode==='available'?'✕ Stop':'Mark available'}
          </Btn>
        </>
      }
    >
      <div className="page-header">
        <div>
          <h1>Calendar</h1>
          <p>{mode==='block'?'Tap days to block or unblock.':mode==='available'?'Tap days to mark available.':'Tap any day to see bookings.'}</p>
        </div>
      </div>

      {/* Legend */}
      <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:16}}>
        {Object.entries(STATE_STYLE).map(([state,s])=>(
          <div key={state} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text-muted)'}}>
            <div style={{width:10,height:10,borderRadius:3,background:s.bg,border:`1px solid ${s.border}`}}/>
            {s.label}
          </div>
        ))}
      </div>

      <div className="calendar-wrap">
        {/* Header */}
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={prevMonth}>← Prev</button>
          <div className="calendar-month">{monthLabel}</div>
          <button className="calendar-nav-btn" onClick={nextMonth}>Next →</button>
        </div>

        {/* DOW headers */}
        <div className="cal-grid">
          {DOW.map(d=><div key={d} className="cal-day-header">{d}</div>)}

          {cells.map((cell,i)=>{
            if(cell.type==='other') return(
              <div key={`o${i}`} className="cal-day empty other">
                <div className="cal-day-num" style={{opacity:.3}}>{cell.n}</div>
              </div>
            )

            const {n,dow}=cell
            const state=getDayState(n)
            const isWknd=dow===5||dow===6
            const dayBk=byDay[n]||[]
            const style=state?STATE_STYLE[state]:null
            const full=isFullyBooked(n)
            const isSelected=selected===n

            return(
              <div
                key={n}
                onClick={()=>handleDayClick(n,dow)}
                style={{
                  minHeight:72,
                  border:`1px solid ${isSelected?'var(--primary)':state?style.border:'var(--border)'}`,
                  background:isWknd?'#FAFAFA':state?style.bg:'#fff',
                  cursor:isWknd&&!mode?'default':'pointer',
                  display:'flex',flexDirection:'column',
                  padding:'4px 5px',
                  position:'relative',
                  outline:isSelected?'2px solid var(--primary)':'none',
                  outlineOffset:-1,
                  transition:'all .12s',
                }}
              >
                {/* Day number */}
                <div style={{
                  fontSize:12,fontWeight:isToday(n)?700:500,
                  color:isToday(n)?'#fff':'var(--text)',
                  background:isToday(n)?'var(--primary)':'transparent',
                  width:22,height:22,borderRadius:'50%',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  marginBottom:3,flexShrink:0,
                }}>
                  {n}
                </div>

                {/* Booking bubbles — desktop shows names, mobile shows dots */}
                {dayBk.slice(0,2).map(b=>(
                  <div key={b.id} style={{
                    fontSize:10,fontWeight:600,lineHeight:1.2,
                    background:b.status==='confirmed'?'#6C63FF':b.status==='declined'?'#FEE2E2':'#FDE68A',
                    color:b.status==='confirmed'?'#fff':b.status==='declined'?'#EF4444':'#92400E',
                    borderRadius:4,padding:'2px 4px',marginBottom:2,
                    overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',
                    maxWidth:'100%',
                  }}>
                    <span className="cal-bubble-name">{b.name.split(' ')[0]}</span>
                    <span className="cal-bubble-time"> {b.details?.find(([l])=>l==='Time')?.[1]||''}</span>
                  </div>
                ))}
                {dayBk.length>2&&(
                  <div style={{fontSize:10,color:'var(--text-muted)',fontWeight:600}}>
                    +{dayBk.length-2} more
                  </div>
                )}

                {/* Fully booked badge */}
                {full&&(
                  <div style={{position:'absolute',top:3,right:3,fontSize:8,fontWeight:700,background:'#EF4444',color:'#fff',borderRadius:3,padding:'1px 3px'}}>
                    FULL
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selected && (
        <div style={{
          marginTop:16,background:'var(--surface)',border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-md)',
          padding:18,animation:'slideUp .15s ease',
        }}>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div>
              <div style={{fontSize:14,fontWeight:700}}>{selectedDate}</div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>
                {selectedBookings.length===0?'No bookings — day is open':`${selectedBookings.length} booking${selectedBookings.length!==1?'s':''}`}
              </div>
            </div>
            <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'var(--text-muted)',lineHeight:1}}>✕</button>
          </div>
          {selectedBookings.length===0?(
            <div style={{textAlign:'center',padding:'20px 0',color:'var(--text-muted)',fontSize:13}}>
              This day has no bookings.
              {manualDays[key(selected)]==='blocked'&&<span> It is currently <strong>blocked</strong>.</span>}
              {manualDays[key(selected)]==='available'&&<span> It is marked <strong>available</strong>.</span>}
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {selectedBookings.map(b=>(
                <div key={b.id} style={{
                  display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'10px 14px',background:'var(--bg)',
                  border:'1px solid var(--border)',borderRadius:'var(--radius)',
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{
                      width:34,height:34,borderRadius:'50%',flexShrink:0,
                      background:'var(--primary-tint)',display:'flex',
                      alignItems:'center',justifyContent:'center',
                      fontSize:12,fontWeight:700,color:'var(--primary)',
                    }}>{b.avatar}</div>
                    <div>
                      <div style={{fontSize:13.5,fontWeight:600}}>{b.name}</div>
                      <div style={{fontSize:12,color:'var(--text-muted)'}}>
                        {b.details?.find(([l])=>l==='Service')?.[1]} · {b.details?.find(([l])=>l==='Time')?.[1]}
                      </div>
                      {b.notes&&<div style={{fontSize:11.5,color:'var(--text-muted)',marginTop:2,fontStyle:'italic'}}>"{b.notes}"</div>}
                    </div>
                  </div>
                  <Badge variant={b.badgeVariant}>{b.badge}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}
