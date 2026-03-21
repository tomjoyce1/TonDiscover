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
      <form className="td-card td-form" onSubmit={save}>
        <label>
          Display name
          <input
            value={account.displayName}
            onChange={(event) => setAccount((state) => ({ ...state, displayName: event.target.value }))}
          />
        </label>
        <label>
          Bio
          <textarea
            value={account.bio}
            onChange={(event) => setAccount((state) => ({ ...state, bio: event.target.value }))}
          />
        </label>
        <p className="td-muted">
          Wallet linked: {address ? separateTonAddress(address) : 'No wallet linked'}
        </p>
        <button type="submit" className="td-primary-button">Save profile</button>
        {savedAt && <p className="td-muted">Saved at {savedAt}</p>}
      </form>
    </PageShell>
  );
};

export default ProfileAccount;
