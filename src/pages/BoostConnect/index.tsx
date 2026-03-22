import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Wallet } from 'lucide-react';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { useTonConnect } from '@/hooks/useTonConnect.ts';

const BoostConnect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { open } = useTonConnectModal();
  const { connected, walletAddress } = useTonConnect();
  const { featuredContent, isOwnedEntity } = useAppState();
  const targetId = searchParams.get('targetId') ?? searchParams.get('entityId') ?? '';
  const requestedTargetType = searchParams.get('targetType');
  const optionId = searchParams.get('optionId') ?? '';
  const postTarget = featuredContent.find((post) => post.id === targetId);
  const targetType = requestedTargetType === 'post'
    || (requestedTargetType !== 'entity' && Boolean(postTarget))
    ? 'post'
    : 'entity';

  const isAllowedTarget = targetType === 'post'
    ? Boolean(postTarget && isOwnedEntity(postTarget.entityId))
    : isOwnedEntity(targetId);
  const canContinue = Boolean(targetId && optionId && isAllowedTarget);

  const next = () => {
    navigate(`/create/boost/confirmation?targetId=${encodeURIComponent(targetId)}&targetType=${encodeURIComponent(targetType)}&optionId=${encodeURIComponent(optionId)}`);
  };

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link
          to={`/create/boost?targetId=${encodeURIComponent(targetId)}&targetType=${encodeURIComponent(targetType)}`}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Connect Wallet</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Link your TON wallet to continue</p>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Wallet status */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/20">
              <Wallet className="h-4 w-4 text-sky-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Wallet</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Status: {connected ? 'Connected' : 'Not connected'}
          </p>
          {walletAddress && (
            <p className="text-xs text-muted-foreground mt-1 break-all">
              Address: {walletAddress.toString()}
            </p>
          )}
        </div>

        {!isAllowedTarget && (
          <p className="text-xs text-muted-foreground text-center">Only your own entities/posts can be boosted.</p>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={open}
            className="w-full flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-muted/60 text-foreground border border-border/50 font-bold text-[15px] transition-all active:scale-[0.97]"
          >
            Connect Wallet
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canContinue}
            className="w-full flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-primary text-primary-foreground font-bold text-[15px] transition-all active:scale-[0.97] disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
};

export default BoostConnect;
