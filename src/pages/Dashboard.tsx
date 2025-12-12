import { Header } from '@/components/Header';
import { VaultCard } from '@/components/VaultCard';
import { TransactionList } from '@/components/TransactionList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, AlertCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: profile } = useProfile();

  return (
    <div className="pb-4">
      <Header />

      <main className="px-4 space-y-6">
        {/* Quick Actions Banner */}
        {!profile?.kyc_completed && (
          <Card variant="outline" className="border-warning/30 bg-warning/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Complete your setup</p>
                <p className="text-xs text-muted-foreground">Connect your bank and broker to start investing</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings">Setup</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Vault Overview */}
        <VaultCard />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Add Bank</span>
          </Button>
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Add Funds</span>
          </Button>
        </div>

        {/* Transactions */}
        <TransactionList />
      </main>
    </div>
  );
}
