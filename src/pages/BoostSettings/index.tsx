import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { boostOptions } from '@/constants/boost-options.ts';
import { useAppState } from '@/context/app-context.tsx';

const BoostSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { ownedEntities, isOwnedEntity } = useAppState();
  const requestedEntityId = searchParams.get('entityId');
  const initialEntityId = requestedEntityId && isOwnedEntity(requestedEntityId)
    ? requestedEntityId
    : ownedEntities[0]?.id ?? '';
  const [entityId, setEntityId] = useState(initialEntityId);
  const [optionId, setOptionId] = useState(boostOptions[0].id);

  const entity = useMemo(
    () => ownedEntities.find((item) => item.id === entityId),
    [ownedEntities, entityId],
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
        {ownedEntities.length === 0 ? (
          <>
            <p className="td-muted">No eligible content yet. You can only boost entities/posts you created.</p>
            <Link to="/create/post" className="td-link-button td-inline-link">Make Post</Link>
            <Link to="/create/register" className="td-link-button td-inline-link">Add Channel / App</Link>
          </>
        ) : (
          <label>
            Your entity
            <select value={entityId} onChange={(event) => setEntityId(event.target.value)}>
              {ownedEntities.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        )}
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
