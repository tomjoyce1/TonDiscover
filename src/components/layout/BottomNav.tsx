import { Link, useLocation } from 'react-router-dom';
import { Compass, PlusCircle, User } from 'lucide-react';

const items = [
  { to: '/explore', label: 'Discover', icon: Compass },
  { to: '/create', label: '', icon: PlusCircle },
  { to: '/profile', label: 'Profile', icon: User },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-tg-card border-t border-tg-border safe-area-bottom" aria-label="Primary">
      <div className="flex items-center justify-around h-16 max-w-[680px] mx-auto">
      {items.map((item) => {
        const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
        const isCreate = item.to === '/create';

        if (isCreate) {
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative"
              aria-label="Create"
            >
              <div className="w-12 h-12 rounded-full bg-tg-accent flex items-center justify-center -mt-4 shadow-lg shadow-tg-accent/30">
                <item.icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative"
          >
            <item.icon
              className={active ? 'w-6 h-6 text-tg-accent' : 'w-6 h-6 text-tg-muted'}
              strokeWidth={2}
            />
            <span className={active ? 'text-[10px] font-medium text-tg-accent' : 'text-[10px] font-medium text-tg-muted'}>
              {item.label}
            </span>
            {active && <span className="absolute bottom-1 w-1 h-1 bg-tg-accent rounded-full" />}
          </Link>
        );
      })}
      </div>
    </nav>
  );
};
