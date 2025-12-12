import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInitBankConnection, useBankConnections, useSyncBankConnection, useDisconnectBank } from '@/hooks/useBankConnections';
import { Building2, RefreshCw, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface BankConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MARKETS = [
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
];

export function BankConnectionModal({ open, onOpenChange }: BankConnectionModalProps) {
  const [step, setStep] = useState<'list' | 'select-market'>('list');
  const { data: connections, isLoading } = useBankConnections();
  const initConnection = useInitBankConnection();
  const syncConnection = useSyncBankConnection();
  const disconnectBank = useDisconnectBank();

  const activeConnections = connections?.filter(c => c.status === 'active') || [];

  const handleConnectBank = async (market: string) => {
    try {
      const result = await initConnection.mutateAsync({ market });
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      }
    } catch (error) {
      toast.error('Failed to initiate bank connection');
    }
  };

  const handleSync = async (connectionId: string) => {
    try {
      const result = await syncConnection.mutateAsync({ connectionId });
      toast.success(`Synced ${result.new_transactions} new transactions`);
    } catch (error) {
      toast.error('Failed to sync transactions');
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await disconnectBank.mutateAsync({ connectionId });
      toast.success('Bank disconnected');
    } catch (error) {
      toast.error('Failed to disconnect bank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Bank Accounts
          </DialogTitle>
          <DialogDescription>
            {step === 'list' 
              ? 'Manage your connected bank accounts'
              : 'Select your country to connect a bank'}
          </DialogDescription>
        </DialogHeader>

        {step === 'list' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeConnections.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">No banks connected yet</p>
                <Button onClick={() => setStep('select-market')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Bank
                </Button>
              </div>
            ) : (
              <>
                {activeConnections.map((connection) => (
                  <div 
                    key={connection.id}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{connection.institution_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {connection.last_sync_at 
                          ? `Synced ${formatDistanceToNow(new Date(connection.last_sync_at))} ago`
                          : 'Never synced'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleSync(connection.id)}
                        disabled={syncConnection.isPending}
                      >
                        <RefreshCw className={`w-4 h-4 ${syncConnection.isPending ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDisconnect(connection.id)}
                        disabled={disconnectBank.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setStep('select-market')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Bank
                </Button>
              </>
            )}
          </div>
        )}

        {step === 'select-market' && (
          <div className="space-y-2">
            {MARKETS.map((market) => (
              <Button
                key={market.code}
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => handleConnectBank(market.code)}
                disabled={initConnection.isPending}
              >
                <span className="text-xl">{market.flag}</span>
                <span>{market.name}</span>
                {initConnection.isPending && (
                  <Loader2 className="w-4 h-4 ml-auto animate-spin" />
                )}
              </Button>
            ))}
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => setStep('list')}
            >
              Back
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
