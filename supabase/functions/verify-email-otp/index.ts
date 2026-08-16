// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

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
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return new Response(JSON.stringify({ error: 'Email and OTP are required' }), { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch the latest unverified OTP for this email
    const { data: otpRow, error: fetchError } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !otpRow) {
      return new Response(JSON.stringify({ valid: false, error: 'No pending verification found' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400,
      })
    }

    // Reject if expired
    const now = new Date();
    const expiresAt = new Date(otpRow.expires_at);
    if (now > expiresAt) {
      return new Response(JSON.stringify({ valid: false, error: 'Verification code has expired' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400,
      })
    }

    // Reject if locked out (too many attempts)
    if (otpRow.attempts >= 5) {
      return new Response(JSON.stringify({ valid: false, error: 'Too many failed attempts. Please request a new code.' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 429,
      })
    }

    // Hash incoming OTP to compare
    const inputHash = await hashOTP(otp)

    // Compare hashes
    if (inputHash !== otpRow.otp_hash) {
      // Wrong guess: increment attempts
      await supabase
        .from('otps')
        .update({ attempts: otpRow.attempts + 1 })
        .eq('id', otpRow.id)

      return new Response(JSON.stringify({ valid: false, error: 'Invalid verification code' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400,
      })
    }

    // Correct guess: mark as verified
    await supabase
      .from('otps')
      .update({ verified: true })
      .eq('id', otpRow.id)

    return new Response(JSON.stringify({ valid: true, message: 'OTP verified successfully' }), {
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
