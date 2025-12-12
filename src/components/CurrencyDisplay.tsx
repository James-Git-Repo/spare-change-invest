import { REGIONS } from '@/lib/constants';

interface CurrencyDisplayProps {
  amount: number;
  currency?: 'EUR' | 'CHF';
  showSign?: boolean;
  className?: string;
}

export function CurrencyDisplay({ 
  amount, 
  currency = 'EUR', 
  showSign = false,
  className = '' 
}: CurrencyDisplayProps) {
  const region = currency === 'CHF' ? REGIONS.ch : REGIONS.eu;
  const sign = showSign && amount > 0 ? '+' : '';
  
  const formatted = new Intl.NumberFormat(currency === 'CHF' ? 'de-CH' : 'de-DE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <span className={`tabular-nums ${className}`}>
      {sign}{formatted}
    </span>
  );
}
