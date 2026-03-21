import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
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
      <section className="td-card td-stack">
        <p className="td-muted">
          Wallet status: {connected ? 'Connected' : 'Not connected'}
        </p>
        {walletAddress && <p className="td-muted">Address: {walletAddress.toString()}</p>}
        <div className="td-button-row">
          <button type="button" className="td-pill-button" onClick={open}>
            Connect
          </button>
          <button type="button" className="td-primary-button" onClick={next} disabled={!canContinue}>
            Continue
          </button>
        </div>
        {!isAllowedEntity && <p className="td-muted">Only your own entities/posts can be boosted.</p>}
      </section>
    </PageShell>
  );
};

export default BoostConnect;
