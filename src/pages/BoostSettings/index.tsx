import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';
import type { BoostOption } from '@/types/tondiscover.ts';

const boostOptions: BoostOption[] = [
  { id: 'boost-6h', label: '6 hours · 0.05 TON', amountTon: '0.05', durationHours: 6 },
  { id: 'boost-24h', label: '24 hours · 0.15 TON', amountTon: '0.15', durationHours: 24 },
  { id: 'boost-72h', label: '72 hours · 0.35 TON', amountTon: '0.35', durationHours: 72 },
];

const BoostSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { entities } = useAppState();
  const initialEntityId = searchParams.get('entityId') ?? entities[0]?.id ?? '';
  const [entityId, setEntityId] = useState(initialEntityId);
  const [optionId, setOptionId] = useState(boostOptions[0].id);

  const entity = useMemo(
    () => entities.find((item) => item.id === entityId),
    [entities, entityId],
  );

  const proceed = () => {
    if (!entityId) {
      return;
    }
    navigate(`/create/boost/connect?entityId=${encodeURIComponent(entityId)}&optionId=${encodeURIComponent(optionId)}`);
  };

  return (
    <PageShell title="Boost Settings" backTo="/create">
      <section className="td-card td-stack">
        <label>
          Entity
          <select value={entityId} onChange={(event) => setEntityId(event.target.value)}>
            {entities.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <div className="td-stack">
          {boostOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={option.id === optionId ? 'td-option td-option-active' : 'td-option'}
              onClick={() => setOptionId(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="td-muted">Selected: {entity?.name ?? 'None'}</p>
        <button type="button" className="td-primary-button" onClick={proceed} disabled={!entity}>
          Continue to Connect Wallet
        </button>
      </section>
    </PageShell>
  );
};

export default BoostSettings;
