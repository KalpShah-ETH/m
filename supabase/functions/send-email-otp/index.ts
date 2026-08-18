// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const EMAIL_PROVIDER_API_KEY = Deno.env.get('EMAIL_PROVIDER_API_KEY');

async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Rate Limit Check: Reject if an OTP was requested in the last 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentOtp } = await supabase
      .from('otps')
      .select('id')
      .eq('email', email)
      .gte('created_at', oneMinuteAgo)
      .limit(1)
      .single()

    if (recentOtp) {
      return new Response(JSON.stringify({ error: 'Please wait 60 seconds before requesting a new code' }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    // Delete/invalidate previous unverified OTPs
    await supabase
      .from('otps')
      .delete()
      .eq('email', email)
      .eq('verified', false)

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpHash = await hashOTP(otp)

    // Insert new OTP with 5-minute expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    const { error: dbError } = await supabase
      .from('otps')
      .insert({ email, otp_hash: otpHash, expires_at: expiresAt, verified: false, attempts: 0 })

    if (dbError) {
      console.error('Database Error:', dbError)
      return new Response(JSON.stringify({ error: 'Failed to store OTP in database: ' + dbError.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    // Dispatch email via Resend
    if (EMAIL_PROVIDER_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EMAIL_PROVIDER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'MedConnect <onboarding@resend.dev>',
          to: [email],
          subject: 'Your Verification Code',
          html: `<p>Your MedConnect verification code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
        })
      })
      
      if (!res.ok) {
        const resText = await res.text()
        console.error('Resend Error:', resText)
        return new Response(JSON.stringify({ error: 'Resend Error: ' + resText }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
      }
    } else {
      console.warn('EMAIL_PROVIDER_API_KEY is not set. Email was not actually dispatched.')
      // Optionally print it for dev if API key missing
      console.log(`[DEV MODE] OTP for ${email} is ${otp}`)
    }

    return new Response(JSON.stringify({ success: true, message: 'OTP sent successfully' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
