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
import { useBrokerAccount, useCreateBrokerAccount, useSyncPositions } from '@/hooks/useBrokerAccount';
import { TrendingUp, RefreshCw, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { toast } from 'sonner';

interface BrokerAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrokerAccountModal({ open, onOpenChange }: BrokerAccountModalProps) {
  const { data: account, isLoading } = useBrokerAccount();
  const createAccount = useCreateBrokerAccount();
  const syncPositions = useSyncPositions();

  const [formData, setFormData] = useState({
    given_name: '',
    family_name: '',
    date_of_birth: '',
    tax_id: '',
    country_of_citizenship: 'DEU',
    country_of_tax_residence: 'DEU',
    street_address: '',
    city: '',
    postal_code: '',
    country: 'DEU',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAccount.mutateAsync(formData);
      toast.success('Broker account created! KYC review in progress.');
    } catch (error) {
      toast.error('Failed to create broker account');
    }
  };

  const handleSync = async () => {
    try {
      await syncPositions.mutateAsync();
      toast.success('Positions synced');
    } catch (error) {
      toast.error('Failed to sync positions');
    }
  };

  const getStatusIcon = () => {
    switch (account?.kyc_status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-warning" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Broker Account
          </DialogTitle>
          <DialogDescription>
            {account ? 'Manage your investment account' : 'Set up your investment account'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : account ? (
          <div className="space-y-6">
            {/* Account Status */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon()}
                <div>
                  <p className="font-medium">KYC Status</p>
                  <p className="text-sm text-muted-foreground capitalize">{account.kyc_status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Broker</p>
                  <p className="font-medium">{account.broker_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account</p>
                  <p className="font-medium">{account.account_number || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Cash Balance */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Cash Balance</p>
              <p className="text-2xl font-display font-bold">
                <CurrencyDisplay 
                  amount={Number(account.cash_balance) || 0} 
                  currency={(account.currency as 'EUR' | 'CHF') || 'EUR'} 
                />
              </p>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleSync}
              disabled={syncPositions.isPending}
            >
              {syncPositions.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sync Positions
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="given_name">First Name</Label>
                <Input
                  id="given_name"
                  value={formData.given_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, given_name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="family_name">Last Name</Label>
                <Input
                  id="family_name"
                  value={formData.family_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street_address">Street Address</Label>
              <Input
                id="street_address"
                value={formData.street_address}
                onChange={(e) => setFormData(prev => ({ ...prev, street_address: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={createAccount.isPending}>
              {createAccount.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Create Account
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
