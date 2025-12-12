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

    const { code, credentials_id } = await req.json();

    // Exchange the authorization code for user access tokens
    const tokenResponse = await fetch(`${TINK_BASE_URL}/api/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TINK_CLIENT_ID || '',
        client_secret: TINK_CLIENT_SECRET || '',
        grant_type: 'authorization_code',
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code:', await tokenResponse.text());
      throw new Error('Failed to complete bank connection');
    }

    const tokenData = await tokenResponse.json();

    // Get provider/bank info
    const credentialsResponse = await fetch(`${TINK_BASE_URL}/api/v1/credentials/${credentials_id}`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    let providerName = 'Connected Bank';
    if (credentialsResponse.ok) {
      const credentialsData = await credentialsResponse.json();
      providerName = credentialsData.providerName || 'Connected Bank';
    }

    // Store the connection in our database
    const { data: connection, error: connectionError } = await supabase
      .from('bank_connections')
      .insert({
        user_id: user.id,
        provider: 'tink',
        institution_name: providerName,
        external_connection_id: credentials_id,
        access_token_ref: `tink_${user.id}_${Date.now()}`, // Reference, not actual token
        status: 'active',
        consent_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        refresh_token_expires_at: tokenData.refresh_token_expires_in 
          ? new Date(Date.now() + tokenData.refresh_token_expires_in * 1000).toISOString()
          : null,
      })
      .select()
      .single();

    if (connectionError) {
      console.error('Failed to store connection:', connectionError);
      throw new Error('Failed to save bank connection');
    }

    // Fetch and store accounts
    const accountsResponse = await fetch(`${TINK_BASE_URL}/api/v1/accounts`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (accountsResponse.ok) {
      const accountsData = await accountsResponse.json();
      
      for (const account of accountsData.accounts || []) {
        await supabase.from('bank_accounts').insert({
          user_id: user.id,
          connection_id: connection.id,
          account_name: account.name || 'Bank Account',
          account_number_masked: account.accountNumber?.substring(account.accountNumber.length - 4) || '****',
          currency: account.currencyCode || 'EUR',
          is_primary: false,
        });
      }
    }

    console.log('Successfully connected bank for user:', user.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        connection_id: connection.id,
        institution_name: providerName,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in open-banking-callback:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
