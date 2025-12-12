-- Add columns to bank_connections for Open Banking
ALTER TABLE public.bank_connections 
ADD COLUMN IF NOT EXISTS external_connection_id text,
ADD COLUMN IF NOT EXISTS access_token_ref text,
ADD COLUMN IF NOT EXISTS refresh_token_expires_at timestamp with time zone;

-- Add columns to broker_accounts for Broker API
ALTER TABLE public.broker_accounts 
ADD COLUMN IF NOT EXISTS external_account_id text,
ADD COLUMN IF NOT EXISTS kyc_submission_id text;

-- Create broker_funding table for tracking deposits
CREATE TABLE IF NOT EXISTS public.broker_funding (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  broker_account_id uuid REFERENCES public.broker_accounts(id),
  amount numeric NOT NULL,
  currency text DEFAULT 'EUR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  external_transfer_id text,
  initiated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on broker_funding
ALTER TABLE public.broker_funding ENABLE ROW LEVEL SECURITY;

-- RLS policies for broker_funding
CREATE POLICY "Users can view own funding" ON public.broker_funding
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own funding" ON public.broker_funding
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'EUR',
  destination_account_id uuid REFERENCES public.bank_accounts(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  reference_number text,
  external_payment_id text,
  initiated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  error_message text
);

-- Enable RLS on withdrawals
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS policies for withdrawals
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own withdrawals" ON public.withdrawals
  FOR UPDATE USING (auth.uid() = user_id);

-- Add sweep_preference to sweep_settings
ALTER TABLE public.sweep_settings
ADD COLUMN IF NOT EXISTS sweep_preference text DEFAULT 'auto_invest' CHECK (sweep_preference IN ('auto_invest', 'auto_withdraw', 'ask_monthly'));

-- Add withdrawal_id to roundup_ledger for tracking
ALTER TABLE public.roundup_ledger
ADD COLUMN IF NOT EXISTS withdrawal_id uuid REFERENCES public.withdrawals(id);