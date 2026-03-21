import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useTonConnect } from '@/hooks/useTonConnect.ts';

const BoostConnect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { open } = useTonConnectModal();
  const { connected, walletAddress } = useTonConnect();
  const entityId = searchParams.get('entityId') ?? '';
  const optionId = searchParams.get('optionId') ?? '';

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
          <button type="button" className="td-primary-button" onClick={next} disabled={!entityId || !optionId}>
            Continue
          </button>
        </div>
      </section>
    </PageShell>
  );
};

export default BoostConnect;
