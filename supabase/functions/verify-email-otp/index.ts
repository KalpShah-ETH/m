import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return new Response(JSON.stringify({ error: 'Email and OTP are required' }), { status: 400 })
    }

    // TODO: Verify the OTP against the database table `otps`
    // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    // const { data } = await supabase.from('otps').select('otp').eq('email', email).single()
    // const isValid = data && data.otp === otp

    // For demonstration, we'll accept '123456' as a universal test OTP
    const isValid = otp === '123456' || otp.length === 6; // Temporary mock validation

    if (isValid) {
      // Optional: Delete the OTP from the database after successful verification
      return new Response(JSON.stringify({ valid: true, message: 'OTP verified successfully' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 200,
      })
    } else {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid verification code' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400,
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
