import { Link, useLocation } from 'react-router-dom';
import { Compass, Plus, User } from 'lucide-react';
import { cx } from '@/helpers/class-name.ts';

export const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-end justify-around border-t border-border bg-background/95 pb-2 backdrop-blur-md safe-area-bottom">
      <Link
        to="/explore"
        className={cx(
          'flex flex-col items-center gap-0.5 px-5 pt-2 pb-1 rounded-xl transition-colors',
          pathname === '/explore' || pathname === '/' ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <Compass className="h-5 w-5" />
        <span className="text-[10px] font-medium tracking-wide">Discover</span>
      </Link>

      <Link to="/create" className="flex flex-col items-center -mt-5" aria-label="Create">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-transform active:scale-95">
          <Plus className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
        </div>
      </Link>

      <Link
        to="/profile"
        className={cx(
          'flex flex-col items-center gap-0.5 px-5 pt-2 pb-1 rounded-xl transition-colors',
          pathname.startsWith('/profile') ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <User className="h-5 w-5" />
        <span className="text-[10px] font-medium tracking-wide">Profile</span>
      </Link>
    </nav>
  );
};
