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

    const { redirect_uri, market } = await req.json();

    // Get client access token from Tink
    const tokenResponse = await fetch(`${TINK_BASE_URL}/api/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TINK_CLIENT_ID || '',
        client_secret: TINK_CLIENT_SECRET || '',
        grant_type: 'client_credentials',
        scope: 'authorization:grant',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get Tink token:', await tokenResponse.text());
      throw new Error('Failed to authenticate with banking provider');
    }

    const tokenData = await tokenResponse.json();

    // Create authorization grant for the user
    const authResponse = await fetch(`${TINK_BASE_URL}/api/v1/oauth/authorization-grant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_user_id: user.id,
        scope: 'accounts:read,transactions:read,credentials:read',
        market: market || 'DE',
      }),
    });

    if (!authResponse.ok) {
      console.error('Failed to create auth grant:', await authResponse.text());
      throw new Error('Failed to create banking authorization');
    }

    const authData = await authResponse.json();

    // Build Tink Link URL for user to authenticate with their bank
    const tinkLinkUrl = new URL('https://link.tink.com/1.0/authorize');
    tinkLinkUrl.searchParams.set('client_id', TINK_CLIENT_ID || '');
    tinkLinkUrl.searchParams.set('authorization_code', authData.code);
    tinkLinkUrl.searchParams.set('redirect_uri', redirect_uri);
    tinkLinkUrl.searchParams.set('scope', 'accounts:read,transactions:read');
    tinkLinkUrl.searchParams.set('market', market || 'DE');

    console.log('Generated Tink Link URL for user:', user.id);

    return new Response(
      JSON.stringify({ 
        authorization_url: tinkLinkUrl.toString(),
        expires_in: authData.expires_in 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in open-banking-init:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
