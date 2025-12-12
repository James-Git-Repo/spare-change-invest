import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useBrokerAccount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['broker-account', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('broker_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateBrokerAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kycData: {
      given_name: string;
      family_name: string;
      date_of_birth: string;
      tax_id: string;
      country_of_citizenship: string;
      country_of_tax_residence: string;
      street_address: string;
      city: string;
      postal_code: string;
      country: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('broker-create-account', {
        body: kycData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-account'] });
    },
  });
}

export function useSyncPositions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('broker-sync-positions', {
        body: {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-account'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ symbol, amount, sweepRunId }: { 
      symbol: string; 
      amount: number; 
      sweepRunId?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('broker-place-order', {
        body: { 
          symbol, 
          amount,
          sweep_run_id: sweepRunId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-account'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
