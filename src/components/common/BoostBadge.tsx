import { Chip } from '@/components/ui/Chip.tsx';

type BoostBadgeProps = {
  active: boolean;
  source?: 'mock' | 'ton';
};

export const BoostBadge = ({ active, source }: BoostBadgeProps) => {
  if (!active) {
    return null;
  }

  return (
    <Chip variant="boost" size="sm" className="font-semibold text-[10px]">
      Boosted {source ? `(${source})` : ''}
    </Chip>
  );
};
