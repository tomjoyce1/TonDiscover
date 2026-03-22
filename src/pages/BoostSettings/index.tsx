import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, List, Zap } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { buttonStyles } from '@/components/ui/Button.tsx';
import { boostOptions } from '@/constants/boost-options.ts';
import { useAppState } from '@/context/app-context.tsx';
import { cx } from '@/helpers/class-name.ts';

const inputClass = 'w-full h-12 px-4 bg-muted/60 text-foreground rounded-xl border border-border/50 outline-none text-sm placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors';

const BoostSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { ownedEntities, isOwnedEntity } = useAppState();
  const requestedEntityId = searchParams.get('entityId');
  const initialEntityId = requestedEntityId && isOwnedEntity(requestedEntityId)
    ? requestedEntityId
    : ownedEntities[0]?.id ?? '';
  const [entityId, setEntityId] = useState(initialEntityId);
  const [optionId, setOptionId] = useState(boostOptions[0].id);

  const entity = useMemo(
    () => ownedEntities.find((item) => item.id === entityId),
    [ownedEntities, entityId],
  );

  const proceed = () => {
    if (!entityId) {
      return;
    }
    navigate(`/create/boost/connect?entityId=${encodeURIComponent(entityId)}&optionId=${encodeURIComponent(optionId)}`);
  };

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link
          to="/create"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Boost Post</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Select duration and eligible entity</p>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Entity selector */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Your Entity</span>
          </div>
          {ownedEntities.length === 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-3">No eligible content yet. You can only boost entities you created.</p>
              <div className="flex flex-wrap gap-2">
                <Link to="/create/post" className={buttonStyles({ variant: 'primary', size: 'md' })}>
                  Make Post
                </Link>
                <Link to="/create/register" className={buttonStyles({ variant: 'secondary', size: 'md' })}>
                  Add Channel / App
                </Link>
              </div>
            </>
          ) : (
            <select
              value={entityId}
              onChange={(event) => setEntityId(event.target.value)}
              className={inputClass}
            >
              {ownedEntities.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Duration picker */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
              <List className="h-4 w-4 text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Duration</span>
          </div>
          <div className="space-y-2">
            {boostOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setOptionId(option.id)}
                className={cx(
                  'w-full flex items-center justify-between rounded-xl border px-3.5 py-3 text-[13px] font-medium transition-all active:scale-[0.97]',
                  option.id === optionId
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-muted/40 border-border/50 text-muted-foreground',
                )}
              >
                <div className="flex items-center gap-2">
                  {option.id === optionId && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 inline-flex items-center justify-center">
                      <Check className="w-3 h-3 text-black" />
                    </span>
                  )}
                  <span>{option.label}</span>
                </div>
                <span className="font-semibold text-amber-400">{option.amountTon} TON</span>
              </button>
            ))}
          </div>
        </div>

        {entity && (
          <p className="text-xs text-muted-foreground text-center">Selected: {entity.name}</p>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={proceed}
          disabled={!entity}
          className="w-full flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-amber-500 text-black font-bold text-[15px] transition-all active:scale-[0.97] disabled:opacity-40"
        >
          Continue to Connect Wallet
        </button>
      </div>

      <BottomNav />
    </main>
  );
};

export default BoostSettings;
