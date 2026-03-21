import type { FeaturedContent } from '@/types/tondiscover.ts';

export const seededFeaturedContent: FeaturedContent[] = [
  {
    id: 'ft-swap-x',
    entityId: 'app-swap-x',
    mode: 'pinned',
    contentType: 'image',
    title: 'New routing engine',
    mediaUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'ft-ton-news',
    entityId: 'ch-ton-news',
    mode: 'latest',
    contentType: 'image',
    title: 'Weekly digest',
    text: 'Wallet, DeFi, and mini app ecosystem updates.',
    mediaUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'ft-raid-quest',
    entityId: 'app-raid-quest',
    mode: 'specific',
    contentType: 'image',
    title: 'Season 2 launch',
    mediaUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'ft-builders',
    entityId: 'ch-builders',
    mode: 'manual',
    contentType: 'image',
    title: 'Mini app checklist',
    text: '10-item checklist for hackathon-ready Telegram Mini Apps.',
    mediaUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'ft-yield-farm',
    entityId: 'app-yield-farm',
    mode: 'pinned',
    contentType: 'image',
    title: 'New vaults live',
    mediaUrl: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'ft-pixel-arena',
    entityId: 'app-pixel-arena',
    mode: 'latest',
    contentType: 'image',
    title: 'Tournament mode',
    mediaUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
  },
];
