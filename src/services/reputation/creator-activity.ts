import { fromNano } from '@ton/core';
import type { BoostEvent, CreatorActivityMetrics } from '@/types/tondiscover.ts';

type CalculateLocalCreatorActivityParams = {
  registeredEntities: Array<{ creatorWalletAddress?: string }>;
  boostEvents: BoostEvent[];
  walletAddress?: string | null;
};

export const EMPTY_CREATOR_ACTIVITY: CreatorActivityMetrics = {
  submittedCount: 0,
  boostedCount: 0,
  totalTonSpentNano: '0',
  totalTonSpentTon: '0',
};

const normalizeWallet = (walletAddress?: string | null) => walletAddress?.trim();

const matchesWallet = (candidate: string | undefined, walletAddress?: string | null) => {
  const normalizedWallet = normalizeWallet(walletAddress);
  if (!normalizedWallet) {
    return true;
  }

  return !candidate || candidate === normalizedWallet;
};

export const calculateLocalCreatorActivity = ({
  registeredEntities,
  boostEvents,
  walletAddress,
}: CalculateLocalCreatorActivityParams): CreatorActivityMetrics => {
  const submittedCount = registeredEntities.filter((entity) => matchesWallet(entity.creatorWalletAddress, walletAddress)).length;
  const verifiedBoosts = boostEvents.filter((event) => event.source === 'ton' && matchesWallet(event.walletAddress, walletAddress));
  const totalTonSpentNano = verifiedBoosts.reduce((sum, event) => sum + BigInt(event.amountNano), 0n);

  return {
    submittedCount,
    boostedCount: verifiedBoosts.length,
    totalTonSpentNano: totalTonSpentNano.toString(),
    totalTonSpentTon: fromNano(totalTonSpentNano),
  };
};

export const getCreatorActivityTier = ({ submittedCount, boostedCount, totalTonSpentNano }: CreatorActivityMetrics): string => {
  const totalTonSpent = BigInt(totalTonSpentNano);

  if (submittedCount >= 5 && boostedCount >= 2 && totalTonSpent >= 50_000_000n) {
    return 'Trusted';
  }

  if (submittedCount >= 3 && boostedCount >= 1) {
    return 'Established';
  }

  if (submittedCount >= 1 || boostedCount >= 1) {
    return 'Active';
  }

  return 'New';
};
