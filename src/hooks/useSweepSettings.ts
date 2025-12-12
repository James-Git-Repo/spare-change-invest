import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SweepSettings {
  id: string;
  user_id: string;
  is_active: boolean;
  sweep_day: number;
  monthly_cap: number;
  minimum_threshold: number;
  risk_profile: 'conservative' | 'balanced' | 'growth';
  created_at: string;
  updated_at: string;
}

export function useSweepSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sweep_settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('sweep_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as SweepSettings | null;
    },
    enabled: !!user?.id,
  });
}

export function useUpdateSweepSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<SweepSettings>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sweep_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sweep_settings', user?.id] });
      toast.success('Settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update settings');
      console.error('Settings update error:', error);
    },
  });
}
