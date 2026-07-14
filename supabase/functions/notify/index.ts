import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY   = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_KEY  = Deno.env.get('SERVICE_ROLE_KEY')

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function sendEmail(to: string, subject: string, html: string, from = 'HavenIQ <notifications@haveniq.uk>') {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${RESEND_KEY}` },
    body: JSON.stringify({ from, to:[to], subject, html }),
  })
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const body = await req.json()
    const { type, businessId, business, booking, reply, feedback } = body

    if (type === 'new_booking') {
      const sb = createClient(SUPABASE_URL, SERVICE_KEY)
      const { data: biz } = await sb.from('businesses').select('name, email, user_id').eq('id', businessId).single()
      let ownerEmail = biz?.email
      if (!ownerEmail) {
        const { data: { user } } = await sb.auth.admin.getUserById(biz?.user_id)
        ownerEmail = user?.email
      }
      if (!ownerEmail) return new Response('no owner email', { headers: CORS, status:200 })

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

    else if (type === 'owner_reply') {
      if (!reply?.to || !reply?.text) return new Response('missing reply data', { headers: CORS, status:200 })
      const bizName = business?.name || 'The business'

      await sendEmail(reply.to,
        `Reply from ${bizName}`,
        `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <h2 style="color:#6C63FF;margin-bottom:4px">You have a reply</h2>
          <p style="color:#6B7280;margin-top:0">from <strong>${bizName}</strong></p>
          <div style="background:#F4F4F9;border-radius:10px;padding:16px 20px;margin:20px 0;font-size:15px;line-height:1.7;white-space:pre-wrap">${reply.text}</div>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">Sent via HavenIQ · Booking & Enquiry Management</p>
        </div>`
      )
    }

    else if (type === 'feedback') {
      const typeLabels: Record<string, string> = { bug:'🐛 Bug Report', feature:'💡 Feature Request', general:'💬 General Feedback' }
      const label = typeLabels[feedback?.type] || 'Feedback'

      const res = await sendEmail('Haven.IQ@outlook.com',
        `${label} from ${feedback?.business_name || 'a user'}`,
        `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <h2 style="color:#6C63FF;margin-bottom:4px">${label}</h2>
          <p style="color:#6B7280;margin-top:0">from <strong>${feedback?.business_name || 'Unknown'}</strong> (${feedback?.user_email || '—'})</p>
          <div style="background:#F4F4F9;border-radius:10px;padding:16px 20px;margin:20px 0;font-size:15px;line-height:1.7;white-space:pre-wrap">${feedback?.message || '—'}</div>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">Sent via HavenIQ Feedback</p>
        </div>`
      )
      if (!res.ok) {
        const errText = await res.text()
        console.error('[HavenIQ] Feedback email failed:', res.status, errText)
        return new Response(JSON.stringify({ error: `Feedback email failed: ${errText}` }), { headers: CORS, status:500 })
      }
    }

    else if (type === 'booking_confirmed') {
      if (!booking?.email) return new Response('no customer email', { headers: CORS, status:200 })
      const bizName = business?.name || 'The business'
      const detail = (label: string) => booking?.details?.find((d: string[]) => d[0] === label)?.[1] || '—'

      await sendEmail(booking.email,
        `✅ Your booking with ${bizName} is confirmed`,
        `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <h2 style="color:#16A34A;margin-bottom:4px">Booking Confirmed</h2>
          <p style="color:#6B7280;margin-top:0">Hi ${booking.name?.split(' ')[0] || 'there'}, your booking with <strong>${bizName}</strong> has been confirmed.</p>
          <div style="background:#F4F4F9;border-radius:10px;padding:16px 20px;margin:20px 0">
            <p style="margin:4px 0"><strong>Service:</strong> ${detail('Service')}</p>
            <p style="margin:4px 0"><strong>Date:</strong> ${detail('Date')}</p>
            <p style="margin:4px 0"><strong>Time:</strong> ${detail('Time')}</p>
          </div>
          <p style="color:#6B7280;font-size:14px">If you have any questions, get in touch with ${bizName} directly.</p>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">Sent by HavenIQ on behalf of ${bizName}. First time hearing from us? Check your junk/spam folder and mark this as "not junk" so future updates land in your inbox.</p>
        </div>`
      )
    }

    else if (type === 'booking_declined') {
      if (!booking?.email) return new Response('no customer email', { headers: CORS, status:200 })
      const bizName = business?.name || 'The business'
      const detail = (label: string) => booking?.details?.find((d: string[]) => d[0] === label)?.[1] || '—'

      await sendEmail(booking.email,
        `Update on your booking request with ${bizName}`,
        `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <h2 style="color:#6C63FF;margin-bottom:4px">Booking Request Update</h2>
          <p style="color:#6B7280;margin-top:0">Hi ${booking.name?.split(' ')[0] || 'there'}, unfortunately <strong>${bizName}</strong> isn't able to confirm your requested booking.</p>
          <div style="background:#F4F4F9;border-radius:10px;padding:16px 20px;margin:20px 0">
            <p style="margin:4px 0"><strong>Service:</strong> ${detail('Service')}</p>
            <p style="margin:4px 0"><strong>Requested date:</strong> ${detail('Date')}</p>
            <p style="margin:4px 0"><strong>Requested time:</strong> ${detail('Time')}</p>
          </div>
          <p style="color:#6B7280;font-size:14px">Feel free to get in touch with ${bizName} directly, or submit a new request for a different time.</p>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">Sent by HavenIQ on behalf of ${bizName}. First time hearing from us? Check your junk/spam folder and mark this as "not junk" so future updates land in your inbox.</p>
        </div>`
      )
    }

    return new Response('ok', { headers: CORS, status:200 })
  } catch (e) {
    console.error('[HavenIQ] notify function error:', e.message)
    return new Response(JSON.stringify({ error: e.message }), { headers: CORS, status:500 })
  }
})
