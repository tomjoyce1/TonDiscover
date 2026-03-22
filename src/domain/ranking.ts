import type { BoostState, Entity, UserPrefs } from '@/types/tondiscover.ts';

type BoostMap = Record<string, BoostState>;

const MAX_PERSONALIZATION_BONUS = 90;
const MIN_PERSONALIZATION_BONUS = -25;
// Keep boosts clearly visible in the feed order for demo users.
const ACTIVE_BOOST_BONUS = 1000;
const RANDOM_JITTER_RANGE = 8;
const ONBOARDING_MATCH_BONUS = 12;
const NON_SELECTED_CATEGORY_PENALTY = 8;
const CATEGORY_REPEAT_PENALTY = 12;
const DIVERSITY_WINDOW = 3;
const FEED_SESSION_SEED = Math.floor(Math.random() * 1_000_000_000).toString(36);

const now = () => Date.now();

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const getSessionJitter = (entityId: string): number => {
  const normalized = hashString(`${entityId}:${FEED_SESSION_SEED}`) / 0xffffffff;
  return ((normalized * 2) - 1) * RANDOM_JITTER_RANGE;
};

export const isBoostActive = (boost?: BoostState): boolean => {
  if (!boost || boost.status !== 'active' || !boost.expiresAt) {
    return false;
  }

  return new Date(boost.expiresAt).getTime() > now();
};

const getPersonalizationBonus = (entity: Entity, prefs: UserPrefs): number => {
  const categoryWeight = prefs.categoryWeights[entity.category] ?? 0;
  const hasSelectedCategories = prefs.selectedCategories.length > 0;
  const isSelectedCategory = prefs.selectedCategories.includes(entity.category);

  // Make explicit category choices matter more than raw seed scores.
  const bonus = hasSelectedCategories
    ? (categoryWeight * 2) + (isSelectedCategory ? ONBOARDING_MATCH_BONUS : -NON_SELECTED_CATEGORY_PENALTY)
    : categoryWeight * 2;

  return Math.max(MIN_PERSONALIZATION_BONUS, Math.min(MAX_PERSONALIZATION_BONUS, bonus));
};

const getEntityScore = (
  entity: Entity,
  prefs: UserPrefs,
  boosts: BoostMap,
): number => {
  const boosted = isBoostActive(boosts[entity.id]);
  const baseScore = (entity.editorialScore * 0.45)
    + (entity.activityScore * 0.35)
    + (entity.engagementScore * 0.20);
  const boostScore = boosted ? ACTIVE_BOOST_BONUS : 0;
  const personalizationBonus = getPersonalizationBonus(entity, prefs);
  const jitterBonus = boosted ? 0 : getSessionJitter(entity.id);
  return baseScore + boostScore + personalizationBonus + jitterBonus;
};

type ScoredEntity = {
  entity: Entity;
  score: number;
};

const applyCategoryDiversity = (scoredEntities: ScoredEntity[]): Entity[] => {
  const remaining = [...scoredEntities];
  const ranked: ScoredEntity[] = [];

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestAdjustedScore = Number.NEGATIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const recent = ranked.slice(-DIVERSITY_WINDOW);
      const recentSameCategoryCount = recent.filter((item) => item.entity.category === candidate.entity.category).length;
      const adjustedScore = candidate.score - (recentSameCategoryCount * CATEGORY_REPEAT_PENALTY);

      if (adjustedScore > bestAdjustedScore) {
        bestAdjustedScore = adjustedScore;
        bestIndex = index;
      }
    }

    ranked.push(remaining.splice(bestIndex, 1)[0]);
  }

  return ranked.map((item) => item.entity);
};

export const getRankedEntities = (
  entities: Entity[],
  prefs: UserPrefs,
  boosts: BoostMap,
): Entity[] => {
  const scoredEntities = entities.map((entity) => ({
    entity,
    score: getEntityScore(entity, prefs, boosts),
  }));

  scoredEntities.sort((left, right) => {
    const leftBoosted = isBoostActive(boosts[left.entity.id]);
    const rightBoosted = isBoostActive(boosts[right.entity.id]);

    if (leftBoosted !== rightBoosted) {
      return rightBoosted ? 1 : -1;
    }

    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return left.entity.id.localeCompare(right.entity.id);
  });

  return applyCategoryDiversity(scoredEntities);
};
