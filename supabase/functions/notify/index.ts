import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY   = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_KEY  = Deno.env.get('SERVICE_ROLE_KEY')

async function sendEmail(to: string, subject: string, html: string) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${RESEND_KEY}` },
    body: JSON.stringify({ from:'HavenIQ <notifications@haveniq.app>', to:[to], subject, html }),
  })
}

serve(async (req) => {
  try {
    const { type, businessId, business, booking, reply } = await req.json()

    // ── New booking notification → owner ──────────────────
    if (type === 'new_booking') {
      const sb = createClient(SUPABASE_URL, SERVICE_KEY)
      const { data: biz } = await sb.from('businesses').select('name, email, user_id').eq('id', businessId).single()
      let ownerEmail = biz?.email
      if (!ownerEmail) {
        const { data: { user } } = await sb.auth.admin.getUserById(biz?.user_id)
        ownerEmail = user?.email
      }
      if (!ownerEmail) return new Response('no owner email', { status:200 })

      const customerName = booking.customer_name || booking.name || 'A customer'
      const bizName      = biz?.name || 'your business'

      await sendEmail(ownerEmail,
        `📅 New booking request — ${customerName}`,
        `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <h2 style="color:#6C63FF;margin-bottom:4px">New Booking Request</h2>
          <p style="color:#6B7280;margin-top:0">Someone has requested a booking for <strong>${bizName}</strong></p>
          <div style="background:#F4F4F9;border-radius:10px;padding:16px 20px;margin:20px 0">
            <p style="margin:4px 0"><strong>Customer:</strong> ${customerName}</p>
            <p style="margin:4px 0"><strong>Email:</strong> ${booking.customer_email || '—'}</p>
            <p style="margin:4px 0"><strong>Phone:</strong> ${booking.customer_phone || '—'}</p>
            <p style="margin:4px 0"><strong>Service:</strong> ${booking.service || '—'}</p>
            <p style="margin:4px 0"><strong>Date:</strong> ${booking.date || '—'}</p>
            <p style="margin:4px 0"><strong>Time:</strong> ${booking.time || '—'}</p>
            ${booking.notes ? `<p style="margin:4px 0"><strong>Notes:</strong> ${booking.notes}</p>` : ''}
          </div>
          <a href="https://haven-xi-six.vercel.app/haven/app/bookings"
             style="background:#6C63FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600">
            Approve or decline in HavenIQ →
          </a>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">Sent by HavenIQ</p>
        </div>`
      )
    }

    // ── Owner reply → customer ────────────────────────────
    else if (type === 'owner_reply') {
      if (!reply?.to || !reply?.text) return new Response('missing reply data', { status:200 })
      const bizName = business?.name || 'The business'

      await sendEmail(reply.to,
        `Reply from ${bizName}`,
        `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <h2 style="color:#6C63FF;margin-bottom:4px">You have a reply</h2>
          <p style="color:#6B7280;margin-top:0">from <strong>${bizName}</strong></p>
          <div style="background:#F4F4F9;border-radius:10px;padding:16px 20px;margin:20px 0;font-size:15px;line-height:1.7;white-space:pre-wrap">${reply.text}</div>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">
            Sent via HavenIQ · Booking & Enquiry Management
          </p>
        </div>`
      )
    }

    return new Response('ok', { status:200 })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status:500 })
  }
})
