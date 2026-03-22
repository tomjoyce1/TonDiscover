import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTonAddress } from '@tonconnect/ui-react';
import { ArrowLeft, CheckCircle2, FileText, Link2, ShieldCheck, User, Wallet } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { separateTonAddress } from '@/helpers/common-helpers.ts';
import { useTonConnect } from '@/hooks/useTonConnect.ts';
import { calculateLocalCreatorActivity, getCreatorActivityTier } from '@/services/reputation/creator-activity.ts';
import {
  buildLocalReputationSnapshot,
  getOnChainReputation,
  getReputationContractAddress,
} from '@/services/reputation/reputation-contract.ts';
import type { ReputationSnapshot } from '@/types/tondiscover.ts';

type AccountState = {
  displayName: string;
  bio: string;
  avatarUrl: string;
};

const STORAGE_KEY = 'tondiscover:profile-account';

const defaultAccount: AccountState = {
  displayName: 'TonDiscover User',
  bio: 'Building and discovering Telegram channels + apps.',
  avatarUrl: '',
};

const readAccount = (): AccountState => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultAccount;
  try {
    return { ...defaultAccount, ...(JSON.parse(raw) as Partial<AccountState>) };
  } catch {
    return defaultAccount;
  }
};

const ProfileAccount = () => {
  const address = useTonAddress();
  const { walletAddress, tonClient } = useTonConnect();
  const { savedEntities, boostEvents } = useAppState();
  const contractAddress = getReputationContractAddress();
  const [account, setAccount] = useState<AccountState>(readAccount);
  const [savedAt, setSavedAt] = useState('');
  const [reputation, setReputation] = useState<ReputationSnapshot>(() =>
    buildLocalReputationSnapshot({
      submittedCount: 0,
      boostedCount: 0,
      totalTonSpentNano: '0',
      totalTonSpentTon: '0',
    }),
  );
  const [isLoadingReputation, setIsLoadingReputation] = useState(false);
  const [hasTonReputation, setHasTonReputation] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    const localMetrics = calculateLocalCreatorActivity({
      registeredEntities: savedEntities,
      boostEvents,
      walletAddress: walletAddress?.toString(),
    });
    setReputation((previousState) => {
      if (hasTonReputation) {
        return previousState;
      }

      return buildLocalReputationSnapshot(localMetrics);
    });
  }, [boostEvents, hasTonReputation, savedEntities, walletAddress]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;

    const loadOnChainReputation = async () => {
      if (!walletAddress || !contractAddress || !tonClient) {
        setIsLoadingReputation(false);
        return;
      }

      setIsLoadingReputation(true);
      timeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setIsLoadingReputation(false);
        }
      }, 8000);

      const onChainReputation = await getOnChainReputation(tonClient, walletAddress);
      if (cancelled) {
        return;
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      if (onChainReputation) {
        setReputation(onChainReputation);
        setHasTonReputation(true);
      }

      setIsLoadingReputation(false);
    };

    void loadOnChainReputation();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [contractAddress, tonClient, walletAddress]);

  const save = (event: FormEvent) => {
    event.preventDefault();
    setSavedAt(new Date().toLocaleTimeString());
  };

  const status = getCreatorActivityTier(reputation);
  const sourceLabel = 'Smart contract data';
  const showSyncing = Boolean(walletAddress && contractAddress && tonClient && isLoadingReputation);

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link
          to="/profile"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Identity</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Profile & security</p>
        </div>
      </header>

      <form className="space-y-4 px-4" onSubmit={save}>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/15">
              <User className="h-4 w-4 text-violet-400" />
            </div>
            <label htmlFor="displayName" className="text-sm font-semibold text-foreground">
              Display name
            </label>
          </div>
          <input
            id="displayName"
            className="h-12 w-full rounded-xl border border-border/50 bg-muted/60 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
            value={account.displayName}
            onChange={(e) => setAccount((s) => ({ ...s, displayName: e.target.value }))}
            placeholder="Your name"
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/15">
              <FileText className="h-4 w-4 text-amber-400" />
            </div>
            <label htmlFor="bio" className="text-sm font-semibold text-foreground">
              Bio
            </label>
          </div>
          <textarea
            id="bio"
            rows={3}
            className="w-full resize-none rounded-xl border border-border/50 bg-muted/60 p-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
            value={account.bio}
            onChange={(e) => setAccount((s) => ({ ...s, bio: e.target.value }))}
            placeholder="A few words about you"
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/15">
              <Link2 className="h-4 w-4 text-emerald-400" />
            </div>
            <label htmlFor="avatarUrl" className="text-sm font-semibold text-foreground">
              Profile picture URL
            </label>
          </div>
          <input
            id="avatarUrl"
            className="h-12 w-full rounded-xl border border-border/50 bg-muted/60 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
            value={account.avatarUrl}
            onChange={(e) => setAccount((s) => ({ ...s, avatarUrl: e.target.value }))}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/15">
              <Wallet className="h-4 w-4 text-sky-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Linked wallet</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/60 px-4 py-3">
            {address ? (
              <>
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" />
                <span className="font-mono text-sm text-foreground">{separateTonAddress(address)}</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No wallet linked</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/15">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Creator Activity</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">Wallet-linked discovery reputation</p>
              </div>
            </div>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {status}
            </span>
          </div>

          {!walletAddress ? (
            <p className="text-sm text-muted-foreground">
              Connect a wallet to track submission count, boosts, and TON spent on-chain.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-border/50 bg-muted/60 px-3 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Submitted</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{reputation.submittedCount}</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/60 px-3 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Boosts</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{reputation.boostedCount}</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/60 px-3 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">TON Spent</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{reputation.totalTonSpentTon}</p>
                </div>
              </div>
              <p className="mt-3 text-[12px] text-muted-foreground">
                {sourceLabel}
                {showSyncing ? ' · syncing...' : ''}
              </p>
            </>
          )}
        </div>

        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all active:scale-[0.97]"
        >
          <CheckCircle2 className="h-4 w-4" />
          Save profile
        </button>

        {savedAt && <p className="text-center text-[12px] text-muted-foreground">Last saved at {savedAt}</p>}
      </form>

      <BottomNav />
    </main>
  );
};

export default ProfileAccount;
