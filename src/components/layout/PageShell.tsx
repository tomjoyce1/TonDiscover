import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { buttonStyles } from '@/components/ui/Button.tsx';

type PageShellProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  backTo?: string;
}>;

export const PageShell = ({ title, subtitle, backTo, children }: PageShellProps) => {
  return (
    <div className="min-h-screen bg-tg-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-tg-bg border-b border-white/[0.04] safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          {backTo ? (
            <Link
              to={backTo}
              className={buttonStyles({
                variant: 'ghost',
                size: 'icon',
                className: '-ml-2',
              })}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-tg-primary" />
            </Link>
          ) : (
            <div className="w-9" />
          )}
          <h1 className="font-semibold text-tg-primary">{title}</h1>
          <div className="w-9" />
        </div>
        {subtitle && <p className="px-4 pb-3 text-sm text-tg-muted">{subtitle}</p>}
      </header>
      <main className="flex-1 pb-20 overflow-y-auto">
        <div className="p-4 space-y-3">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
