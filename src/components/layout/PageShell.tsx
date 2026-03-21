import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav.tsx';

type PageShellProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  backTo?: string;
}>;

export const PageShell = ({ title, subtitle, backTo, children }: PageShellProps) => {
  return (
    <div className="td-page">
      <header className="td-header">
        <div className="td-header-row">
          {backTo
            ? <Link to={backTo} className="td-back-link">←</Link>
            : <span className="td-back-link td-back-link-placeholder">←</span>}
          <h1>{title}</h1>
        </div>
        {subtitle && <p className="td-muted">{subtitle}</p>}
      </header>
      <main className="td-container td-container-with-bottom-nav">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
