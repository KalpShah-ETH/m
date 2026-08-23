import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const { distributor_id } = await req.json()

    if (!distributor_id) {
      throw new Error('Missing distributor_id')
    }

    // Check if map already exists
    const { data: existing, error: checkError } = await supabaseClient
      .from('retailer_distributor_map')
      .select('id, status')
      .eq('retailer_id', user.id)
      .eq('distributor_id', distributor_id)
      .maybeSingle()

    if (existing && existing.status !== 'rejected') {
      throw new Error('Connection request already exists or is already approved')
    }

    let newMap;
    if (existing) {
      // It's already in the DB but rejected, so we just update it to pending
      const { data, error: updateError } = await supabaseAdmin
        .from('retailer_distributor_map')
        .update({ status: 'pending' })
        .eq('id', existing.id)
        .select()
        .single()
      if (updateError) throw updateError
      newMap = data
    } else {
      // It's not in the DB, so we safely insert a brand new row
      const { data, error: insertError } = await supabaseAdmin
        .from('retailer_distributor_map')
        .insert({
          retailer_id: user.id,
          distributor_id,
          status: 'pending'
        })
        .select()
        .single()
      if (insertError) throw insertError
      newMap = data
    }

    return new Response(JSON.stringify({ success: true, data: newMap }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Edge Function Error:', error.message)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Debug-Error': error.message // Injecting into header so it shows in Supabase HTTP logs
      },
      status: 200,
    })
  }
})
