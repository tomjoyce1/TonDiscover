import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { categories } from '@/data/seeds/categories.ts';
import { getEntities, searchEntities } from '@/data/repositories/entities-repository.ts';
import { seededFeaturedContent } from '@/data/seeds/featured-content.ts';
import { getRankedEntities } from '@/domain/ranking.ts';
import { normalizeMediaUrl } from '@/helpers/media-url.ts';
import { useTonConnect } from '@/hooks/useTonConnect.ts';
import { readJSON, STORAGE_KEYS, writeJSON } from '@/services/storage/local-storage.ts';
import {
  isSharedFeedEnabled,
  readSharedFeedSnapshot,
  subscribeSharedFeedUpdates,
  writeSharedBoostStates,
  writeSharedFeaturedOverrides,
} from '@/services/storage/shared-featured-feed.ts';
import type {
  BoostEvent,
  BoostState,
  Entity,
  FavoritesState,
  FeaturedContent,
  FeaturedContentInput,
  HistoryState,
  RegisterEntityInput,
  UserPrefs,
} from '@/types/tondiscover.ts';

type AppStateContextProviderValue = {
  categories: string[];
  entities: Entity[];
  savedEntities: Entity[];
  ownedEntities: Entity[];
  featuredContent: FeaturedContent[];
  rankedEntities: Entity[];
  favorites: FavoritesState;
  history: HistoryState;
  userPrefs: UserPrefs;
  boosts: Record<string, BoostState>;
  boostEvents: BoostEvent[];
  hasCompletedOnboarding: boolean;
  completeOnboarding: (selectedCategories: string[]) => void;
  toggleFavorite: (entityId: string) => void;
  isFavorite: (entityId: string) => boolean;
  recordOpen: (entityId: string) => void;
  recordLaunch: (entityId: string) => void;
  registerEntity: (payload: RegisterEntityInput) => Entity;
  addBoostEvent: (event: BoostEvent) => void;
  deleteEntity: (entityId: string) => void;
  updateSavedEntity: (
    entityId: string,
    payload: Partial<Pick<Entity, 'name' | 'category' | 'telegramUrl' | 'shortDescription' | 'tags' | 'previewMediaUrl'>>,
  ) => void;
  setFeaturedContent: (payload: FeaturedContentInput) => FeaturedContent;
  deleteFeaturedContent: (postId: string) => void;
  setBoostState: (state: BoostState) => void;
  getBoostState: (targetId: string) => BoostState;
  isOwnedEntity: (entityId: string) => boolean;
  resetProfile: () => void;
  search: (query: string) => Entity[];
  saveRecentSearch: (query: string) => void;
};

const initialPrefs: UserPrefs = {
  onboardingCompleted: false,
  selectedCategories: [],
  categoryWeights: {},
  recentSearches: [],
};

const initialFavorites: FavoritesState = {
  favoriteAppIds: [],
};

const initialHistory: HistoryState = {
  recentLaunchedAppIds: [],
  recentOpenedEntityIds: [],
};

const MIN_CATEGORY_WEIGHT = 0;
const MAX_CATEGORY_WEIGHT = 100;
const DOMAIN_SELECTION_WEIGHT_DELTA = 5;
const SHARED_FEED_POLL_INTERVAL_MS = 3_000;
const EXPLICITLY_REMOVED_ENTITY_IDS = new Set<string>([
  'custom-1774173646049',
  'custom-1774175241878',
]);

const isExplicitlyRemovedEntity = (
  entity: Pick<Entity, 'id'> | undefined,
): boolean => {
  if (!entity) {
    return false;
  }
  return EXPLICITLY_REMOVED_ENTITY_IDS.has(entity.id);
};

const clampCategoryWeight = (value: number): number => {
  return Math.max(MIN_CATEGORY_WEIGHT, Math.min(MAX_CATEGORY_WEIGHT, value));
};

const normalizeCategoryWeights = (weights: Record<string, number> | undefined): Record<string, number> => {
  if (!weights) {
    return {};
  }

  const normalizedEntries = Object.entries(weights)
    .filter(([category]) => Boolean(category))
    .map(([category, value]) => [category, clampCategoryWeight(Number(value) || 0)] as const);

  return Object.fromEntries(normalizedEntries);
};

const adjustWeight = (weights: Record<string, number>, category: string, diff: number): Record<string, number> => {
  const nextValue = clampCategoryWeight((weights[category] ?? 0) + diff);
  return {
    ...weights,
    [category]: nextValue,
  };
};

const uniq = (items: string[]): string[] => Array.from(new Set(items));

const isSameBoostState = (left: BoostState, right: BoostState): boolean => {
  return left.entityId === right.entityId
    && left.status === right.status
    && left.startedAt === right.startedAt
    && left.expiresAt === right.expiresAt
    && left.source === right.source;
};

const initialContext: AppStateContextProviderValue = {
  categories,
  entities: [],
  savedEntities: [],
  ownedEntities: [],
  featuredContent: [],
  rankedEntities: [],
  favorites: initialFavorites,
  history: initialHistory,
  userPrefs: initialPrefs,
  boosts: {},
  boostEvents: [],
  hasCompletedOnboarding: false,
  completeOnboarding: () => undefined,
  toggleFavorite: () => undefined,
  isFavorite: () => false,
  recordOpen: () => undefined,
  recordLaunch: () => undefined,
  registerEntity: () => {
    throw new Error('AppStateProvider not mounted');
  },
  addBoostEvent: () => undefined,
  deleteEntity: () => undefined,
  updateSavedEntity: () => undefined,
  setFeaturedContent: () => {
    throw new Error('AppStateProvider not mounted');
  },
  deleteFeaturedContent: () => undefined,
  setBoostState: () => undefined,
  getBoostState: (targetId: string) => ({ entityId: targetId, status: 'inactive', source: 'mock' }),
  isOwnedEntity: () => false,
  resetProfile: () => undefined,
  search: () => [],
  saveRecentSearch: () => undefined,
};

const AppStateContext = createContext<AppStateContextProviderValue>(initialContext);

type AppStateProviderProps = {
  children: ReactNode;
};

export const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const seededEntities = useMemo(() => getEntities(), []);
  const { walletAddress } = useTonConnect();
  const [registeredEntities, setRegisteredEntities] = useState<Entity[]>(() => {
    return readJSON(STORAGE_KEYS.registeredEntities, [] as Entity[])
      .filter((entity) => !isExplicitlyRemovedEntity(entity));
  });
  const [sharedRegisteredEntities, setSharedRegisteredEntities] = useState<Entity[]>([]);
  const [featuredOverrides, setFeaturedOverrides] = useState<FeaturedContent[]>(() => {
    return readJSON(STORAGE_KEYS.featuredOverrides, [] as FeaturedContent[])
      .filter((item) => !EXPLICITLY_REMOVED_ENTITY_IDS.has(item.entityId));
  });
  const [ownedBoostEntityIds, setOwnedBoostEntityIds] = useState<string[]>(() => {
    return readJSON(STORAGE_KEYS.ownedBoostEntityIds, [] as string[])
      .filter((id) => !EXPLICITLY_REMOVED_ENTITY_IDS.has(id));
  });
  const [hasHydratedSharedFeed, setHasHydratedSharedFeed] = useState<boolean>(() => !isSharedFeedEnabled);
  const [favorites, setFavorites] = useState<FavoritesState>(() => {
    return readJSON(STORAGE_KEYS.favorites, initialFavorites);
  });
  const [history, setHistory] = useState<HistoryState>(() => {
    return readJSON(STORAGE_KEYS.history, initialHistory);
  });
  const [userPrefs, setUserPrefs] = useState<UserPrefs>(() => {
    const persisted = readJSON(STORAGE_KEYS.prefs, initialPrefs);
    return {
      ...persisted,
      categoryWeights: normalizeCategoryWeights(persisted.categoryWeights),
    };
  });
  const [boosts, setBoosts] = useState<Record<string, BoostState>>(() => {
    const raw = readJSON(STORAGE_KEYS.boosts, {} as Record<string, BoostState>);
    return Object.fromEntries(
      Object.entries(raw).filter(([targetId]) => !EXPLICITLY_REMOVED_ENTITY_IDS.has(targetId)),
    );
  });
  const [boostEvents, setBoostEvents] = useState<BoostEvent[]>(() => {
    return readJSON(STORAGE_KEYS.boostEvents, [] as BoostEvent[])
      .filter((event) => !EXPLICITLY_REMOVED_ENTITY_IDS.has(event.entityId));
  });
  const [deletedEntityIds, setDeletedEntityIds] = useState<string[]>(() => {
    return uniq([
      ...readJSON(STORAGE_KEYS.deletedEntityIds, [] as string[]),
      ...Array.from(EXPLICITLY_REMOVED_ENTITY_IDS),
    ]);
  });
  const [deletedFeaturedIds, setDeletedFeaturedIds] = useState<string[]>(() => {
    return readJSON(STORAGE_KEYS.deletedFeaturedIds, [] as string[]);
  });

  const entities = useMemo(() => {
    const byId = new Map<string, Entity>();
    [...seededEntities, ...sharedRegisteredEntities, ...registeredEntities].forEach((entity) => {
      if (isExplicitlyRemovedEntity(entity)) {
        return;
      }
      byId.set(entity.id, entity);
    });
    return Array.from(byId.values()).filter((e) => !deletedEntityIds.includes(e.id));
  }, [registeredEntities, seededEntities, sharedRegisteredEntities, deletedEntityIds]);

  const syncRegisteredEntities = useMemo(() => {
    const byId = new Map<string, Entity>();
    [...sharedRegisteredEntities, ...registeredEntities].forEach((entity) => {
      if (deletedEntityIds.includes(entity.id) || isExplicitlyRemovedEntity(entity)) {
        return;
      }
      byId.set(entity.id, entity);
    });
    return Array.from(byId.values());
  }, [deletedEntityIds, registeredEntities, sharedRegisteredEntities]);

  const ownedEntityIds = useMemo(() => {
    return uniq([
      ...registeredEntities.map((entity) => entity.id),
      ...ownedBoostEntityIds,
    ]);
  }, [ownedBoostEntityIds, registeredEntities]);

  const ownedEntities = useMemo(() => {
    return entities.filter((entity) => ownedEntityIds.includes(entity.id));
  }, [entities, ownedEntityIds]);

  const featuredContent = useMemo(() => {
    const byId = new Map<string, FeaturedContent>();
    [...featuredOverrides, ...seededFeaturedContent].forEach((item) => {
      if (EXPLICITLY_REMOVED_ENTITY_IDS.has(item.entityId)) {
        return;
      }
      if (!byId.has(item.id)) {
        byId.set(item.id, item);
      }
    });
    return Array.from(byId.values()).filter((fc) => {
      return !deletedEntityIds.includes(fc.entityId) && !deletedFeaturedIds.includes(fc.id);
    });
  }, [featuredOverrides, deletedEntityIds, deletedFeaturedIds]);

  const mergeSharedFeaturedIntoLocal = useCallback((remoteFeatured: FeaturedContent[]) => {
    setFeaturedOverrides((previousState) => {
      const remoteById = new Map(
        remoteFeatured
          .filter((item) => !deletedEntityIds.includes(item.entityId) && !deletedFeaturedIds.includes(item.id))
          .map((item) => [item.id, item]),
      );
      const localNotInRemote = previousState.filter((item) => !remoteById.has(item.id));
      return [...remoteById.values(), ...localNotInRemote];
    });
  }, [deletedEntityIds, deletedFeaturedIds]);

  const mergeSharedRegisteredIntoLocal = useCallback((remoteEntities: Entity[]) => {
    setSharedRegisteredEntities(() => {
      return remoteEntities.filter((remoteEntity) => {
        if (deletedEntityIds.includes(remoteEntity.id) || isExplicitlyRemovedEntity(remoteEntity)) {
          return false;
        }
        return !registeredEntities.some((localEntity) => localEntity.id === remoteEntity.id);
      });
    });
  }, [deletedEntityIds, registeredEntities]);

  const mergeSharedBoostsIntoLocal = useCallback((remoteBoosts: Record<string, BoostState>) => {
    const deletedEntityIdSet = new Set(deletedEntityIds);
    const deletedFeaturedIdSet = new Set(deletedFeaturedIds);
    setBoosts((previousState) => {
      let hasChange = false;
      const nextState = { ...previousState };

      Object.entries(remoteBoosts).forEach(([entityId, remoteState]) => {
        if (deletedEntityIdSet.has(entityId) || deletedFeaturedIdSet.has(entityId)) {
          return;
        }
        const localState = previousState[entityId];
        if (!localState || !isSameBoostState(localState, remoteState)) {
          nextState[entityId] = remoteState;
          hasChange = true;
        }
      });

      return hasChange ? nextState : previousState;
    });
  }, [deletedEntityIds, deletedFeaturedIds]);

  const rankedEntities = useMemo(() => {
    return getRankedEntities(entities, userPrefs, boosts);
  }, [boosts, entities, userPrefs]);

  const getEntityById = useCallback((entityId: string) => {
    return entities.find((entity) => entity.id === entityId);
  }, [entities]);

  const recordCategoryEvent = useCallback((entityId: string, weightDiff: number) => {
    const entity = getEntityById(entityId);
    if (!entity) {
      return;
    }

    setUserPrefs((previousState) => ({
      ...previousState,
      categoryWeights: adjustWeight(previousState.categoryWeights, entity.category, weightDiff),
    }));
  }, [getEntityById]);

  const completeOnboarding = useCallback((selectedCategories: string[]) => {
    const normalizedSelection = uniq(selectedCategories);

    setUserPrefs((previousState) => {
      const previousSelection = previousState.selectedCategories;
      const addedCategories = normalizedSelection.filter((category) => !previousSelection.includes(category));
      const removedCategories = previousSelection.filter((category) => !normalizedSelection.includes(category));
      let nextCategoryWeights = { ...previousState.categoryWeights };

      addedCategories.forEach((category) => {
        nextCategoryWeights = adjustWeight(nextCategoryWeights, category, DOMAIN_SELECTION_WEIGHT_DELTA);
      });

      removedCategories.forEach((category) => {
        nextCategoryWeights = adjustWeight(nextCategoryWeights, category, -DOMAIN_SELECTION_WEIGHT_DELTA);
      });

      return {
        ...previousState,
        onboardingCompleted: true,
        selectedCategories: normalizedSelection,
        categoryWeights: nextCategoryWeights,
      };
    });
  }, []);

  const toggleFavorite = useCallback((entityId: string) => {
    let shouldIncreaseCategoryWeight = false;

    setFavorites((previousState) => {
      const alreadyFavorite = previousState.favoriteAppIds.includes(entityId);
      shouldIncreaseCategoryWeight = !alreadyFavorite;
      const nextFavoriteAppIds = alreadyFavorite
        ? previousState.favoriteAppIds.filter((id) => id !== entityId)
        : [...previousState.favoriteAppIds, entityId];

      return {
        favoriteAppIds: nextFavoriteAppIds,
      };
    });

    if (shouldIncreaseCategoryWeight) {
      recordCategoryEvent(entityId, 3);
    }
  }, [recordCategoryEvent]);

  const isFavorite = useCallback((entityId: string) => {
    return favorites.favoriteAppIds.includes(entityId);
  }, [favorites.favoriteAppIds]);

  const recordOpen = useCallback((entityId: string) => {
    setHistory((previousState) => ({
      ...previousState,
      recentOpenedEntityIds: uniq([entityId, ...previousState.recentOpenedEntityIds]).slice(0, 20),
    }));
    recordCategoryEvent(entityId, 2);
  }, [recordCategoryEvent]);

  const recordLaunch = useCallback((entityId: string) => {
    setHistory((previousState) => ({
      ...previousState,
      recentLaunchedAppIds: uniq([entityId, ...previousState.recentLaunchedAppIds]).slice(0, 20),
    }));
    recordCategoryEvent(entityId, 4);
  }, [recordCategoryEvent]);

  const registerEntity = useCallback((payload: RegisterEntityInput): Entity => {
    const entity: Entity = {
      id: `custom-${Date.now()}`,
      type: payload.type,
      name: payload.name,
      category: payload.category,
      tags: payload.tags,
      shortDescription: payload.shortDescription,
      telegramUrl: payload.telegramUrl,
      contentType: payload.contentType,
      previewText: payload.previewText,
      previewMediaUrl: normalizeMediaUrl(payload.previewMediaUrl),
      creatorWalletAddress: walletAddress?.toString(),
      editorialScore: 55,
      activityScore: 30,
      engagementScore: 25,
    };

    setRegisteredEntities((previousState) => [entity, ...previousState]);
    return entity;
  }, [walletAddress]);

  const addBoostEvent = useCallback((event: BoostEvent) => {
    setBoostEvents((previousState) => [event, ...previousState]);
  }, []);

  const deleteEntity = useCallback((entityId: string) => {
    const relatedPostIds = featuredContent
      .filter((item) => item.entityId === entityId)
      .map((item) => item.id);
    const relatedPostIdsSet = new Set(relatedPostIds);

    setRegisteredEntities((previousState) => previousState.filter((e) => e.id !== entityId));
    setFeaturedOverrides((previousState) => previousState.filter((fc) => fc.entityId !== entityId));
    setOwnedBoostEntityIds((previousState) => previousState.filter((id) => id !== entityId));
    setDeletedEntityIds((previousState) => uniq([...previousState, entityId]));
    setDeletedFeaturedIds((previousState) => uniq([...previousState, ...relatedPostIds]));
    setBoosts((previousState) => {
      const nextState = { ...previousState };
      delete nextState[entityId];
      relatedPostIds.forEach((postId) => {
        delete nextState[postId];
      });
      return nextState;
    });
    setBoostEvents((previousState) => {
      return previousState.filter((event) => {
        return event.entityId !== entityId && !relatedPostIdsSet.has(event.entityId);
      });
    });
  }, [featuredContent]);

  const updateSavedEntity = useCallback((
    entityId: string,
    payload: Partial<Pick<Entity, 'name' | 'category' | 'telegramUrl' | 'shortDescription' | 'tags' | 'previewMediaUrl'>>,
  ) => {
    setRegisteredEntities((previousState) => previousState.map((entity) => {
      if (entity.id !== entityId) {
        return entity;
      }

      return {
        ...entity,
        ...payload,
        previewMediaUrl: normalizeMediaUrl(payload.previewMediaUrl ?? entity.previewMediaUrl),
      };
    }));
  }, []);

  const setFeaturedContent = useCallback((payload: FeaturedContentInput): FeaturedContent => {
    const normalizedPostId = payload.id?.trim();
    const next: FeaturedContent = {
      id: normalizedPostId || `featured-${payload.entityId}-${Date.now()}`,
      entityId: payload.entityId,
      mode: payload.mode,
      contentType: payload.contentType,
      title: payload.title,
      text: payload.text,
      mediaUrl: normalizeMediaUrl(payload.mediaUrl),
    };

    setFeaturedOverrides((previousState) => {
      if (normalizedPostId) {
        return [next, ...previousState.filter((item) => item.id !== normalizedPostId)];
      }
      return [next, ...previousState];
    });
    if (normalizedPostId) {
      setDeletedFeaturedIds((previousState) => previousState.filter((id) => id !== normalizedPostId));
    }
    setOwnedBoostEntityIds((previousState) => uniq([payload.entityId, ...previousState]));

    return next;
  }, []);

  const deleteFeaturedContent = useCallback((postId: string) => {
    setFeaturedOverrides((previousState) => previousState.filter((item) => item.id !== postId));
    setDeletedFeaturedIds((previousState) => uniq([...previousState, postId]));
    setBoosts((previousState) => {
      if (!Object.hasOwn(previousState, postId)) {
        return previousState;
      }
      const nextState = { ...previousState };
      delete nextState[postId];
      return nextState;
    });
    setBoostEvents((previousState) => previousState.filter((event) => event.entityId !== postId));
  }, []);

  const setBoostState = useCallback((state: BoostState) => {
    setBoosts((previousState) => {
      const previousEntityState = previousState[state.entityId];
      if (previousEntityState && isSameBoostState(previousEntityState, state)) {
        return previousState;
      }

      return {
        ...previousState,
        [state.entityId]: state,
      };
    });
  }, []);

  const getBoostState = useCallback((entityId: string): BoostState => {
    return boosts[entityId] ?? { entityId, status: 'inactive', source: 'mock' };
  }, [boosts]);

  const isOwnedEntity = useCallback((entityId: string): boolean => {
    return ownedEntityIds.includes(entityId);
  }, [ownedEntityIds]);

  const resetProfile = useCallback(() => {
    const ownedEntityIdsToDelete = registeredEntities.map((entity) => entity.id);
    const ownedEntityIdsSet = new Set(ownedEntityIdsToDelete);
    const relatedPostIdsToDelete = featuredContent
      .filter((item) => ownedEntityIdsSet.has(item.entityId))
      .map((item) => item.id);

    setRegisteredEntities([]);
    setSharedRegisteredEntities([]);
    setFeaturedOverrides([]);
    setOwnedBoostEntityIds([]);
    setDeletedEntityIds((previousState) => uniq([...previousState, ...ownedEntityIdsToDelete]));
    setDeletedFeaturedIds((previousState) => uniq([...previousState, ...relatedPostIdsToDelete]));
    setFavorites(initialFavorites);
    setHistory(initialHistory);
    setUserPrefs(initialPrefs);
    setBoosts({} as Record<string, BoostState>);
    setBoostEvents([]);

    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (
          key?.startsWith('tondiscover:')
          && key !== STORAGE_KEYS.deletedEntityIds
          && key !== STORAGE_KEYS.deletedFeaturedIds
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    }
  }, [featuredContent, registeredEntities]);

  const search = useCallback((query: string): Entity[] => {
    if (!query.trim()) {
      return rankedEntities;
    }

    return searchEntities(query, entities, featuredContent);
  }, [entities, featuredContent, rankedEntities]);

  const saveRecentSearch = useCallback((query: string) => {
    const normalized = query.trim();
    if (!normalized) {
      return;
    }

    setUserPrefs((previousState) => ({
      ...previousState,
      recentSearches: uniq([normalized, ...previousState.recentSearches]).slice(0, 10),
    }));
  }, []);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.registeredEntities, registeredEntities);
  }, [registeredEntities]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.featuredOverrides, featuredOverrides);
  }, [featuredOverrides]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.ownedBoostEntityIds, ownedBoostEntityIds);
  }, [ownedBoostEntityIds]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.deletedEntityIds, deletedEntityIds);
  }, [deletedEntityIds]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.deletedFeaturedIds, deletedFeaturedIds);
  }, [deletedFeaturedIds]);

  useEffect(() => {
    const deletedTargetIds = new Set([...deletedEntityIds, ...deletedFeaturedIds]);
    if (deletedTargetIds.size === 0) {
      return;
    }

    setBoosts((previousState) => {
      let hasChange = false;
      const nextState = { ...previousState };
      deletedTargetIds.forEach((targetId) => {
        if (Object.hasOwn(nextState, targetId)) {
          delete nextState[targetId];
          hasChange = true;
        }
      });
      return hasChange ? nextState : previousState;
    });

    setBoostEvents((previousState) => {
      return previousState.filter((event) => !deletedTargetIds.has(event.entityId));
    });
  }, [deletedEntityIds, deletedFeaturedIds]);

  useEffect(() => {
    const validTargetIds = new Set([
      ...entities.map((entity) => entity.id),
      ...featuredContent.map((item) => item.id),
    ]);

    setBoosts((previousState) => {
      let hasChange = false;
      const nextState = { ...previousState };

      Object.keys(nextState).forEach((targetId) => {
        if (!validTargetIds.has(targetId)) {
          delete nextState[targetId];
          hasChange = true;
        }
      });

      return hasChange ? nextState : previousState;
    });

    setBoostEvents((previousState) => {
      return previousState.filter((event) => validTargetIds.has(event.entityId));
    });
  }, [entities, featuredContent]);

  useEffect(() => {
    if (!isSharedFeedEnabled) {
      return;
    }

    let cancelled = false;
    const pullSharedFeed = async () => {
      const snapshot = await readSharedFeedSnapshot();
      if (cancelled) {
        return;
      }

      if (snapshot) {
        const explicitlyRemovedRemoteEntityIds = snapshot.registeredEntities
          .filter((entity) => isExplicitlyRemovedEntity(entity))
          .map((entity) => entity.id);
        const nextDeletedEntityIds = uniq([
          ...snapshot.deletedEntityIds,
          ...explicitlyRemovedRemoteEntityIds,
          ...Array.from(EXPLICITLY_REMOVED_ENTITY_IDS),
        ]);

        setDeletedEntityIds((previousState) => uniq([...previousState, ...nextDeletedEntityIds]));
        setDeletedFeaturedIds((previousState) => uniq([...previousState, ...snapshot.deletedFeaturedIds]));
        const remoteDeletedEntityIdSet = new Set(nextDeletedEntityIds);
        const remoteDeletedFeaturedIdSet = new Set(snapshot.deletedFeaturedIds);
        const filteredRemoteFeatured = snapshot.featuredOverrides.filter((item) => {
          return !remoteDeletedEntityIdSet.has(item.entityId) && !remoteDeletedFeaturedIdSet.has(item.id);
        });
        const filteredRemoteEntities = snapshot.registeredEntities.filter((entity) => {
          return !remoteDeletedEntityIdSet.has(entity.id) && !isExplicitlyRemovedEntity(entity);
        });
        const filteredRemoteBoosts = Object.fromEntries(
          Object.entries(snapshot.boosts).filter(([targetId]) => {
            return !remoteDeletedEntityIdSet.has(targetId) && !remoteDeletedFeaturedIdSet.has(targetId);
          }),
        );

        mergeSharedFeaturedIntoLocal(filteredRemoteFeatured);
        mergeSharedRegisteredIntoLocal(filteredRemoteEntities);
        mergeSharedBoostsIntoLocal(filteredRemoteBoosts);
      }
      setHasHydratedSharedFeed(true);
    };

    const handleFocus = () => {
      void pullSharedFeed();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void pullSharedFeed();
      }
    };

    void pullSharedFeed();
    const intervalId = window.setInterval(() => {
      void pullSharedFeed();
    }, SHARED_FEED_POLL_INTERVAL_MS);
    const unsubscribeSharedFeed = subscribeSharedFeedUpdates(() => {
      void pullSharedFeed();
    });
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      unsubscribeSharedFeed?.();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mergeSharedBoostsIntoLocal, mergeSharedFeaturedIntoLocal, mergeSharedRegisteredIntoLocal]);

  useEffect(() => {
    if (!isSharedFeedEnabled || !hasHydratedSharedFeed) {
      return;
    }

    void writeSharedFeaturedOverrides(
      featuredOverrides,
      syncRegisteredEntities,
      undefined,
      deletedFeaturedIds,
      deletedEntityIds,
    );
  }, [deletedEntityIds, deletedFeaturedIds, featuredOverrides, hasHydratedSharedFeed, syncRegisteredEntities]);

  useEffect(() => {
    if (!isSharedFeedEnabled || !hasHydratedSharedFeed) {
      return;
    }

    void writeSharedBoostStates(boosts);
  }, [boosts, hasHydratedSharedFeed]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.favorites, favorites);
  }, [favorites]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.history, history);
  }, [history]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.prefs, userPrefs);
  }, [userPrefs]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.boosts, boosts);
  }, [boosts]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.boostEvents, boostEvents);
  }, [boostEvents]);

  const contextValue = useMemo<AppStateContextProviderValue>(() => {
    return {
      categories,
      entities,
      savedEntities: registeredEntities,
      ownedEntities,
      featuredContent,
      rankedEntities,
      favorites,
      history,
      userPrefs,
      boosts,
      boostEvents,
      hasCompletedOnboarding: userPrefs.onboardingCompleted,
      completeOnboarding,
      toggleFavorite,
      isFavorite,
      recordOpen,
      recordLaunch,
      registerEntity,
      addBoostEvent,
      deleteEntity,
      updateSavedEntity,
      setFeaturedContent,
      deleteFeaturedContent,
      setBoostState,
      getBoostState,
      isOwnedEntity,
      resetProfile,
      search,
      saveRecentSearch,
    };
  }, [
    boosts,
    boostEvents,
    completeOnboarding,
    entities,
    favorites,
    featuredContent,
    getBoostState,
    history,
    isOwnedEntity,
    resetProfile,
    isFavorite,
    ownedEntities,
    registeredEntities,
    rankedEntities,
    recordLaunch,
    recordOpen,
    registerEntity,
    addBoostEvent,
    deleteEntity,
    updateSavedEntity,
    search,
    setBoostState,
    setFeaturedContent,
    deleteFeaturedContent,
    saveRecentSearch,
    toggleFavorite,
    userPrefs,
  ]);

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
