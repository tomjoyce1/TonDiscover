import type { FeaturedContent } from '@/types/tondiscover.ts';

export const seededFeaturedContent: FeaturedContent[] = [
  {
    id: 'ft-ton-news',
    entityId: 'ch-ton-news',
    mode: 'latest',
    contentType: 'text',
    title: 'Weekly digest',
    text: 'Wallet, DeFi, and mini app ecosystem updates in one place.',
  },
  {
    id: 'ft-swap-x',
    entityId: 'app-swap-x',
    mode: 'pinned',
    contentType: 'image',
    title: 'New routing engine',
    mediaUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'ft-raid-quest',
    entityId: 'app-raid-quest',
    mode: 'specific',
    contentType: 'video',
    title: 'Boss fight replay',
    mediaUrl: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
  },
  {
    id: 'ft-builders',
    entityId: 'ch-builders',
    mode: 'manual',
    contentType: 'text',
    title: 'Mini app checklist',
    text: '10-item checklist for hackathon-ready Telegram Mini Apps.',
  },
];
