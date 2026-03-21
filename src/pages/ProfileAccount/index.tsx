import { FormEvent, useEffect, useState } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
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
  if (!raw) {
    return defaultAccount;
  }

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
    <PageShell title="Account" backTo="/profile">
      <form className="bg-tg-card border border-tg-border rounded-2xl p-4 space-y-4" onSubmit={save}>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Display name</span>
          <input
            className="w-full h-12 px-4 bg-tg-input text-tg-primary rounded-xl border-none outline-none"
            value={account.displayName}
            onChange={(event) => setAccount((state) => ({ ...state, displayName: event.target.value }))}
          />
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Bio</span>
          <textarea
            className="w-full p-4 bg-tg-input text-tg-primary rounded-xl border-none outline-none resize-none"
            value={account.bio}
            onChange={(event) => setAccount((state) => ({ ...state, bio: event.target.value }))}
          />
        </label>
        <p className="text-sm text-tg-muted">
          Wallet linked: {address ? separateTonAddress(address) : 'No wallet linked'}
        </p>
        <button type="submit" className="w-full h-12 bg-tg-accent text-white font-semibold rounded-full">Save profile</button>
        {savedAt && <p className="text-sm text-tg-muted">Saved at {savedAt}</p>}
      </form>
    </PageShell>
  );
};

export default ProfileAccount;
