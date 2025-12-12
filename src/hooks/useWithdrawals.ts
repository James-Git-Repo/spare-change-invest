import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useWithdrawals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['withdrawals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*, bank_accounts!destination_account_id(*)')
        .eq('user_id', user.id)
        .order('initiated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useInitiateWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, destinationAccountId }: { 
      amount: number; 
      destinationAccountId: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('withdrawal-initiate', {
        body: { 
          amount,
          destination_account_id: destinationAccountId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['vault-balance'] });
    },
  });
}
