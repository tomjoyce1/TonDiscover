import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toNano } from '@ton/core';
import { ArrowLeft, Check, FileText, Wallet } from 'lucide-react';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { boostOptions } from '@/constants/boost-options.ts';
import { useAppState } from '@/context/app-context.tsx';
import { useTonConnect } from '@/hooks/useTonConnect.ts';
import { BOOST_RECEIVER_RAW, createBoostService } from '@/services/boost/boost-service.ts';

const BoostConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { open } = useTonConnectModal();
  const { sender, connected, walletAddress, tonConnectUI } = useTonConnect();
  const { entities, setBoostState, addBoostEvent, isOwnedEntity } = useAppState();
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const entityId = searchParams.get('entityId') ?? '';
  const optionId = searchParams.get('optionId') ?? '';
  const option = boostOptions.find((item) => item.id === optionId) ?? boostOptions[0];
  const entity = isOwnedEntity(entityId) ? entities.find((item) => item.id === entityId) : undefined;

  const service = useMemo(() => {
    return createBoostService({
      sender,
      connected,
      tonConnectUI,
      openConnectModal: open,
    });
  }, [connected, open, sender, tonConnectUI]);

  const confirm = async () => {
    if (!entity) {
      return;
    }

    setSubmitting(true);
    setStatus('Processing payment...');
    const state = await service.activateBoost(entity.id, option);
    setBoostState(state);

    if (state.source === 'ton') {
      addBoostEvent({
        id: `boost-${entity.id}-${Date.now()}`,
        entityId: entity.id,
        walletAddress: walletAddress?.toString(),
        amountTon: option.amountTon,
        amountNano: toNano(option.amountTon).toString(),
        createdAt: new Date().toISOString(),
        source: state.source,
      });
    }

    setStatus(state.source === 'ton' ? 'TON payment confirmed.' : 'Fallback mock confirmation applied.');
    navigate(`/create/boost/success?entityId=${encodeURIComponent(entity.id)}&source=${encodeURIComponent(state.source)}`);
  };

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link
          to={`/create/boost/connect?entityId=${encodeURIComponent(entityId)}&optionId=${encodeURIComponent(optionId)}`}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Confirm Payment</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Review and confirm your boost</p>
        </div>
      </header>

      <div className="space-y-4 px-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/15">
              <FileText className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Summary</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entity</span>
              <span className="font-medium text-foreground">{entity?.name ?? 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Option</span>
              <span className="font-medium text-foreground">{option.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receiver</span>
              <span className="max-w-[55%] truncate text-right text-xs font-medium text-foreground" title={BOOST_RECEIVER_RAW}>
                {BOOST_RECEIVER_RAW.slice(0, 8)}...{BOOST_RECEIVER_RAW.slice(-6)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/15">
              <Wallet className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Payment</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {status || 'Confirm to activate boost and update feed ranking.'}
          </p>
          {!entity && <p className="mt-2 text-sm text-rose-400">Only your own entities can be boosted.</p>}
        </div>

        <button
          type="button"
          disabled={!entity || submitting}
          onClick={confirm}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 text-[15px] font-bold text-black transition-all active:scale-[0.97] disabled:opacity-40"
        >
          <Check className="h-4 w-4" />
          Confirm Payment
        </button>
      </div>

      <BottomNav />
    </main>
  );
};

export default BoostConfirmation;
