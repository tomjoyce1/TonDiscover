import { Chip } from '@/components/ui/Chip.tsx';

type BoostBadgeProps = {
  active: boolean;
  source?: 'mock' | 'ton';
};

export const BoostBadge = ({ active }: BoostBadgeProps) => {
  if (!active) {
    return null;
  }

  return (
    <Chip variant="boost" size="sm" className="pointer-events-none font-semibold text-[10px]">
      Boosted
    </Chip>
  );
};
