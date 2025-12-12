import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { Coffee, ShoppingBag, Utensils, Car, Home, Gamepad, Plane, Heart, MoreHorizontal, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Food & Dining': Utensils,
  'Coffee': Coffee,
  'Shopping': ShoppingBag,
  'Transport': Car,
  'Housing': Home,
  'Entertainment': Gamepad,
  'Travel': Plane,
  'Health': Heart,
};

function getCategoryIcon(category: string | null) {
  if (!category) return MoreHorizontal;
  return CATEGORY_ICONS[category] || MoreHorizontal;
}

export default function Transactions() {
  const { data: transactions, isLoading } = useTransactions(100);
  const [search, setSearch] = useState('');
  const [filterEligible, setFilterEligible] = useState(false);

  const filteredTransactions = (transactions || []).filter(tx => {
    const matchesSearch = !search || 
      tx.merchant_name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.category?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !filterEligible || (tx.is_eligible_for_roundup && !tx.is_excluded);
    return matchesSearch && matchesFilter;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = new Date(tx.transaction_date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

  // Calculate totals
  const totalRoundups = filteredTransactions.reduce((sum, tx) => sum + (tx.roundup_amount || 0), 0);

  return (
    <div className="pb-4">
      <header className="p-4">
        <h1 className="text-2xl font-display font-bold">Activity</h1>
        <p className="text-muted-foreground">Your transactions and round-ups</p>
      </header>

      <main className="px-4 space-y-4">
        {/* Summary */}
        <Card variant="vault">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Round-ups</p>
                <p className="text-2xl font-display font-bold text-vault">
                  <CurrencyDisplay amount={totalRoundups} />
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-display font-bold">{filteredTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={filterEligible ? 'accent' : 'outline'}
            size="icon"
            onClick={() => setFilterEligible(!filterEligible)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 rounded bg-muted" />
                      <div className="h-3 w-16 rounded bg-muted" />
                    </div>
                    <div className="h-4 w-16 rounded bg-muted" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : Object.keys(groupedTransactions).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
                <Card>
                  <CardContent className="p-0">
                    {txs.map((tx) => {
                      const Icon = getCategoryIcon(tx.category);
                      return (
                        <div 
                          key={tx.id} 
                          className="flex items-center gap-3 p-4 border-b border-border/50 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {tx.merchant_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.category || 'Uncategorized'}
                              {tx.is_excluded && (
                                <span className="ml-2 text-warning">Excluded</span>
                              )}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="font-medium text-sm">
                              <CurrencyDisplay amount={-Math.abs(tx.amount)} />
                            </p>
                            {tx.roundup_amount > 0 && (
                              <p className="text-xs text-vault font-medium">
                                +<CurrencyDisplay amount={tx.roundup_amount} />
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No transactions found</p>
              {search && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setSearch('')}
                >
                  Clear search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
