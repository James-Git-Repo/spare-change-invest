import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useBankConnections() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bank-connections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bank_connections')
        .select('*, bank_accounts(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useBankAccounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bank-accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useInitBankConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ market }: { market: string }) => {
      const redirectUri = `${window.location.origin}/settings?bank_callback=true`;
      
      const { data, error } = await supabase.functions.invoke('open-banking-init', {
        body: { 
          redirect_uri: redirectUri,
          market: market,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-connections'] });
    },
  });
}

export function useSyncBankConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ connectionId }: { connectionId: string }) => {
      const { data, error } = await supabase.functions.invoke('open-banking-sync', {
        body: { connection_id: connectionId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-connections'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDisconnectBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ connectionId }: { connectionId: string }) => {
      const { error } = await supabase
        .from('bank_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-connections'] });
    },
  });
}
