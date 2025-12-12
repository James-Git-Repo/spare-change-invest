import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Wallet, TrendingUp, Shield, Building2, Zap, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  const features = [
    {
      icon: Wallet,
      title: 'Automatic Round-ups',
      description: 'Every purchase rounds up to the nearest euro or franc. Your spare change adds up fast.',
    },
    {
      icon: TrendingUp,
      title: 'Smart Investing',
      description: 'Monthly automated investments into diversified ETF portfolios matched to your risk profile.',
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'PSD2 compliant in EU, SIX bLink in Switzerland. No credentials stored, full consent control.',
    },
    {
      icon: Building2,
      title: 'Regulated Partners',
      description: 'Your investments held by licensed brokers. Kahan never touches your money.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-vault flex items-center justify-center">
            <span className="text-accent-foreground font-display font-bold text-lg">K</span>
          </div>
          <span className="font-display font-bold text-xl">Kahan</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Button variant="vault" asChild>
              <Link to="/dashboard">
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="vault" asChild>
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 pt-16 pb-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vault/10 text-vault text-sm font-medium mb-6">
          <Globe className="w-4 h-4" />
          Available in EU & Switzerland
        </div>
        
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
          Turn spare change into
          <span className="block text-vault">real investments</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Kahan rounds up your everyday purchases and automatically invests the difference. 
          Build wealth without thinking about it.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="vault" size="xl" asChild>
            <Link to="/auth">
              Start Investing Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button variant="outline" size="xl">
            See How It Works
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Bank-level encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>No account minimums</span>
          </div>
        </div>
      </section>

      {/* Demo Visual */}
      <section className="px-4 pb-24">
        <div className="max-w-sm mx-auto">
          <Card variant="elevated" className="overflow-hidden">
            <div className="gradient-hero p-6 pb-8">
              <div className="text-primary-foreground/80 text-sm mb-1">Your Vault</div>
              <div className="text-4xl font-display font-bold text-primary-foreground mb-4">€127.43</div>
              <div className="text-sm text-primary-foreground/80">
                +€23.50 this month
              </div>
            </div>
            <CardContent className="p-4 -mt-4">
              <Card className="bg-background">
                <CardContent className="p-4 space-y-3">
                  {[
                    { merchant: 'Coffee Shop', amount: -4.20, roundup: 0.80 },
                    { merchant: 'Grocery Store', amount: -47.63, roundup: 0.37 },
                    { merchant: 'Restaurant', amount: -32.50, roundup: 0.50 },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{tx.merchant}</p>
                        <p className="text-xs text-muted-foreground">€{Math.abs(tx.amount).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-vault">+€{tx.roundup.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
            Investing made effortless
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Connect your bank, set your preferences, and watch your wealth grow automatically.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} variant="interactive" className="p-6">
                <div className="w-12 h-12 rounded-xl bg-vault/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-vault" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 pb-24 bg-secondary/30">
        <div className="max-w-4xl mx-auto py-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            How Kahan works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect',
                description: 'Securely link your bank account via open banking. Your credentials are never stored.',
              },
              {
                step: '02',
                title: 'Collect',
                description: 'Every eligible purchase is rounded up. The difference goes into your Vault.',
              },
              {
                step: '03',
                title: 'Invest',
                description: 'Once a month, your Vault is automatically invested according to your profile.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl gradient-vault mx-auto mb-4 flex items-center justify-center">
                  <span className="text-accent-foreground font-display font-bold text-xl">{item.step}</span>
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Ready to grow your wealth?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands already investing their spare change with Kahan.
          </p>
          <Button variant="vault" size="xl" asChild>
            <Link to="/auth">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-vault flex items-center justify-center">
              <span className="text-accent-foreground font-display font-bold text-sm">K</span>
            </div>
            <span className="font-display font-semibold">Kahan</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            Your funds and investments are held by regulated third-party providers. 
            Capital at risk.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Disclosures</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
