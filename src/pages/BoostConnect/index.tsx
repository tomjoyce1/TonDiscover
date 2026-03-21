import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { useTonConnect } from '@/hooks/useTonConnect.ts';

const BoostConnect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { open } = useTonConnectModal();
  const { connected, walletAddress } = useTonConnect();
  const { isOwnedEntity } = useAppState();
  const entityId = searchParams.get('entityId') ?? '';
  const optionId = searchParams.get('optionId') ?? '';
  const isAllowedEntity = isOwnedEntity(entityId);
  const canContinue = Boolean(entityId && optionId && isAllowedEntity);

  const next = () => {
    navigate(`/create/boost/confirmation?entityId=${encodeURIComponent(entityId)}&optionId=${encodeURIComponent(optionId)}`);
  };

  return (
    <PageShell title="Connect Wallet" backTo="/create/boost">
      <section className="text-center mb-1">
        <div className="w-16 h-16 rounded-full bg-tg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-tg-accent" />
        </div>
        <p className="text-sm text-tg-muted">
          Wallet status: {connected ? 'Connected' : 'Not connected'}
        </p>
        {walletAddress && <p className="text-xs text-tg-muted mt-1">Address: {walletAddress.toString()}</p>}
      </section>

      <Card className="space-y-3">
        <Button type="button" variant="secondary" size="lg" fullWidth onClick={open}>
          Connect
        </Button>
        <Button type="button" variant="primary" size="lg" fullWidth onClick={next} disabled={!canContinue}>
          Continue
        </Button>
        {!isAllowedEntity && <p className="text-sm text-tg-muted">Only your own entities/posts can be boosted.</p>}
      </Card>
    </PageShell>
  );
};

export default BoostConnect;
