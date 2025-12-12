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

    const { amount, destination_account_id } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error('Invalid withdrawal amount');
    }

    // Verify the destination account belongs to the user
    const { data: bankAccount, error: accountError } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', destination_account_id)
      .eq('user_id', user.id)
      .single();

    if (accountError || !bankAccount) {
      throw new Error('Destination account not found');
    }

    // Check vault balance (from roundup_ledger)
    const { data: ledgerData } = await supabase
      .from('roundup_ledger')
      .select('amount, is_reversal')
      .eq('user_id', user.id);

    const vaultBalance = (ledgerData || []).reduce((sum, entry) => {
      return sum + (entry.is_reversal ? -entry.amount : entry.amount);
    }, 0);

    if (amount > vaultBalance) {
      throw new Error('Insufficient vault balance');
    }

    // Generate reference number
    const referenceNumber = `WD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Create withdrawal record
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawals')
      .insert({
        user_id: user.id,
        amount: amount,
        currency: bankAccount.currency || 'EUR',
        destination_account_id: destination_account_id,
        status: 'pending',
        reference_number: referenceNumber,
        initiated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error('Failed to create withdrawal:', withdrawalError);
      throw new Error('Failed to initiate withdrawal');
    }

    // Create a reversal entry in the ledger to reduce vault balance
    const { error: ledgerError } = await supabase
      .from('roundup_ledger')
      .insert({
        user_id: user.id,
        amount: amount,
        currency: bankAccount.currency || 'EUR',
        is_reversal: true,
        withdrawal_id: withdrawal.id,
      });

    if (ledgerError) {
      console.error('Failed to update ledger:', ledgerError);
      // Rollback the withdrawal
      await supabase.from('withdrawals').delete().eq('id', withdrawal.id);
      throw new Error('Failed to process withdrawal');
    }

    // In production, you would initiate a PIS payment via Tink here
    // For now, we'll simulate the process
    console.log('Initiated withdrawal for user:', user.id, 'Amount:', amount);

    // Simulate processing (in production, this would be handled by webhooks)
    setTimeout(async () => {
      await supabase
        .from('withdrawals')
        .update({ 
          status: 'processing',
        })
        .eq('id', withdrawal.id);
    }, 2000);

    return new Response(
      JSON.stringify({ 
        success: true,
        withdrawal_id: withdrawal.id,
        reference_number: referenceNumber,
        amount: amount,
        status: 'pending',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in withdrawal-initiate:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
