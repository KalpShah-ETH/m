import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Note: Without a database migration to store OTPs, you will need to either 
// store the OTP in a custom table (e.g. `otps`) or use a service like Twilio Verify.
// For demonstration, we will log the generated OTP.

const EXTERNAL_PROVIDER_API_KEY = Deno.env.get('EMAIL_PROVIDER_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 })
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // TODO: Insert OTP into a Supabase table like `otps (email, otp, created_at)`
    // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    // await supabase.from('otps').upsert({ email, otp })

    console.log(`[DEV MODE] OTP for ${email} is ${otp}`)

    // Example: Sending email via Resend (External Provider)
    /*
    if (EXTERNAL_PROVIDER_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EXTERNAL_PROVIDER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'MedConnect <onboarding@resend.dev>',
          to: [email],
          subject: 'Your Verification Code',
          html: `<p>Your verification code is <strong>${otp}</strong></p>`
        })
      })
    }
    */

    return new Response(JSON.stringify({ success: true, message: 'OTP sent successfully (Check edge function logs in dev mode)' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
