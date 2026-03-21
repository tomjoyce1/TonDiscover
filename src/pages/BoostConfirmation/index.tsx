import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
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
    <PageShell title="Confirm Payment" backTo="/create/boost/connect">
      <Card>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-tg-muted">Entity</span><span className="text-tg-primary">{entity?.name ?? 'Unknown'}</span></div>
          <div className="flex justify-between"><span className="text-tg-muted">Option</span><span className="text-tg-primary">{option.label}</span></div>
          <div className="flex justify-between"><span className="text-tg-muted">Receiver</span><span className="text-tg-primary">{BOOST_RECEIVER_RAW}</span></div>
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="text-sm text-tg-muted">{status || 'Confirm to activate boost and update feed ranking.'}</p>
        {!entity && <p className="text-sm text-tg-muted">Only your own entities/posts can be boosted.</p>}
        <Button
          type="button"
          variant="boost"
          size="lg"
          fullWidth
          disabled={!entity || submitting}
          onClick={confirm}
        >
          <Check className="w-4 h-4" />
          Confirm Payment
        </Button>
      </Card>
    </PageShell>
  );
};

export default BoostConfirmation;
