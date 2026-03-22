import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toNano } from '@ton/core';
import { Check, FileText, Wallet } from 'lucide-react';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { boostOptions } from '@/constants/boost-options.ts';
import { useAppState } from '@/context/app-context.tsx';
import { useTonConnect } from '@/hooks/useTonConnect.ts';
import { BOOST_RECEIVER_RAW, createBoostService } from '@/services/boost/boost-service.ts';

const BoostConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { open } = useTonConnectModal();
  const { sender, connected, walletAddress, tonConnectUI } = useTonConnect();
  const { entities, featuredContent, setBoostState, addBoostEvent, isOwnedEntity } = useAppState();
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const targetId = searchParams.get('targetId') ?? searchParams.get('entityId') ?? '';
  const requestedTargetType = searchParams.get('targetType');
  const optionId = searchParams.get('optionId') ?? '';
  const option = boostOptions.find((item) => item.id === optionId) ?? boostOptions[0];
  const postTarget = featuredContent.find((post) => post.id === targetId);
  const targetType = requestedTargetType === 'post'
    || (requestedTargetType !== 'entity' && Boolean(postTarget))
    ? 'post'
    : 'entity';
  const targetEntityId = targetType === 'post' ? (postTarget?.entityId ?? '') : targetId;
  const targetEntity = entities.find((item) => item.id === targetEntityId);
  const targetName = targetType === 'post'
    ? (postTarget?.title?.trim() || `${targetEntity?.name ?? 'Unknown'} post`)
    : (targetEntity?.name ?? 'Unknown');
  const isAllowedTarget = targetType === 'post'
    ? Boolean(postTarget && isOwnedEntity(postTarget.entityId))
    : isOwnedEntity(targetId);
  const backTo = `/create/boost/connect?targetId=${encodeURIComponent(targetId)}&targetType=${encodeURIComponent(targetType)}&optionId=${encodeURIComponent(optionId)}`;

  const service = useMemo(() => {
    return createBoostService({
      sender,
      connected,
      tonConnectUI,
      openConnectModal: open,
    });
  }, [connected, open, sender, tonConnectUI]);

  const confirm = async () => {
    if (!targetId || !isAllowedTarget) {
      return;
    }

    setSubmitting(true);
    setStatus('Processing payment...');
    const boostTargetId = targetType === 'post' ? targetId : (targetEntityId || targetId);
    const state = await service.activateBoost(boostTargetId, option);
    setBoostState(state);

    if (state.source === 'ton') {
      addBoostEvent({
        id: `boost-${targetId}-${Date.now()}`,
        entityId: boostTargetId,
        walletAddress: walletAddress?.toString(),
        amountTon: option.amountTon,
        amountNano: toNano(option.amountTon).toString(),
        createdAt: new Date().toISOString(),
        source: state.source,
      });
    }

    setStatus(state.source === 'ton' ? 'TON payment confirmed.' : 'Fallback mock confirmation applied.');
    navigate(`/create/boost/success?targetId=${encodeURIComponent(targetId)}&targetType=${encodeURIComponent(targetType)}&source=${encodeURIComponent(state.source)}`);
  };

  return (
    <PageShell
      title="Confirm Boost"
      subtitle="Review details before activating visibility boost."
      backTo={backTo}
    >
      <Card variant="boost" className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-tg-boost" />
          <p className="text-sm font-semibold text-tg-primary">Boost Summary</p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="text-tg-muted">Target</span>
            <span className="text-right font-medium text-tg-primary">{targetName}</span>
          </div>
          {targetType === 'post' && (
            <div className="flex items-start justify-between gap-3">
              <span className="text-tg-muted">Parent entity</span>
              <span className="text-right font-medium text-tg-primary">{targetEntity?.name ?? 'Unknown'}</span>
            </div>
          )}
          <div className="flex items-start justify-between gap-3">
            <span className="text-tg-muted">Type</span>
            <span className="font-medium capitalize text-tg-primary">{targetType}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-tg-muted">Boost option</span>
            <span className="font-medium text-tg-primary">{option.label}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-tg-muted">Receiver</span>
            <span className="max-w-[58%] truncate text-right font-mono text-xs text-tg-primary" title={BOOST_RECEIVER_RAW}>
              {BOOST_RECEIVER_RAW}
            </span>
          </div>
        </div>
      </Card>

      <Card variant="muted" className="space-y-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-tg-accent" />
          <p className="text-sm font-semibold text-tg-primary">Payment Status</p>
        </div>
        <p className="text-sm text-tg-muted">
          {status || 'Confirm to activate boost and update feed ranking for all users.'}
        </p>
        {!isAllowedTarget && (
          <p className="text-sm text-rose-300">Only your own entities or posts can be boosted.</p>
        )}
      </Card>

      <Button
        type="button"
        variant="boost"
        size="lg"
        fullWidth
        disabled={!isAllowedTarget || submitting}
        onClick={confirm}
      >
        {submitting ? <Wallet className="w-4 h-4" /> : <Check className="w-4 h-4" />}
        {submitting ? 'Processing...' : 'Confirm Boost'}
      </Button>
      {!isAllowedTarget && (
        <Button type="button" variant="secondary" size="lg" fullWidth onClick={() => navigate('/create/boost')}>
          <Check className="h-4 w-4" />
          Back to Boost Setup
        </Button>
      )}
    </PageShell>
  );
};

export default BoostConfirmation;
