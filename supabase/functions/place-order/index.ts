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

    // Get the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // 1. Fetch current cart items with product details (for ptr snapshot)
    const { data: cartItems, error: cartError } = await supabaseClient
      .from('cart_items')
      .select('*, products(ptr)')
      .eq('retailer_id', user.id)

    if (cartError || !cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty or failed to fetch cart')
    }

    // 2. Group items by distributor_id
    const itemsByDistributor: Record<string, any[]> = {}
    cartItems.forEach(item => {
      if (!itemsByDistributor[item.distributor_id]) itemsByDistributor[item.distributor_id] = []
      itemsByDistributor[item.distributor_id].push(item)
    })

    const createdOrders = []

    // 3. Process each distributor's order
    for (const [distributorId, items] of Object.entries(itemsByDistributor)) {
      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.products.ptr * item.quantity), 0)
      const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000)

      // Insert Order
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          order_number: orderNumber,
          retailer_id: user.id,
          distributor_id: distributorId,
          status: 'placed',
          total_amount: totalAmount
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create Order Items
      const orderItemsToInsert = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        ptr_at_order: item.products.ptr
      }))

      const { error: itemsError } = await supabaseClient
        .from('order_items')
        .insert(orderItemsToInsert)

      if (itemsError) throw itemsError
      createdOrders.push(order)
    }

    // 4. Clear cart for this retailer
    const { error: clearError } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('retailer_id', user.id)

    if (clearError) throw clearError

    return new Response(JSON.stringify({ success: true, orders: createdOrders }), {
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
