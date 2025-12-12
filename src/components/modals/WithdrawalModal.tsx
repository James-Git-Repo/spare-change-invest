import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBankAccounts } from '@/hooks/useBankConnections';
import { useInitiateWithdrawal } from '@/hooks/useWithdrawals';
import { useVaultBalance } from '@/hooks/useVaultBalance';
import { Wallet, Loader2, CheckCircle, Building2 } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawalModal({ open, onOpenChange }: WithdrawalModalProps) {
  const { data: bankAccounts, isLoading: loadingAccounts } = useBankAccounts();
  const { data: vaultData } = useVaultBalance();
  const initiateWithdrawal = useInitiateWithdrawal();

  const [step, setStep] = useState<'amount' | 'account' | 'confirm' | 'success'>('amount');
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference_number: string } | null>(null);

  const vaultBalance = vaultData?.balance || 0;
  const numericAmount = parseFloat(amount) || 0;
  const selectedBankAccount = bankAccounts?.find(a => a.id === selectedAccount);

  const handleAmountContinue = () => {
    if (numericAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (numericAmount > vaultBalance) {
      toast.error('Amount exceeds vault balance');
      return;
    }
    setStep('account');
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedAccount) return;
    
    try {
      const response = await initiateWithdrawal.mutateAsync({
        amount: numericAmount,
        destinationAccountId: selectedAccount,
      });
      setResult(response);
      setStep('success');
    } catch (error) {
      toast.error('Failed to initiate withdrawal');
    }
  };

  const handleClose = () => {
    setStep('amount');
    setAmount('');
    setSelectedAccount(null);
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Withdraw to Bank
          </DialogTitle>
          <DialogDescription>
            {step === 'amount' && 'Enter the amount to withdraw'}
            {step === 'account' && 'Select destination account'}
            {step === 'confirm' && 'Review and confirm'}
            {step === 'success' && 'Withdrawal initiated'}
          </DialogDescription>
        </DialogHeader>

        {step === 'amount' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-3xl font-display font-bold">
                <CurrencyDisplay amount={vaultBalance} currency="EUR" />
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Withdraw</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  max={vaultBalance}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount((vaultBalance * 0.25).toFixed(2))}
              >
                25%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount((vaultBalance * 0.5).toFixed(2))}
              >
                50%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount((vaultBalance * 0.75).toFixed(2))}
              >
                75%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount(vaultBalance.toFixed(2))}
              >
                Max
              </Button>
            </div>

            <Button 
              className="w-full" 
              onClick={handleAmountContinue}
              disabled={numericAmount <= 0 || numericAmount > vaultBalance}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 'account' && (
          <div className="space-y-4">
            {loadingAccounts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : bankAccounts && bankAccounts.length > 0 ? (
              bankAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleAccountSelect(account.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                    selectedAccount === account.id
                      ? "border-vault bg-vault/5"
                      : "border-border hover:border-border/80"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{account.account_name}</p>
                    <p className="text-sm text-muted-foreground">
                      ****{account.account_number_masked}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No bank accounts connected</p>
              </div>
            )}

            <Button variant="ghost" className="w-full" onClick={() => setStep('amount')}>
              Back
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  <CurrencyDisplay amount={numericAmount} currency="EUR" />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span className="font-medium">{selectedBankAccount?.account_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account</span>
                <span className="font-medium">****{selectedBankAccount?.account_number_masked}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-muted-foreground">Fees</span>
                <span className="font-medium text-success">Free</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('account')}>
                Back
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleConfirm}
                disabled={initiateWithdrawal.isPending}
              >
                {initiateWithdrawal.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Confirm
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div>
              <p className="text-lg font-medium">Withdrawal Initiated</p>
              <p className="text-muted-foreground">
                <CurrencyDisplay amount={numericAmount} currency="EUR" /> is on its way
              </p>
            </div>
            {result?.reference_number && (
              <div className="text-sm text-muted-foreground">
                Reference: {result.reference_number}
              </div>
            )}
            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
