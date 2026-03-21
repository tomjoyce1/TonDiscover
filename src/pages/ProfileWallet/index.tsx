import { Link } from 'react-router-dom';
import { useTonAddress, useTonConnectModal, useTonConnectUI } from '@tonconnect/ui-react';
import { ArrowLeft, Copy, CheckCircle2, Unplug, Wallet, Zap } from 'lucide-react';
import { useState } from 'react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { separateTonAddress } from '@/helpers/common-helpers.ts';

const ProfileWallet = () => {
  const address = useTonAddress();
  const { open } = useTonConnectModal();
  const [tonConnectUI] = useTonConnectUI();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link
          to="/profile"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Wallet</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {address ? 'Connected to TON' : 'Not connected'}
          </p>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Wallet status card */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-4">
              <Wallet className="w-7 h-7 text-primary" />
            </div>

            {address ? (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Connected</span>
                </div>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="flex items-center gap-2 mt-2 px-4 py-2.5 rounded-xl bg-muted/60 border border-border/50 transition-all active:scale-[0.97]"
                >
                  <span className="text-sm font-mono text-foreground">{separateTonAddress(address)}</span>
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-base font-semibold text-foreground mb-1">No wallet connected</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[250px]">
                  Connect your TON wallet to boost channels and participate in the ecosystem.
                </p>
              </>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="space-y-2.5">
          {!address ? (
            <button
              type="button"
              onClick={open}
              className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all active:scale-[0.97]"
            >
              <Zap className="h-4 w-4" />
              Connect Wallet
            </button>
          ) : (
            <button
              type="button"
              onClick={() => tonConnectUI.disconnect()}
              className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl border border-border bg-card text-muted-foreground font-semibold text-sm transition-all active:scale-[0.97]"
            >
              <Unplug className="h-4 w-4" />
              Disconnect
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
};

export default ProfileWallet;
