import type { BoostState, Entity, UserPrefs } from '@/types/tondiscover.ts';

type BoostMap = Record<string, BoostState>;

const MAX_PERSONALIZATION_BONUS = 20;
const ACTIVE_BOOST_BONUS = 80;

const now = () => Date.now();

export const isBoostActive = (boost?: BoostState): boolean => {
  if (!boost || boost.status !== 'active' || !boost.expiresAt) {
    return false;
  }

  return new Date(boost.expiresAt).getTime() > now();
};

const getPersonalizationBonus = (entity: Entity, prefs: UserPrefs): number => {
  const categoryWeight = prefs.categoryWeights[entity.category] ?? 0;
  const onboardingBonus = prefs.selectedCategories.includes(entity.category) ? 5 : 0;
  return Math.min(MAX_PERSONALIZATION_BONUS, categoryWeight + onboardingBonus);
};

const getEntityScore = (
  entity: Entity,
  prefs: UserPrefs,
  boosts: BoostMap,
): number => {
  const baseScore = entity.editorialScore + entity.activityScore + entity.engagementScore;
  const boostScore = isBoostActive(boosts[entity.id]) ? ACTIVE_BOOST_BONUS : 0;
  const personalizationBonus = getPersonalizationBonus(entity, prefs);
  return baseScore + boostScore + personalizationBonus;
};

export const getRankedEntities = (
  entities: Entity[],
  prefs: UserPrefs,
  boosts: BoostMap,
): Entity[] => {
  return [...entities].sort((left, right) => {
    return getEntityScore(right, prefs, boosts) - getEntityScore(left, prefs, boosts);
  });
};
