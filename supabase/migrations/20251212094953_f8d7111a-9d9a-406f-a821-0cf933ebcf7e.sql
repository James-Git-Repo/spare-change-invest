-- Create custom types
CREATE TYPE public.region_type AS ENUM ('eu', 'ch');
CREATE TYPE public.connection_status AS ENUM ('active', 'pending', 'expired', 'error');
CREATE TYPE public.sweep_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.order_status AS ENUM ('pending', 'executed', 'failed', 'cancelled');
CREATE TYPE public.risk_profile AS ENUM ('conservative', 'balanced', 'growth');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  region region_type NOT NULL DEFAULT 'eu',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  kyc_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank connections
CREATE TABLE public.bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  institution_logo TEXT,
  status connection_status DEFAULT 'pending',
  consent_expires_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank accounts
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.bank_connections(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_name TEXT NOT NULL,
  account_number_masked TEXT,
  currency TEXT DEFAULT 'EUR',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT,
  merchant_name TEXT,
  category TEXT,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  transaction_date TIMESTAMPTZ NOT NULL,
  is_eligible_for_roundup BOOLEAN DEFAULT TRUE,
  is_excluded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Round-up ledger
CREATE TABLE public.roundup_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  is_reversal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sweep settings
CREATE TABLE public.sweep_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  sweep_day INTEGER DEFAULT 1 CHECK (sweep_day >= 1 AND sweep_day <= 28),
  monthly_cap DECIMAL(12,2) DEFAULT 50.00,
  minimum_threshold DECIMAL(12,2) DEFAULT 10.00,
  risk_profile risk_profile DEFAULT 'balanced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sweep runs
CREATE TABLE public.sweep_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status sweep_status DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Broker accounts
CREATE TABLE public.broker_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  broker_name TEXT NOT NULL DEFAULT 'Default Broker',
  account_number TEXT,
  kyc_status TEXT DEFAULT 'pending',
  cash_balance DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sweep_run_id UUID REFERENCES public.sweep_runs(id),
  instrument_symbol TEXT NOT NULL,
  instrument_name TEXT NOT NULL,
  quantity DECIMAL(12,6),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status order_status DEFAULT 'pending',
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positions
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instrument_symbol TEXT NOT NULL,
  instrument_name TEXT NOT NULL,
  quantity DECIMAL(12,6) NOT NULL,
  average_cost DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2),
  currency TEXT DEFAULT 'EUR',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, instrument_symbol)
);

-- Excluded merchants
CREATE TABLE public.excluded_merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  merchant_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, merchant_name)
);

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roundup_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sweep_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sweep_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excluded_merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for bank_connections
CREATE POLICY "Users can view own connections" ON public.bank_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own connections" ON public.bank_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own connections" ON public.bank_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own connections" ON public.bank_connections FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bank_accounts
CREATE POLICY "Users can view own accounts" ON public.bank_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.bank_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.bank_accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for roundup_ledger
CREATE POLICY "Users can view own ledger" ON public.roundup_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ledger" ON public.roundup_ledger FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for sweep_settings
CREATE POLICY "Users can view own settings" ON public.sweep_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.sweep_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.sweep_settings FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for sweep_runs
CREATE POLICY "Users can view own sweeps" ON public.sweep_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sweeps" ON public.sweep_runs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for broker_accounts
CREATE POLICY "Users can view own broker" ON public.broker_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own broker" ON public.broker_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own broker" ON public.broker_accounts FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for positions
CREATE POLICY "Users can view own positions" ON public.positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own positions" ON public.positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own positions" ON public.positions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for excluded_merchants
CREATE POLICY "Users can view own exclusions" ON public.excluded_merchants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exclusions" ON public.excluded_merchants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own exclusions" ON public.excluded_merchants FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for audit_logs
CREATE POLICY "Users can view own logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  
  INSERT INTO public.sweep_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_bank_connections_updated_at BEFORE UPDATE ON public.bank_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_sweep_settings_updated_at BEFORE UPDATE ON public.sweep_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_broker_accounts_updated_at BEFORE UPDATE ON public.broker_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();