import type { BoostOption } from '@/types/tondiscover.ts';

export const boostOptions: BoostOption[] = [
  { id: 'boost-6h', label: '6 hours · 0.01 TON', amountTon: '0.01', durationHours: 6 },
  { id: 'boost-24h', label: '24 hours · 0.03 TON', amountTon: '0.03', durationHours: 24 },
  { id: 'boost-72h', label: '72 hours · 0.07 TON', amountTon: '0.07', durationHours: 72 },
];
