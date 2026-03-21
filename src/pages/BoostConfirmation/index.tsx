import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { boostOptions } from '@/constants/boost-options.ts';
import { useAppState } from '@/context/app-context.tsx';
import { useTonConnect } from '@/hooks/useTonConnect.ts';
import { BOOST_RECEIVER_RAW, createBoostService } from '@/services/boost/boost-service.ts';

const BoostConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { open } = useTonConnectModal();
  const { sender, connected } = useTonConnect();
  const { entities, setBoostState, isOwnedEntity } = useAppState();
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
        <p><strong>Receiver:</strong> {BOOST_RECEIVER_RAW}</p>
        <p className="td-muted">{status || 'Confirm to activate boost and update feed ranking.'}</p>
        {!entity && <p className="td-muted">Only your own entities/posts can be boosted.</p>}
        <button type="button" className="td-primary-button" disabled={!entity || submitting} onClick={confirm}>
          Confirm Payment
        </button>
      </section>
    </PageShell>
  );
};

export default BoostConfirmation;
