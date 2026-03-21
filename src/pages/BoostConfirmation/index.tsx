import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { useTonConnect } from '@/hooks/useTonConnect.ts';
import { createBoostService } from '@/services/boost/boost-service.ts';
import type { BoostOption } from '@/types/tondiscover.ts';

const boostOptions: BoostOption[] = [
  { id: 'boost-6h', label: '6 hours · 0.05 TON', amountTon: '0.05', durationHours: 6 },
  { id: 'boost-24h', label: '24 hours · 0.15 TON', amountTon: '0.15', durationHours: 24 },
  { id: 'boost-72h', label: '72 hours · 0.35 TON', amountTon: '0.35', durationHours: 72 },
];

const BoostConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { open } = useTonConnectModal();
  const { sender, connected } = useTonConnect();
  const { entities, setBoostState } = useAppState();
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const entityId = searchParams.get('entityId') ?? '';
  const optionId = searchParams.get('optionId') ?? '';
  const option = boostOptions.find((item) => item.id === optionId) ?? boostOptions[0];
  const entity = entities.find((item) => item.id === entityId);

  const service = useMemo(() => {
    return createBoostService({
      sender,
      connected,
      openConnectModal: open,
    });
  }, [connected, open, sender]);

  const confirm = async () => {
    if (!entity) {
      return;
    }

    setSubmitting(true);
    setStatus('Processing payment...');
    const state = await service.activateBoost(entity.id, option);
    setBoostState(state);
    setStatus(state.source === 'ton' ? 'TON payment confirmed.' : 'Fallback mock confirmation applied.');
    navigate(`/create/boost/success?entityId=${encodeURIComponent(entity.id)}&source=${encodeURIComponent(state.source)}`);
  };

  return (
    <PageShell title="Payment Confirmation" backTo="/create/boost/connect">
      <section className="td-card td-stack">
        <p><strong>Entity:</strong> {entity?.name ?? 'Unknown'}</p>
        <p><strong>Option:</strong> {option.label}</p>
        <p className="td-muted">{status || 'Confirm to activate boost and update feed ranking.'}</p>
        <button type="button" className="td-primary-button" disabled={!entity || submitting} onClick={confirm}>
          Confirm Payment
        </button>
      </section>
    </PageShell>
  );
};

export default BoostConfirmation;
