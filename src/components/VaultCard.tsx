import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { ArrowUpRight, Wallet, TrendingUp, Calendar, ArrowDownToLine, Landmark } from 'lucide-react';
import { useVaultBalance } from '@/hooks/useVaultBalance';
import { usePortfolioValue } from '@/hooks/usePositions';
import { useSweepSettings } from '@/hooks/useSweepSettings';
import { useBankAccounts } from '@/hooks/useBankConnections';
import { WithdrawalModal } from '@/components/modals/WithdrawalModal';

export function VaultCard() {
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const { data: vault, isLoading } = useVaultBalance();
  const { totalValue, returnPercentage } = usePortfolioValue();
  const { data: settings } = useSweepSettings();
  const { data: bankAccounts } = useBankAccounts();

  // Calculate next sweep date
  const getNextSweepDate = () => {
    if (!settings?.sweep_day) return null;
    const now = new Date();
    const sweepDay = settings.sweep_day;
    let nextDate = new Date(now.getFullYear(), now.getMonth(), sweepDay);
    
    if (nextDate <= now) {
      nextDate = new Date(now.getFullYear(), now.getMonth() + 1, sweepDay);
    }
    
    return nextDate;
  };

  const nextSweep = getNextSweepDate();
  const daysUntilSweep = nextSweep 
    ? Math.ceil((nextSweep.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (isLoading) {
    return (
      <Card variant="vault" className="overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 rounded bg-vault/20" />
            <div className="h-10 w-32 rounded bg-vault/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="vault" className="overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-vault/10 blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-vault/10 blur-xl translate-y-1/2 -translate-x-1/2" />
      
      <CardContent className="p-6 relative">
        <div className="flex items-center gap-2 text-vault mb-2">
          <Wallet className="w-5 h-5" />
          <span className="text-sm font-medium">Your Vault</span>
        </div>
        
        <div className="mb-6">
          <div className="font-display text-4xl font-bold text-foreground mb-1">
            <CurrencyDisplay amount={vault?.balance || 0} />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="text-vault font-medium">
              +<CurrencyDisplay amount={vault?.thisMonth || 0} />
            </span>
            {' '}this month
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Portfolio</span>
            </div>
            <div className="font-semibold">
              <CurrencyDisplay amount={totalValue} />
            </div>
            {returnPercentage !== 0 && (
              <div className={`text-xs font-medium flex items-center gap-0.5 ${returnPercentage >= 0 ? 'text-vault' : 'text-destructive'}`}>
                <ArrowUpRight className={`w-3 h-3 ${returnPercentage < 0 ? 'rotate-90' : ''}`} />
                {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Next Sweep</span>
            </div>
            {daysUntilSweep !== null ? (
              <>
                <div className="font-semibold">
                  {daysUntilSweep} days
                </div>
                <div className="text-xs text-muted-foreground">
                  {nextSweep?.toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Not set</div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border/50">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            disabled={!bankAccounts?.length || (vault?.balance || 0) <= 0}
            onClick={() => setWithdrawalOpen(true)}
          >
            <ArrowDownToLine className="w-4 h-4" />
            Withdraw
          </Button>
          <Button 
            variant="default" 
            className="flex-1 gap-2 bg-vault hover:bg-vault/90"
            disabled={(vault?.balance || 0) <= 0}
          >
            <Landmark className="w-4 h-4" />
            Invest
          </Button>
        </div>
      </CardContent>

      <WithdrawalModal open={withdrawalOpen} onOpenChange={setWithdrawalOpen} />
    </Card>
  );
}
