import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';

const CreateHub = () => {
  return (
    <PageShell title="Create">
      <section className="td-card td-stack">
        <h2>Create Hub</h2>
        <Link to="/create/register" className="td-list-link">Register Channel / App</Link>
        <Link to="/create/post" className="td-list-link">Make Post</Link>
        <Link to="/create/boost" className="td-list-link">Boost</Link>
      </section>
    </PageShell>
  );
};

export default CreateHub;
