import { Link, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';

const BoostSuccess = () => {
  const [searchParams] = useSearchParams();
  const entityId = searchParams.get('entityId');
  const source = searchParams.get('source') ?? 'mock';

  return (
    <PageShell title="Boost Success">
      <section className="td-card td-stack">
        <h2>Boost activated</h2>
        <p className="td-muted">
          Source: {source}. The boosted label and ranking are now visible in discovery.
        </p>
        {entityId && (
          <Link to={`/entity/${entityId}`} className="td-link-button td-inline-link">
            Open boosted entity
          </Link>
        )}
        <Link to="/explore" className="td-link-button td-inline-link">
          Back to Discovery
        </Link>
      </section>
    </PageShell>
  );
};

export default BoostSuccess;
