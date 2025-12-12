import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  external_id: string | null;
  merchant_name: string | null;
  category: string | null;
  amount: number;
  currency: string;
  transaction_date: string;
  is_eligible_for_roundup: boolean;
  is_excluded: boolean;
  created_at: string;
  roundup_amount?: number;
}

export function useTransactions(limit = 50) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get transactions with their round-ups
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (txError) throw txError;

      // Get round-up ledger entries for these transactions
      const transactionIds = (transactions || []).map(t => t.id);
      
      if (transactionIds.length === 0) return [];

      const { data: roundups, error: ruError } = await supabase
        .from('roundup_ledger')
        .select('transaction_id, amount')
        .in('transaction_id', transactionIds)
        .eq('is_reversal', false);

      if (ruError) throw ruError;

      // Map round-ups to transactions
      const roundupMap = new Map<string, number>();
      (roundups || []).forEach(r => {
        if (r.transaction_id) {
          roundupMap.set(r.transaction_id, Number(r.amount));
        }
      });

      return (transactions || []).map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        roundup_amount: roundupMap.get(tx.id) || 0,
      })) as Transaction[];
    },
    enabled: !!user?.id,
  });
}
