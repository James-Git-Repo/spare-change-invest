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

    // Get user's broker account
    const { data: brokerAccount, error: brokerError } = await supabase
      .from('broker_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (brokerError || !brokerAccount) {
      throw new Error('Broker account not found');
    }

    // Fetch positions from Alpaca
    const positionsResponse = await fetch(
      `${ALPACA_BASE_URL}/v1/trading/accounts/${brokerAccount.external_account_id}/positions`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${ALPACA_API_KEY}:${ALPACA_API_SECRET}`)}`,
        },
      }
    );

    if (!positionsResponse.ok) {
      const errorText = await positionsResponse.text();
      console.error('Failed to fetch positions:', errorText);
      throw new Error('Failed to sync positions');
    }

    const positionsData = await positionsResponse.json();

    // Fetch account info for cash balance
    const accountResponse = await fetch(
      `${ALPACA_BASE_URL}/v1/trading/accounts/${brokerAccount.external_account_id}/account`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${ALPACA_API_KEY}:${ALPACA_API_SECRET}`)}`,
        },
      }
    );

    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      await supabase
        .from('broker_accounts')
        .update({ 
          cash_balance: parseFloat(accountData.cash || '0'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', brokerAccount.id);
    }

    // Update positions in our database
    for (const position of positionsData) {
      const positionData = {
        user_id: user.id,
        instrument_symbol: position.symbol,
        instrument_name: position.symbol, // Would need asset lookup for full name
        quantity: parseFloat(position.qty),
        average_cost: parseFloat(position.avg_entry_price),
        current_value: parseFloat(position.market_value),
        currency: 'EUR',
        updated_at: new Date().toISOString(),
      };

      // Upsert position
      const { error: upsertError } = await supabase
        .from('positions')
        .upsert(positionData, { 
          onConflict: 'user_id,instrument_symbol',
          ignoreDuplicates: false,
        });

      if (upsertError) {
        console.error('Failed to upsert position:', upsertError);
      }
    }

    console.log('Synced', positionsData.length, 'positions for user:', user.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        positions_count: positionsData.length,
        last_sync: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in broker-sync-positions:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
