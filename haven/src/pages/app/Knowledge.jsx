import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { AiChip, Btn } from '../../components/ui'

const CATEGORIES = [
  { id:'services',      label:'Services & Pricing',    icon:DocIcon },
  { id:'booking',       label:'Booking Policy',         icon:CalIcon },
  { id:'cancellation',  label:'Cancellation Policy',    icon:ClockIcon },
  { id:'deposit',       label:'Deposit Policy',         icon:CoinIcon },
  { id:'aftercare',     label:'Aftercare Advice',       icon:HeartIcon },
  { id:'location',      label:'Location & Parking',     icon:PinIcon },
]

const INITIAL_BLOCKS = {
  services: [
    { id:1, label:'Gel Manicure',      content:'A long-lasting gel polish manicure including shaping, cuticle work and top coat. From £35. Duration: approximately 60 minutes.' },
    { id:2, label:'Acrylic Full Set',  content:'Full acrylic extensions with your choice of shape and colour. Includes nail prep, tips and finish. From £50. Duration: approximately 90 minutes.' },
    { id:3, label:'Lash Lift & Tint',  content:'Lifts and curls your natural lashes for a wide-eyed effect, with a tint for added depth. Results last 6–8 weeks. From £55. Duration: 60 minutes.' },
    { id:4, label:'Brow Lamination',   content:'Restructures brow hairs into a full, brushed-up look. Includes a tint and shape. Results last 4–6 weeks. From £40. Duration: 45 minutes.' },
    { id:5, label:'Tattoo Consultation','content':'Free 30-minute consultation to discuss your design, placement and budget. No obligation. Book via the online form or DM.' },
  ],
  booking: [
    { id:1, label:'Booking Process',   content:'All bookings are made via the online booking form. Once submitted, you will receive a confirmation within a few hours. Bookings are not confirmed until you receive a reply.' },
    { id:2, label:'Patch Test',        content:'A patch test is required at least 48 hours before first-time lash or brow treatments. Please book a patch test appointment separately or visit the studio in advance.' },
  ],
  cancellation: [
    { id:1, label:'Cancellation Policy', content:'Cancellations made more than 24 hours before the appointment are free of charge. Cancellations within 24 hours may forfeit the deposit. No-shows will be charged the full appointment value for future bookings.' },
    { id:2, label:'Rescheduling',      content:'Rescheduling is welcome with more than 24 hours notice at no charge. Contact us via DM or message to rearrange.' },
  ],
  deposit: [
    { id:1, label:'Deposit Requirement', content:'A 25% non-refundable deposit is required for all appointments over £40 to secure your slot. Deposits are taken via bank transfer. Details provided on booking confirmation.' },
    { id:2, label:'Tattoo Deposits',   content:'A minimum £50 deposit is required for all tattoo sessions. This is deducted from the final price. Deposits are non-refundable if the appointment is cancelled within 48 hours.' },
  ],
  aftercare: [
    { id:1, label:'Gel/Acrylic Nails', content:'Avoid soaking nails in water for 24 hours. Use cuticle oil daily. Do not pick or peel. Wear gloves when cleaning or gardening.' },
    { id:2, label:'Lash Lift',         content:'Keep lashes dry for 24 hours. Avoid oil-based products near the eyes. Do not rub or sleep face-down. Use a lash serum to maintain health.' },
    { id:3, label:'Tattoo Aftercare',  content:'Keep the area clean and moisturised. Avoid direct sunlight and swimming for 2–4 weeks. Do not pick or scratch. Apply unscented moisturiser twice daily.' },
  ],
  location: [
    { id:1, label:'Address',           content:'Studio is based in Manchester City Centre. Exact address provided on booking confirmation for security and privacy.' },
    { id:2, label:'Parking',           content:'Street parking available nearby. Several NCP car parks within 5 minutes walk. Public transport: Piccadilly Gardens tram stop, 3 minutes walk.' },
  ],
}

export default function Knowledge() {
  const [activeCategory, setActiveCategory] = useState('services')
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS)

  const updateBlock = (catId, blockId, newContent) => {
    setBlocks(prev => ({
      ...prev,
      [catId]: prev[catId].map(b => b.id===blockId ? {...b, content:newContent} : b),
    }))
  }

  const addBlock = (catId) => {
    setBlocks(prev => ({
      ...prev,
      [catId]: [...prev[catId], {id:Date.now(), label:'New entry', content:''}],
    }))
  }

  const currentBlocks = blocks[activeCategory] || []
  const catLabel = CATEGORIES.find(c=>c.id===activeCategory)?.label

  return (
    <AppShell
      title="Business Knowledge"
      topbarRight={
        <>
          <AiChip label="Used by AI"/>
          <Btn variant="primary" size="sm" onClick={()=>addBlock(activeCategory)}>+ Add block</Btn>
        </>
      }
    >
      <div className="page-header">
        <div>
          <h1>Business Knowledge</h1>
          <p>Store your policies, services and rules. HavenIQ's AI will use this to answer customer enquiries accurately.</p>
        </div>
      </div>

      <div className="kb-grid">
        {/* Category nav */}
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          {CATEGORIES.map(cat=>(
            <button key={cat.id}
              className={`kb-category${activeCategory===cat.id?' active':''}`}
              onClick={()=>setActiveCategory(cat.id)}
            >
              <cat.icon/>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="kb-editor">
          <div className="kb-editor-header">
            <div>
              <div className="kb-editor-title">{catLabel}</div>
              <div style={{fontSize:11.5,color:'var(--text-muted)',marginTop:2}}>
                {currentBlocks.length} block{currentBlocks.length!==1?'s':''}
              </div>
            </div>
            <Btn variant="secondary" size="sm">Save changes</Btn>
          </div>
          <div className="kb-editor-body">
            {currentBlocks.map(block=>(
              <div key={block.id} className="kb-block">
                <div className="kb-block-label">{block.label}</div>
                <div
                  className="kb-block-content"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e=>updateBlock(activeCategory,block.id,e.target.innerText)}
                >
                  {block.content}
                </div>
              </div>
            ))}
            <button className="kb-add-btn" onClick={()=>addBlock(activeCategory)}>+ Add block</button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function DocIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function CalIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function ClockIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
function CoinIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2m-4-6h8"/></svg> }
function HeartIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> }
function PinIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> }
