import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSweepSettings, useUpdateSweepSettings } from '@/hooks/useSweepSettings';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { REGIONS, RISK_PROFILES, APP_CONFIG } from '@/lib/constants';
import { BankConnectionModal } from '@/components/modals/BankConnectionModal';
import { BrokerAccountModal } from '@/components/modals/BrokerAccountModal';
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight, 
  Calendar,
  TrendingUp,
  Wallet,
  Building2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: settings } = useSweepSettings();
  const updateSettings = useUpdateSweepSettings();

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [brokerModalOpen, setBrokerModalOpen] = useState(false);

  const [localSettings, setLocalSettings] = useState({
    is_active: settings?.is_active ?? true,
    sweep_day: settings?.sweep_day ?? APP_CONFIG.defaultSweepDay,
    monthly_cap: settings?.monthly_cap ?? APP_CONFIG.defaultMonthlyCap,
    minimum_threshold: settings?.minimum_threshold ?? APP_CONFIG.defaultMinimumThreshold,
    risk_profile: settings?.risk_profile ?? 'balanced',
  });

  const handleSettingChange = async (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    await updateSettings.mutateAsync({ [key]: value });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const region = profile?.region ? REGIONS[profile.region] : REGIONS.eu;

  return (
    <div className="pb-4">
      <header className="p-4">
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences</p>
      </header>

      <main className="px-4 space-y-6">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Region</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{region.flag}</span>
                  {region.name}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Round-up Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Round-ups
            </CardTitle>
            <CardDescription>Configure how your spare change is collected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Round-ups</p>
                <p className="text-sm text-muted-foreground">Automatically round up transactions</p>
              </div>
              <Switch
                checked={localSettings.is_active}
                onCheckedChange={(checked) => handleSettingChange('is_active', checked)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Monthly Cap</Label>
                <span className="text-sm font-medium">
                  <CurrencyDisplay amount={localSettings.monthly_cap} currency={region.currency as 'EUR' | 'CHF'} />
                </span>
              </div>
              <Slider
                value={[localSettings.monthly_cap]}
                onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, monthly_cap: value }))}
                onValueCommit={([value]) => handleSettingChange('monthly_cap', value)}
                min={10}
                max={APP_CONFIG.maxMonthlyCap}
                step={10}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                Maximum amount to collect in round-ups per month
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Minimum Investment</Label>
                <span className="text-sm font-medium">
                  <CurrencyDisplay amount={localSettings.minimum_threshold} currency={region.currency as 'EUR' | 'CHF'} />
                </span>
              </div>
              <Slider
                value={[localSettings.minimum_threshold]}
                onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, minimum_threshold: value }))}
                onValueCommit={([value]) => handleSettingChange('minimum_threshold', value)}
                min={5}
                max={50}
                step={5}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                Minimum vault balance required before investing
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sweep Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Monthly Sweep
            </CardTitle>
            <CardDescription>When to invest your collected round-ups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Sweep Day</Label>
              <div className="grid grid-cols-7 gap-1">
                {[1, 5, 10, 15, 20, 25, 28].map((day) => (
                  <Button
                    key={day}
                    variant={localSettings.sweep_day === day ? 'vault' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('sweep_day', day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Day of the month when your vault is invested
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Investment Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Investment Profile
            </CardTitle>
            <CardDescription>Choose your risk tolerance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.values(RISK_PROFILES).map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleSettingChange('risk_profile', profile.id)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all text-left",
                  localSettings.risk_profile === profile.id
                    ? "border-vault bg-vault/5"
                    : "border-border hover:border-border/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${profile.color}20` }}
                  >
                    <TrendingUp className="w-5 h-5" style={{ color: profile.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">{profile.description}</p>
                  </div>
                  {localSettings.risk_profile === profile.id && (
                    <div className="w-6 h-6 rounded-full bg-vault flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent-foreground" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Connections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-between" size="lg" onClick={() => setBankModalOpen(true)}>
              <span className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Bank Accounts
              </span>
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="w-full justify-between" size="lg" onClick={() => setBrokerModalOpen(true)}>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Broker Account
              </span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Other Settings */}
        <Card>
          <CardContent className="p-0">
            <Button variant="ghost" className="w-full justify-between h-14 px-5 rounded-none border-b border-border">
              <span className="flex items-center gap-3">
                <Bell className="w-5 h-5" />
                Notifications
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" className="w-full justify-between h-14 px-5 rounded-none border-b border-border">
              <span className="flex items-center gap-3">
                <Shield className="w-5 h-5" />
                Security & Privacy
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-between h-14 px-5 rounded-none text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <span className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                Sign Out
              </span>
            </Button>
          </CardContent>
        </Card>

        {/* Version */}
        <p className="text-xs text-muted-foreground text-center">
          Kahan v1.0.0 • Made with care in Europe
        </p>

        <BankConnectionModal open={bankModalOpen} onOpenChange={setBankModalOpen} />
        <BrokerAccountModal open={brokerModalOpen} onOpenChange={setBrokerModalOpen} />
      </main>
    </div>
  );
}
