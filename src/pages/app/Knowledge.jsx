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

// All categories start empty — business owner fills these in
const INITIAL_BLOCKS = {
  services:     [],
  booking:      [],
  cancellation: [],
  deposit:      [],
  aftercare:    [],
  location:     [],
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
            {currentBlocks.length === 0 ? (
              <div style={{
                textAlign:'center', padding:'40px 20px',
                color:'var(--text-muted)',
              }}>
                <div style={{fontSize:28,marginBottom:12}}>📝</div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Nothing here yet</div>
                <div style={{fontSize:13,lineHeight:1.6,maxWidth:320,margin:'0 auto 20px'}}>
                  Add information about your business here. HavenIQ will use this to answer customer enquiries accurately.
                </div>
                <button className="kb-add-btn" style={{maxWidth:240,margin:'0 auto'}} onClick={()=>addBlock(activeCategory)}>
                  + Add your first block
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}
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
