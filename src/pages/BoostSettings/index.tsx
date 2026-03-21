import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { Button, buttonStyles } from '@/components/ui/Button.tsx';
import { Card, cardStyles } from '@/components/ui/Card.tsx';
import { Select } from '@/components/ui/Input.tsx';
import { boostOptions } from '@/constants/boost-options.ts';
import { useAppState } from '@/context/app-context.tsx';
import { cx } from '@/helpers/class-name.ts';

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
    <PageShell title="Boost Post" backTo="/create">
      <section className="text-center mb-1">
        <div className="w-16 h-16 rounded-full bg-tg-boost/20 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-tg-boost" />
        </div>
        <p className="text-sm text-tg-muted">Select duration and eligible entity.</p>
      </section>

      <Card className="space-y-4">
        {ownedEntities.length === 0 ? (
          <>
            <p className="text-sm text-tg-muted">No eligible content yet. You can only boost entities/posts you created.</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/create/post" className={buttonStyles({ variant: 'primary', size: 'md' })}>
                Make Post
              </Link>
              <Link to="/create/register" className={buttonStyles({ variant: 'secondary', size: 'md' })}>
                Add Channel / App
              </Link>
            </div>
          </>
        ) : (
          <label className="block">
            <span className="block text-sm text-tg-muted mb-2">Your entity</span>
            <Select
              value={entityId}
              onChange={(event) => setEntityId(event.target.value)}
            >
              {ownedEntities.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </Select>
          </label>
        )}

        <div className="space-y-2">
          {boostOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setOptionId(option.id)}
              className={cx(
                cardStyles({ variant: option.id === optionId ? 'boost' : 'muted', padding: 'md' }),
                'w-full flex items-center justify-between',
                option.id === optionId && 'border-2 border-tg-boost',
              )}
            >
              <div className="flex items-center gap-2">
                {option.id === optionId && (
                  <span className="w-5 h-5 rounded-full bg-tg-boost inline-flex items-center justify-center">
                    <Check className="w-3 h-3 text-black" />
                  </span>
                )}
                <span className="text-sm font-medium text-tg-primary">{option.label}</span>
              </div>
              <span className="text-sm font-semibold text-tg-boost">{option.amountTon} TON</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-tg-muted">Selected: {entity?.name ?? 'None'}</p>
        <Button type="button" variant="boost" size="lg" fullWidth onClick={proceed} disabled={!entity}>
          Continue to Connect Wallet
        </Button>
      </Card>
    </PageShell>
  );
};

export default BoostSettings;
