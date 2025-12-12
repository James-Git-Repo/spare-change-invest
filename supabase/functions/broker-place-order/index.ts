import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALPACA_API_KEY = Deno.env.get('ALPACA_API_KEY');
const ALPACA_API_SECRET = Deno.env.get('ALPACA_API_SECRET');
const ALPACA_BASE_URL = 'https://broker-api.sandbox.alpaca.markets';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { symbol, amount, sweep_run_id } = await req.json();

    // Get user's broker account
    const { data: brokerAccount, error: brokerError } = await supabase
      .from('broker_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (brokerError || !brokerAccount) {
      throw new Error('Broker account not found');
    }

    if (brokerAccount.kyc_status !== 'approved') {
      throw new Error('KYC not approved');
    }

    // Place order at Alpaca
    const orderResponse = await fetch(
      `${ALPACA_BASE_URL}/v1/trading/accounts/${brokerAccount.external_account_id}/orders`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${ALPACA_API_KEY}:${ALPACA_API_SECRET}`)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol,
          notional: amount.toString(), // Dollar amount to invest
          side: 'buy',
          type: 'market',
          time_in_force: 'day',
        }),
      }
    );

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Order placement failed:', errorText);
      throw new Error('Failed to place order');
    }

    const orderData = await orderResponse.json();

    // Get asset info for display name
    const assetResponse = await fetch(`${ALPACA_BASE_URL}/v1/assets/${symbol}`, {
      headers: {
        'Authorization': `Basic ${btoa(`${ALPACA_API_KEY}:${ALPACA_API_SECRET}`)}`,
      },
    });
    
    let instrumentName = symbol;
    if (assetResponse.ok) {
      const assetData = await assetResponse.json();
      instrumentName = assetData.name || symbol;
    }

    // Store the order in our database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        sweep_run_id: sweep_run_id,
        instrument_symbol: symbol,
        instrument_name: instrumentName,
        amount: amount,
        quantity: orderData.filled_qty || null,
        status: orderData.status === 'filled' ? 'filled' : 'pending',
        executed_at: orderData.filled_at || null,
        currency: 'EUR',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to store order:', orderError);
    }

    console.log('Placed order for user:', user.id, 'Symbol:', symbol, 'Amount:', amount);

    return new Response(
      JSON.stringify({ 
        success: true,
        order_id: order?.id,
        external_order_id: orderData.id,
        status: orderData.status,
        filled_qty: orderData.filled_qty,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in broker-place-order:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
