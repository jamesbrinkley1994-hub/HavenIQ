import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { AiChip, Btn } from '../../components/ui'

const CATEGORIES = [
  { id: 'services',     label: 'Services & Pricing',   icon: DocIcon },
  { id: 'booking',      label: 'Booking Policy',        icon: CalIcon },
  { id: 'cancellation', label: 'Cancellation Policy',   icon: ClockIcon },
  { id: 'deposit',      label: 'Deposit Policy',        icon: UserIcon },
  { id: 'location',     label: 'Location & Parking',    icon: PinIcon },
]

const INITIAL_BLOCKS = {
  services: [
    { id: 1, label: 'Regular Clean',    content: 'A standard clean covering all rooms: hoovering, mopping, dusting, and bathroom sanitation. From £65 for a 2-bed house. Duration: approximately 2 hours.' },
    { id: 2, label: 'Deep Clean',       content: 'Full deep clean including inside appliances, skirting boards, light switches, and behind furniture. From £130. Minimum 4-hour slot required.' },
    { id: 3, label: 'End of Tenancy',   content: 'Comprehensive clean to meet landlord or estate agent standards. Includes all rooms, appliances, and carpets. Quotes given on inspection.' },
    { id: 4, label: 'Office Clean',     content: 'Available for offices up to 20 desks. Pricing based on frequency and size. Weekly contracts from £180/month. Out-of-hours slots available.' },
  ],
  booking: [
    { id: 1, label: 'Booking Window',   content: 'Bookings must be made at least 48 hours in advance. Same-day bookings are subject to availability and may incur a short-notice fee of £15.' },
    { id: 2, label: 'Confirmation',     content: 'All bookings are confirmed by email within 2 hours of the request. If you have not received confirmation, please contact us directly.' },
  ],
  cancellation: [
    { id: 1, label: 'Cancellation Policy', content: 'Cancellations made more than 24 hours before the appointment are free of charge. Late cancellations (under 24 hours) incur a 50% charge.' },
  ],
  deposit: [
    { id: 1, label: 'Deposit Requirement', content: 'End of tenancy and one-off deep cleans over £150 require a 25% deposit at time of booking. Deposits are non-refundable within 48 hours of the appointment.' },
  ],
  location: [
    { id: 1, label: 'Service Area',    content: 'We cover the M28, M29, and WN7 postcodes. Travel outside this area may incur a small surcharge — please enquire before booking.' },
    { id: 2, label: 'Parking',         content: 'Please ensure a parking space is available within reasonable distance of your property. Paid parking costs will be added to the invoice.' },
  ],
}

export default function Knowledge() {
  const [activeCategory, setActiveCategory] = useState('services')
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS)

  const updateBlock = (catId, blockId, newContent) => {
    setBlocks((prev) => ({
      ...prev,
      [catId]: prev[catId].map((b) => b.id === blockId ? { ...b, content: newContent } : b),
    }))
  }

  const addBlock = (catId) => {
    setBlocks((prev) => ({
      ...prev,
      [catId]: [...prev[catId], { id: Date.now(), label: 'New block', content: '' }],
    }))
  }

  const currentBlocks = blocks[activeCategory] || []

  return (
    <AppShell
      title="Business Knowledge"
      topbarRight={
        <>
          <AiChip label="Used by AI" />
          <Btn variant="primary" size="sm" onClick={() => addBlock(activeCategory)}>+ Add block</Btn>
        </>
      }
    >
      <div className="page-header">
        <div>
          <h1>Business Knowledge</h1>
          <p>Store information about your business. Haven's AI uses this to answer customer enquiries accurately.</p>
        </div>
      </div>

      <div className="kb-grid">
        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`kb-category${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <cat.icon />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="kb-editor">
          <div className="kb-editor-header">
            <div>
              <div className="kb-editor-title">
                {CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </div>
              <div style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:2 }}>
                {currentBlocks.length} block{currentBlocks.length !== 1 ? 's' : ''}
              </div>
            </div>
            <Btn variant="secondary" size="sm">Save changes</Btn>
          </div>
          <div className="kb-editor-body">
            {currentBlocks.map((block) => (
              <div key={block.id} className="kb-block">
                <div className="kb-block-label">{block.label}</div>
                <div
                  className="kb-block-content"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateBlock(activeCategory, block.id, e.target.innerText)}
                >
                  {block.content}
                </div>
              </div>
            ))}
            <button className="kb-add-btn" onClick={() => addBlock(activeCategory)}>
              + Add block
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function DocIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function CalIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function ClockIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
function UserIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> }
function PinIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> }
