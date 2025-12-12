import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useVaultBalance() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['vault_balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return { balance: 0, thisMonth: 0, transactions: 0 };
      
      const { data, error } = await supabase
        .from('roundup_ledger')
        .select('amount, is_reversal, created_at')
        .eq('user_id', user.id);

      if (error) throw error;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let balance = 0;
      let thisMonth = 0;
      let transactions = 0;

      (data || []).forEach((entry) => {
        const amount = entry.is_reversal ? -Number(entry.amount) : Number(entry.amount);
        balance += amount;
        transactions++;

        const entryDate = new Date(entry.created_at);
        if (entryDate >= startOfMonth) {
          thisMonth += amount;
        }
      });

      return { 
        balance: Math.max(0, balance), 
        thisMonth: Math.max(0, thisMonth), 
        transactions 
      };
    },
    enabled: !!user?.id,
  });
}
