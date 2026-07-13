import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { supabase } from '../../supabase'
import AppShell from '../../components/layout/AppShell'
import { Badge, Btn, AiChip, Card } from '../../components/ui'

export default function Dashboard() {
  const navigate = useNavigate()
  const { bookings, quotes, complaints, enquiries, business, showToast } = useStore()
  const [clearedIds,     setClearedIds]     = useState([])
  const [todayBookings,  setTodayBookings]  = useState([])

  const pendingBookings = bookings.filter(b => b.status==='pending' || b.status==='missing')
  const openQuotes      = quotes.filter(q => q.status==='open')
  const openComplaints  = complaints.filter(c => c.status==='open')
  const openEnquiries   = enquiries.filter(e => e.status==='open')
  const awaitingInfo    = bookings.filter(b => b.status==='missing')

  // Recent bookings — exclude cleared ones
  const recentBookings  = bookings.filter(b => !clearedIds.includes(b.id)).slice(0, 4)

  const clearRecent = () => setClearedIds(bookings.map(b => b.id))

  // Today's schedule — load confirmed bookings for today
  useEffect(() => {
    if (!business?.id) return
    const today = new Date()
    const DAYS_SH  = {0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat'}
    const MONTHS   = {0:'Jan',1:'Feb',2:'Mar',3:'Apr',4:'May',5:'Jun',6:'Jul',7:'Aug',8:'Sep',9:'Oct',10:'Nov',11:'Dec'}
    const todayStr = `${DAYS_SH[today.getDay()]} ${today.getDate()} ${MONTHS[today.getMonth()]}`

    supabase.from('bookings')
      .select('*')
      .eq('business_id', business.id)
      .eq('status', 'confirmed')
      .eq('date', todayStr)
      .order('time')
      .then(({ data }) => setTodayBookings(data || []))
  }, [business?.id])

  // Convert time string to minutes for sorting
  const toMins = (t) => {
    if (!t) return 0
    const [timePart, period] = t.split(' ')
    let [h, m] = timePart.split(':').map(Number)
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return h * 60 + m
  }

  const sortedToday = [...todayBookings].sort((a, b) => toMins(a.time) - toMins(b.time))

  const SUMMARY = [
    { label:'New Bookings',   num:pendingBookings.length, badge:`${pendingBookings.length}`, bv:'info',    bg:'#EFF6FF', stroke:'#3B82F6', icon:CalIcon,   path:'/haven/app/bookings' },
    { label:'Quote Requests', num:openQuotes.length,      badge:`${openQuotes.length}`,      bv:'neutral', bg:'#F5F3FF', stroke:'#7C3AED', icon:DocIcon,   path:'/haven/app/quotes' },
    { label:'Complaints',     num:openComplaints.length,  badge:`${openComplaints.length}`,  bv:'danger',  bg:'#FEF2F2', stroke:'#EF4444', icon:AlertIcon, path:'/haven/app/complaints' },
    { label:'Enquiries',      num:openEnquiries.length,   badge:`${openEnquiries.length}`,   bv:'neutral', bg:'#ECFDF5', stroke:'#10B981', icon:ChatIcon,  path:'/haven/app/enquiries' },
    { label:'Awaiting Info',  num:awaitingInfo.length,    badge:`${awaitingInfo.length}`,    bv:'warning', bg:'#FFFBEB', stroke:'#F59E0B', icon:ClockIcon, path:'/haven/app/bookings' },
  ]

  return (
    <AppShell
      title="Dashboard"
      topbarRight={
        <>
          <AiChip label="AI Active"/>
          <Btn variant="primary" size="sm" onClick={() => {
            const slug = business?.slug || 'demo'
            const url  = `${window.location.origin}/haven/book/${slug}`
            navigator.clipboard?.writeText(url).catch(()=>{})
            showToast('Booking link copied! ✓')
          }}>Share Booking & Enquiry page</Btn>
        </>
      }
    >
      <div style={{marginBottom:18}}>
        <h2 style={{fontSize:18,fontWeight:700}}>
          {(() => { const h=new Date().getHours(); return h<12?'Good morning 👋':h<18?'Good afternoon 👋':'Good evening 👋' })()}
        </h2>
        <p style={{fontSize:13,color:'var(--text-muted)',marginTop:2}}>
          {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          {pendingBookings.length>0
            ? ` — ${pendingBookings.length} booking request${pendingBookings.length!==1?'s':''} need your attention.`
            : ' — everything is up to date.'}
        </p>
      </div>

      {/* Summary cards */}
      <div className="summary-grid">
        {SUMMARY.map(s=>(
          <div key={s.label} className="summary-card"
            onClick={()=>navigate(s.path)}
            style={{cursor:'pointer',transition:'box-shadow .14s'}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-md)'}
            onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--shadow)'}
          >
            <div className="summary-card-top">
              <div className="summary-icon" style={{background:s.bg}}><s.icon stroke={s.stroke}/></div>
              <Badge variant={s.bv}>{s.badge}</Badge>
            </div>
            <div className="summary-number">{s.num}</div>
            <div className="summary-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent bookings */}
        <Card>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <span style={{fontSize:13.5,fontWeight:600}}>Recent Bookings</span>
            <div style={{display:'flex',gap:8}}>
              {recentBookings.length > 0 && (
                <Btn variant="secondary" size="sm" onClick={clearRecent}>Clear</Btn>
              )}
              <Btn variant="secondary" size="sm" onClick={()=>navigate('/haven/app/bookings')}>View all</Btn>
            </div>
          </div>
          {recentBookings.length === 0 ? (
            <p style={{fontSize:13,color:'var(--text-muted)',padding:'8px 0'}}>No recent bookings to show.</p>
          ) : recentBookings.map(b=>(
            <div key={b.id} className="mini-booking">
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div className="mini-booking-av">{b.avatar}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{b.name}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)'}}>
                    {b.details?.[0]?.[1]} · {b.details?.[1]?.[1]}
                  </div>
                </div>
              </div>
              <Badge variant={b.badgeVariant}>{b.badge}</Badge>
            </div>
          ))}
        </Card>

        {/* Today's Schedule */}
        <Card>
          <div style={{fontSize:13.5,fontWeight:600,marginBottom:14}}>
            Today's Schedule
            <span style={{fontSize:11.5,fontWeight:400,color:'var(--text-muted)',marginLeft:8}}>
              {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short'})}
            </span>
          </div>
          {sortedToday.length === 0 ? (
            <div style={{textAlign:'center',padding:'20px 0',color:'var(--text-muted)'}}>
              <div style={{fontSize:24,marginBottom:8}}>📅</div>
              <div style={{fontSize:13,fontWeight:500}}>No confirmed bookings today</div>
              <div style={{fontSize:12,marginTop:4}}>Your day is free</div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {sortedToday.map((b,i) => (
                <div key={b.id} style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding:'9px 12px',
                  background: i===0 ? 'var(--primary-tint)' : 'var(--bg)',
                  border:`1px solid ${i===0?'#C4BFFF':'var(--border)'}`,
                  borderRadius:9,
                }}>
                  <div style={{
                    fontSize:11,fontWeight:700,color:i===0?'var(--primary)':'var(--text-muted)',
                    minWidth:52,textAlign:'center',
                  }}>{b.time}</div>
                  <div style={{width:1,height:32,background:'var(--border)'}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {b.customer_name}
                    </div>
                    <div style={{fontSize:12,color:'var(--text-muted)'}}>{b.service}</div>
                  </div>
                  {i===0&&<span style={{fontSize:10,fontWeight:700,color:'var(--primary)',background:'var(--primary-tint)',padding:'2px 7px',borderRadius:10,flexShrink:0}}>Next</span>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  )
}

function CalIcon({stroke})  { return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function DocIcon({stroke})  { return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function AlertIcon({stroke}){ return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> }
function ChatIcon({stroke}) { return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> }
function ClockIcon({stroke}){ return <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
