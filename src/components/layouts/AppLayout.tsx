import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
