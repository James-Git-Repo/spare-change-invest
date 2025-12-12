import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TINK_CLIENT_ID = Deno.env.get('TINK_CLIENT_ID');
const TINK_CLIENT_SECRET = Deno.env.get('TINK_CLIENT_SECRET');
const TINK_BASE_URL = 'https://api.tink.com';

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

    const { connection_id } = await req.json();

    // Get the connection details
    const { data: connection, error: connectionError } = await supabase
      .from('bank_connections')
      .select('*, bank_accounts(*)')
      .eq('id', connection_id)
      .eq('user_id', user.id)
      .single();

    if (connectionError || !connection) {
      throw new Error('Bank connection not found');
    }

    // Get user access token from Tink using the external_user_id
    const tokenResponse = await fetch(`${TINK_BASE_URL}/api/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TINK_CLIENT_ID || '',
        client_secret: TINK_CLIENT_SECRET || '',
        grant_type: 'client_credentials',
        scope: 'accounts:read,transactions:read',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get access token:', await tokenResponse.text());
      throw new Error('Failed to authenticate with banking provider');
    }

    const tokenData = await tokenResponse.json();

    // Fetch transactions from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactionsResponse = await fetch(
      `${TINK_BASE_URL}/api/v1/transactions?dateFrom=${thirtyDaysAgo.toISOString().split('T')[0]}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!transactionsResponse.ok) {
      console.error('Failed to fetch transactions:', await transactionsResponse.text());
      throw new Error('Failed to sync transactions');
    }

    const transactionsData = await transactionsResponse.json();
    let newTransactionsCount = 0;

    // Store transactions
    for (const tx of transactionsData.transactions || []) {
      // Skip if transaction already exists
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('external_id', tx.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) continue;

      // Find the matching account
      const account = connection.bank_accounts?.find(
        (a: any) => a.account_number_masked === tx.accountId?.substring(tx.accountId.length - 4)
      ) || connection.bank_accounts?.[0];

      if (account) {
        await supabase.from('transactions').insert({
          user_id: user.id,
          account_id: account.id,
          external_id: tx.id,
          amount: Math.abs(tx.amount?.value?.unscaledValue || 0) / 100,
          currency: tx.amount?.currencyCode || 'EUR',
          merchant_name: tx.descriptions?.display || tx.descriptions?.original || 'Unknown',
          category: tx.categories?.pfm?.name || null,
          transaction_date: tx.dates?.booked || new Date().toISOString(),
          is_eligible_for_roundup: tx.amount?.value?.unscaledValue < 0, // Only debit transactions
        });
        newTransactionsCount++;
      }
    }

    // Update last sync time
    await supabase
      .from('bank_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connection_id);

    console.log(`Synced ${newTransactionsCount} new transactions for user:`, user.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        new_transactions: newTransactionsCount,
        last_sync: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in open-banking-sync:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
