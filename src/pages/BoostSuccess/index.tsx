import { Link, useSearchParams } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { buttonStyles } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';

const BoostSuccess = () => {
  const [searchParams] = useSearchParams();
  const entityId = searchParams.get('entityId');
  const source = searchParams.get('source') ?? 'mock';

  return (
    <PageShell title="Boost Activated">
      <Card padding="lg" className="text-center">
        <div className="w-20 h-20 rounded-full bg-tg-success/20 flex items-center justify-center mx-auto mb-5">
          <Rocket className="w-10 h-10 text-tg-success" />
        </div>
        <h2 className="text-xl font-bold text-tg-primary mb-2">Boost activated</h2>
        <p className="text-sm text-tg-muted mb-5">
          Source: {source}. The boosted label and ranking are now visible in discovery.
        </p>
        <div className="flex flex-col gap-2">
          {entityId && (
            <Link to={`/entity/${entityId}`} className={buttonStyles({ variant: 'primary', size: 'lg', fullWidth: true })}>
              Open boosted entity
            </Link>
          )}
          <Link to="/explore" className={buttonStyles({ variant: 'secondary', size: 'lg', fullWidth: true })}>
            Back to Discover
          </Link>
        </div>
      </Card>
    </PageShell>
  );
};

export default BoostSuccess;
