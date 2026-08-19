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

    // Upsert the map as pending
    const { data: newMap, error: upsertError } = await supabaseClient
      .from('retailer_distributor_map')
      .upsert({
        id: existing ? existing.id : undefined,
        retailer_id: user.id,
        distributor_id,
        status: 'pending',
        decided_at: null
      }, { onConflict: 'retailer_id,distributor_id' })
      .select()
      .single()

    if (upsertError) throw upsertError

    return new Response(JSON.stringify({ success: true, data: newMap }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
