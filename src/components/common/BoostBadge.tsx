type BoostBadgeProps = {
  active: boolean;
  source?: 'mock' | 'ton';
};

export const BoostBadge = ({ active, source }: BoostBadgeProps) => {
  if (!active) {
    return null;
  }

  return (
    <span className="td-boost-badge">
      Boosted {source ? `(${source})` : ''}
    </span>
  );
};
