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

    const { order_id, product_id, quantity, return_type } = await req.json()

    if (!product_id || !quantity || !return_type) {
      throw new Error('Missing required fields')
    }

    // Verify order belongs to user if order_id is provided
    if (order_id) {
      const { data: order, error: orderCheckError } = await supabaseClient
        .from('orders')
        .select('id')
        .eq('id', order_id)
        .eq('retailer_id', user.id)
        .single()
      if (orderCheckError || !order) throw new Error('Invalid order ID or permission denied')
    }

    // Insert draft return
    const { data: returnRecord, error: insertError } = await supabaseClient
      .from('returns')
      .insert({
        retailer_id: user.id,
        order_id: order_id || null,
        product_id,
        quantity,
        return_type,
        status: 'draft'
      })
      .select()
      .single()

    if (insertError) throw insertError

    return new Response(JSON.stringify({ success: true, data: returnRecord }), {
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
