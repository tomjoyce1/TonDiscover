import { Link, useSearchParams } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';

const BoostSuccess = () => {
  const [searchParams] = useSearchParams();
  const entityId = searchParams.get('entityId');
  const source = searchParams.get('source') ?? 'mock';

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      {/* Header area — no back button, success state */}
      <header className="flex items-center gap-3 px-5 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Boost Activated</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Your entity is now boosted</p>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Success card */}
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
            <Rocket className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Boost activated</h2>
          <p className="text-sm text-muted-foreground">
            The boosted label and ranking are now visible in discovery.
          </p>
        </div>

        {/* Actions */}
        {entityId && (
          <Link
            to={`/entity/${entityId}`}
            className="w-full flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-primary text-primary-foreground font-bold text-[15px] transition-all active:scale-[0.97]"
          >
            Open Boosted Entity
          </Link>
        )}
        <Link
          to="/explore"
          className="w-full flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-muted/60 text-foreground border border-border/50 font-bold text-[15px] transition-all active:scale-[0.97]"
        >
          Back to Discover
        </Link>
      </div>

      <BottomNav />
    </main>
  );
};

export default BoostSuccess;
