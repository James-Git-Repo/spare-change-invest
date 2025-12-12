import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { Coffee, ShoppingBag, Utensils, Car, Home, Gamepad, Plane, Heart, MoreHorizontal } from 'lucide-react';

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

interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const Icon = getCategoryIcon(transaction.category);
  
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {transaction.merchant_name || 'Unknown'}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(transaction.transaction_date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })}
          {transaction.category && (
            <span className="ml-2">{transaction.category}</span>
          )}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="font-medium text-sm">
          <CurrencyDisplay amount={-Math.abs(transaction.amount)} />
        </p>
        {transaction.roundup_amount > 0 && (
          <p className="text-xs text-vault font-medium">
            +<CurrencyDisplay amount={transaction.roundup_amount} />
          </p>
        )}
      </div>
    </div>
  );
}

export function TransactionList() {
  const { data: transactions, isLoading } = useTransactions(10);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
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
    );
  }

  if (!transactions?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your bank to start tracking
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border/50">
          {transactions.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
