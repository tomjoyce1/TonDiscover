import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';

const CreatePublishSuccess = () => {
  return (
    <PageShell title="Publish Success">
      <section className="td-card td-stack">
        <h2>Post published</h2>
        <p className="td-muted">Featured content has been updated for the selected entity.</p>
        <Link to="/explore" className="td-link-button td-inline-link">Back to Explore</Link>
      </section>
    </PageShell>
  );
};

export default CreatePublishSuccess;
