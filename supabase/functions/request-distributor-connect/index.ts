import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
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
      .select('id')
      .eq('retailer_id', user.id)
      .eq('distributor_id', distributor_id)
      .maybeSingle()

    if (existing) {
      throw new Error('Connection request already exists or is already mapped')
    }

    // Insert new map as non_mapped
    const { data: newMap, error: insertError } = await supabaseClient
      .from('retailer_distributor_map')
      .insert({
        retailer_id: user.id,
        distributor_id,
        status: 'non_mapped'
      })
      .select()
      .single()

    if (insertError) throw insertError

    return new Response(JSON.stringify({ success: true, data: newMap }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
