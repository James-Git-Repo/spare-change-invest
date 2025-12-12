import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALPACA_API_KEY = Deno.env.get('ALPACA_API_KEY');
const ALPACA_API_SECRET = Deno.env.get('ALPACA_API_SECRET');
const ALPACA_BASE_URL = 'https://broker-api.sandbox.alpaca.markets'; // Use sandbox for testing

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

    const { 
      given_name, 
      family_name, 
      date_of_birth, 
      tax_id,
      country_of_citizenship,
      country_of_tax_residence,
      street_address,
      city,
      postal_code,
      country,
    } = await req.json();

    // Check if user already has a broker account
    const { data: existingAccount } = await supabase
      .from('broker_accounts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingAccount) {
      throw new Error('Broker account already exists');
    }

    // Create account at Alpaca
    const alpacaResponse = await fetch(`${ALPACA_BASE_URL}/v1/accounts`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${ALPACA_API_KEY}:${ALPACA_API_SECRET}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: {
          email_address: user.email,
          phone_number: '+1234567890', // Would come from user input
          street_address: [street_address],
          city: city,
          postal_code: postal_code,
          country: country || 'DEU',
        },
        identity: {
          given_name: given_name,
          family_name: family_name,
          date_of_birth: date_of_birth,
          tax_id: tax_id,
          tax_id_type: 'DEU_TIN',
          country_of_citizenship: country_of_citizenship || 'DEU',
          country_of_birth: country_of_citizenship || 'DEU',
          country_of_tax_residence: country_of_tax_residence || 'DEU',
          funding_source: ['employment_income'],
        },
        disclosures: {
          is_control_person: false,
          is_affiliated_exchange_or_finra: false,
          is_politically_exposed: false,
          immediate_family_exposed: false,
        },
        agreements: [
          { agreement: 'margin_agreement', signed_at: new Date().toISOString() },
          { agreement: 'account_agreement', signed_at: new Date().toISOString() },
          { agreement: 'customer_agreement', signed_at: new Date().toISOString() },
        ],
      }),
    });

    if (!alpacaResponse.ok) {
      const errorText = await alpacaResponse.text();
      console.error('Alpaca account creation failed:', errorText);
      throw new Error('Failed to create broker account');
    }

    const alpacaData = await alpacaResponse.json();

    // Store the broker account in our database
    const { data: brokerAccount, error: insertError } = await supabase
      .from('broker_accounts')
      .insert({
        user_id: user.id,
        broker_name: 'Alpaca',
        external_account_id: alpacaData.id,
        account_number: alpacaData.account_number,
        kyc_status: alpacaData.status === 'APPROVED' ? 'approved' : 'pending',
        kyc_submission_id: alpacaData.id,
        cash_balance: 0,
        currency: 'EUR',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to store broker account:', insertError);
      throw new Error('Failed to save broker account');
    }

    console.log('Created broker account for user:', user.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        account_id: brokerAccount.id,
        kyc_status: brokerAccount.kyc_status,
        account_number: brokerAccount.account_number,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in broker-create-account:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
