import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'K';

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="flex items-center justify-between py-4 px-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-border">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-muted-foreground">{greeting()}</p>
          <p className="font-semibold">
            {profile?.full_name || user?.email?.split('@')[0] || 'User'}
          </p>
        </div>
      </div>

      <Button variant="ghost" size="icon-sm" className="relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-vault rounded-full" />
      </Button>
    </header>
  );
}
