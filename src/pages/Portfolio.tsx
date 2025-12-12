import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { usePositions, usePortfolioValue } from '@/hooks/usePositions';
import { useSweepSettings } from '@/hooks/useSweepSettings';
import { RISK_PROFILES, PORTFOLIO_INSTRUMENTS } from '@/lib/constants';
import { ArrowUpRight, PieChart as PieIcon, TrendingUp, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['hsl(160, 84%, 39%)', 'hsl(200, 80%, 50%)', 'hsl(280, 70%, 55%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export default function Portfolio() {
  const { data: positions, isLoading } = usePositions();
  const { totalValue, totalCost, totalReturn, returnPercentage } = usePortfolioValue();
  const { data: settings } = useSweepSettings();

  const riskProfile = settings?.risk_profile || 'balanced';
  const profile = RISK_PROFILES[riskProfile];
  const instruments = PORTFOLIO_INSTRUMENTS[riskProfile];

  // Create chart data from target allocation
  const allocationData = [
    { name: 'Stocks', value: profile.allocation.stocks },
    { name: 'Bonds', value: profile.allocation.bonds },
    { name: 'Cash', value: profile.allocation.cash },
  ];

  return (
    <div className="pb-4">
      <header className="p-4">
        <h1 className="text-2xl font-display font-bold">Portfolio</h1>
        <p className="text-muted-foreground">Your investment overview</p>
      </header>

      <main className="px-4 space-y-6">
        {/* Portfolio Value */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Total Value</span>
            </div>
            <div className="font-display text-4xl font-bold mb-2">
              <CurrencyDisplay amount={totalValue} />
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1 text-sm font-medium ${totalReturn >= 0 ? 'text-vault' : 'text-destructive'}`}>
                <ArrowUpRight className={`w-4 h-4 ${totalReturn < 0 ? 'rotate-90' : ''}`} />
                <CurrencyDisplay amount={totalReturn} showSign />
                <span>({returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%)</span>
              </div>
              <span className="text-sm text-muted-foreground">all time</span>
            </div>
          </CardContent>
        </Card>

        {/* Risk Profile & Allocation */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Your Strategy</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{profile.name} portfolio</p>
            </div>
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${profile.color}20`,
                color: profile.color,
              }}
            >
              {profile.expectedReturn}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${value}%`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {allocationData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm flex-1">{item.name}</span>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holdings */}
        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-16 rounded bg-muted" />
                      <div className="h-3 w-32 rounded bg-muted" />
                    </div>
                    <div className="h-4 w-20 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : positions && positions.length > 0 ? (
              <div className="space-y-3">
                {positions.map((position, index) => (
                  <div key={position.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ 
                        backgroundColor: `${COLORS[index % COLORS.length]}20`,
                        color: COLORS[index % COLORS.length],
                      }}
                    >
                      {position.instrument_symbol.slice(0, 3)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{position.instrument_symbol}</p>
                      <p className="text-xs text-muted-foreground truncate">{position.instrument_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        <CurrencyDisplay amount={position.current_value || position.average_cost * position.quantity} />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {position.quantity.toFixed(4)} shares
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <PieIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">No holdings yet</p>
                <p className="text-sm text-muted-foreground">
                  Your investments will appear here after your first sweep
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Portfolio */}
        <Card variant="outline">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Target Portfolio
              <Info className="w-4 h-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {instruments.map((instrument, index) => (
                <div key={instrument.symbol} className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ 
                      backgroundColor: `${COLORS[index % COLORS.length]}20`,
                      color: COLORS[index % COLORS.length],
                    }}
                  >
                    {instrument.symbol.slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{instrument.symbol}</p>
                    <p className="text-xs text-muted-foreground truncate">{instrument.name}</p>
                  </div>
                  <span className="text-sm font-medium">{(instrument.weight * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclosure */}
        <p className="text-xs text-muted-foreground text-center px-4">
          Past performance is not indicative of future results. Your capital is at risk.
        </p>
      </main>
    </div>
  );
}
