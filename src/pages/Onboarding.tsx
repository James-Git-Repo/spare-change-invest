import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateProfile } from '@/hooks/useProfile';
import { REGIONS, RISK_PROFILES } from '@/lib/constants';
import { Check, ChevronRight, Building2, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 'region' | 'bank' | 'risk' | 'complete';

export default function Onboarding() {
  const [step, setStep] = useState<Step>('region');
  const [selectedRegion, setSelectedRegion] = useState<'eu' | 'ch'>('eu');
  const [selectedRisk, setSelectedRisk] = useState<'conservative' | 'balanced' | 'growth'>('balanced');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateProfile.mutateAsync({
        region: selectedRegion,
        onboarding_completed: true,
      });
      toast.success('Welcome to Kahan!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'region':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h1 className="text-2xl font-display font-bold mb-2">Where are you based?</h1>
              <p className="text-muted-foreground">We'll configure your banking connectivity</p>
            </div>

            <div className="space-y-3">
              {Object.values(REGIONS).map((region) => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region.id as 'eu' | 'ch')}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4",
                    selectedRegion === region.id
                      ? "border-vault bg-vault/5"
                      : "border-border hover:border-border/80 hover:bg-secondary/50"
                  )}
                >
                  <span className="text-3xl">{region.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{region.name}</p>
                    <p className="text-sm text-muted-foreground">{region.bankingProvider}</p>
                  </div>
                  {selectedRegion === region.id && (
                    <div className="w-6 h-6 rounded-full bg-vault flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button variant="vault" size="lg" className="w-full" onClick={() => setStep('bank')}>
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        );

      case 'bank':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h1 className="text-2xl font-display font-bold mb-2">Connect Your Bank</h1>
              <p className="text-muted-foreground">Securely link your account via open banking</p>
            </div>

            <Card variant="outline" className="text-center py-8">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Bank Connection</p>
                  <p className="text-sm text-muted-foreground">
                    In production, this would open the {selectedRegion === 'eu' ? 'PSD2' : 'SIX bLink'} consent flow
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Bank-grade security</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button variant="vault" size="lg" className="w-full" onClick={() => setStep('risk')}>
                Connect Bank (Demo)
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="lg" className="w-full" onClick={() => setStep('risk')}>
                Skip for now
              </Button>
            </div>
          </div>
        );

      case 'risk':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h1 className="text-2xl font-display font-bold mb-2">Investment Profile</h1>
              <p className="text-muted-foreground">Choose how your spare change gets invested</p>
            </div>

            <div className="space-y-3">
              {Object.values(RISK_PROFILES).map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setSelectedRisk(profile.id as typeof selectedRisk)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all",
                    selectedRisk === profile.id
                      ? "border-vault bg-vault/5"
                      : "border-border hover:border-border/80 hover:bg-secondary/50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${profile.color}20` }}
                    >
                      <TrendingUp 
                        className="w-5 h-5" 
                        style={{ color: profile.color }}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{profile.name}</p>
                        {selectedRisk === profile.id && (
                          <div className="w-5 h-5 rounded-full bg-vault flex items-center justify-center">
                            <Check className="w-3 h-3 text-accent-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{profile.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Expected return: {profile.expectedReturn} annually
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <Button 
              variant="vault" 
              size="lg" 
              className="w-full" 
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = ['region', 'bank', 'risk'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen flex flex-col bg-background p-4">
      {/* Progress */}
      <div className="max-w-md mx-auto w-full mb-8">
        <div className="flex gap-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= currentStepIndex ? "bg-vault" : "bg-border"
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          {renderStep()}
        </div>
      </div>

      {/* Disclosures */}
      <div className="max-w-md mx-auto w-full mt-8">
        <p className="text-xs text-muted-foreground text-center">
          Your funds and investments are held by regulated third-party providers. 
          Kahan does not hold custody of your assets.
        </p>
      </div>
    </div>
  );
}
