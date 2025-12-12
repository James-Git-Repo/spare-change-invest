import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Position {
  id: string;
  user_id: string;
  instrument_symbol: string;
  instrument_name: string;
  quantity: number;
  average_cost: number;
  current_value: number | null;
  currency: string;
  updated_at: string;
}

export function usePositions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['positions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', user.id)
        .order('current_value', { ascending: false });

      if (error) throw error;

      return (data || []).map(p => ({
        ...p,
        quantity: Number(p.quantity),
        average_cost: Number(p.average_cost),
        current_value: p.current_value ? Number(p.current_value) : null,
      })) as Position[];
    },
    enabled: !!user?.id,
  });
}

export function usePortfolioValue() {
  const { data: positions } = usePositions();

  const totalValue = (positions || []).reduce((sum, p) => {
    return sum + (p.current_value || p.average_cost * p.quantity);
  }, 0);

  const totalCost = (positions || []).reduce((sum, p) => {
    return sum + (p.average_cost * p.quantity);
  }, 0);

  const totalReturn = totalValue - totalCost;
  const returnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalReturn,
    returnPercentage,
  };
}
