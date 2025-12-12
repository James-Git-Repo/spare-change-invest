// Region configuration
export const REGIONS = {
  eu: {
    id: 'eu',
    name: 'European Union',
    flag: '🇪🇺',
    currency: 'EUR',
    currencySymbol: '€',
    bankingProvider: 'PSD2 Open Banking',
  },
  ch: {
    id: 'ch',
    name: 'Switzerland',
    flag: '🇨🇭',
    currency: 'CHF',
    currencySymbol: 'CHF',
    bankingProvider: 'SIX bLink',
  },
} as const;

// Default transaction exclusions
export const DEFAULT_EXCLUSIONS = [
  'ATM Withdrawal',
  'Bank Transfer',
  'Internal Transfer',
  'Tax Payment',
  'Loan Payment',
  'Fee',
  'Refund',
  'Credit Card Payment',
] as const;

// Risk profiles
export const RISK_PROFILES = {
  conservative: {
    id: 'conservative',
    name: 'Conservative',
    description: 'Lower risk, stable returns',
    color: 'hsl(200 80% 50%)',
    allocation: {
      bonds: 70,
      stocks: 20,
      cash: 10,
    },
    expectedReturn: '3-5%',
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced',
    description: 'Moderate risk and returns',
    color: 'hsl(160 84% 39%)',
    allocation: {
      bonds: 40,
      stocks: 50,
      cash: 10,
    },
    expectedReturn: '5-8%',
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    description: 'Higher risk, higher potential',
    color: 'hsl(280 70% 55%)',
    allocation: {
      bonds: 15,
      stocks: 80,
      cash: 5,
    },
    expectedReturn: '8-12%',
  },
} as const;

// Mock ETF portfolio instruments
export const PORTFOLIO_INSTRUMENTS = {
  conservative: [
    { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', weight: 0.40 },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', weight: 0.30 },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', weight: 0.20 },
    { symbol: 'SGOV', name: 'iShares 0-3 Month Treasury Bond ETF', weight: 0.10 },
  ],
  balanced: [
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', weight: 0.30 },
    { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', weight: 0.20 },
    { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', weight: 0.25 },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', weight: 0.15 },
    { symbol: 'SGOV', name: 'iShares 0-3 Month Treasury Bond ETF', weight: 0.10 },
  ],
  growth: [
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', weight: 0.35 },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', weight: 0.25 },
    { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', weight: 0.20 },
    { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', weight: 0.15 },
    { symbol: 'SGOV', name: 'iShares 0-3 Month Treasury Bond ETF', weight: 0.05 },
  ],
} as const;

// App configuration
export const APP_CONFIG = {
  name: 'Kahan',
  tagline: 'Invest your spare change',
  defaultSweepDay: 1,
  defaultMonthlyCap: 50,
  defaultMinimumThreshold: 10,
  maxMonthlyCap: 500,
} as const;
