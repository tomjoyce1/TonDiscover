import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTonAddress } from '@tonconnect/ui-react';
import { ArrowLeft, CheckCircle2, User, FileText, Wallet } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { separateTonAddress } from '@/helpers/common-helpers.ts';

type AccountState = {
  displayName: string;
  bio: string;
};

const STORAGE_KEY = 'tondiscover:profile-account';

const defaultAccount: AccountState = {
  displayName: 'TonDiscover User',
  bio: 'Building and discovering Telegram channels + apps.',
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
  const [account, setAccount] = useState<AccountState>(readAccount);
  const [savedAt, setSavedAt] = useState('');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  }, [account]);

  const save = (event: FormEvent) => {
    event.preventDefault();
    setSavedAt(new Date().toLocaleTimeString());
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
          <h1 className="text-xl font-bold tracking-tight text-foreground">Identity</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Profile & security</p>
        </div>
      </header>

      <form className="px-4 space-y-4" onSubmit={save}>
        {/* Display name */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
              <User className="h-4 w-4 text-violet-400" />
            </div>
            <label htmlFor="displayName" className="text-sm font-semibold text-foreground">Display name</label>
          </div>
          <input
            id="displayName"
            className="w-full h-12 px-4 bg-muted/60 text-foreground rounded-xl border border-border/50 outline-none text-sm placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors"
            value={account.displayName}
            onChange={(e) => setAccount((s) => ({ ...s, displayName: e.target.value }))}
            placeholder="Your name"
          />
        </div>

        {/* Bio */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
              <FileText className="h-4 w-4 text-amber-400" />
            </div>
            <label htmlFor="bio" className="text-sm font-semibold text-foreground">Bio</label>
          </div>
          <textarea
            id="bio"
            rows={3}
            className="w-full p-4 bg-muted/60 text-foreground rounded-xl border border-border/50 outline-none text-sm placeholder:text-muted-foreground resize-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors"
            value={account.bio}
            onChange={(e) => setAccount((s) => ({ ...s, bio: e.target.value }))}
            placeholder="A few words about you"
          />
        </div>

        {/* Linked wallet */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/20">
              <Wallet className="h-4 w-4 text-sky-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Linked wallet</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/60 border border-border/50">
            {address ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-sm font-mono text-foreground">{separateTonAddress(address)}</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No wallet linked</span>
            )}
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all active:scale-[0.97]"
        >
          <CheckCircle2 className="h-4 w-4" />
          Save profile
        </button>

        {savedAt && (
          <p className="text-center text-[12px] text-muted-foreground">
            Last saved at {savedAt}
          </p>
        )}
      </form>

      <BottomNav />
    </main>
  );
};

export default ProfileAccount;
