import { useTonAddress, useTonConnectModal, useTonConnectUI } from '@tonconnect/ui-react';
import { Wallet } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { separateTonAddress } from '@/helpers/common-helpers.ts';

const ProfileWallet = () => {
  const address = useTonAddress();
  const { open } = useTonConnectModal();
  const [tonConnectUI] = useTonConnectUI();

  return (
    <PageShell title="Wallet" backTo="/profile">
      <section className="bg-tg-card border border-tg-border rounded-2xl p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-tg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-tg-accent" />
        </div>
        <p className="text-sm text-tg-muted mb-4">
          {address ? `Connected: ${separateTonAddress(address)}` : 'No wallet connected'}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <button type="button" className="h-11 px-4 bg-tg-accent text-white rounded-full font-semibold" onClick={open}>
            Connect
          </button>
          <button
            type="button"
            className="h-11 px-4 bg-tg-input text-tg-primary rounded-full font-semibold"
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
