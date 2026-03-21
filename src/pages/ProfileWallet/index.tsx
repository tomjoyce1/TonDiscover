import { useTonAddress, useTonConnectModal, useTonConnectUI } from '@tonconnect/ui-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { separateTonAddress } from '@/helpers/common-helpers.ts';

const ProfileWallet = () => {
  const address = useTonAddress();
  const { open } = useTonConnectModal();
  const [tonConnectUI] = useTonConnectUI();

  return (
    <PageShell title="Wallet" backTo="/profile">
      <section className="td-card td-stack">
        <p className="td-muted">
          {address ? `Connected: ${separateTonAddress(address)}` : 'No wallet connected'}
        </p>
        <div className="td-button-row">
          <button type="button" className="td-primary-button" onClick={open}>
            Connect
          </button>
          <button
            type="button"
            className="td-pill-button"
            onClick={() => tonConnectUI.disconnect()}
            disabled={!address}
          >
            Disconnect
          </button>
        </div>
      </section>
    </PageShell>
  );
};

export default ProfileWallet;
