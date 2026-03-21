import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { categories } from '@/data/seeds/categories.ts';
import { getEntities, searchEntities } from '@/data/repositories/entities-repository.ts';
import { seededFeaturedContent } from '@/data/seeds/featured-content.ts';
import { getRankedEntities } from '@/domain/ranking.ts';
import { readJSON, STORAGE_KEYS, writeJSON } from '@/services/storage/local-storage.ts';
import {
  isSharedFeedEnabled,
  readSharedFeaturedOverrides,
  readSharedRegisteredEntities,
  writeSharedFeaturedOverrides,
} from '@/services/storage/shared-featured-feed.ts';
import type {
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
  hasCompletedOnboarding: boolean;
  completeOnboarding: (selectedCategories: string[]) => void;
  toggleFavorite: (entityId: string) => void;
  isFavorite: (entityId: string) => boolean;
  recordOpen: (entityId: string) => void;
  recordLaunch: (entityId: string) => void;
  registerEntity: (payload: RegisterEntityInput) => Entity;
  deleteEntity: (entityId: string) => void;
  updateSavedEntity: (
    entityId: string,
    payload: Partial<Pick<Entity, 'name' | 'category' | 'telegramUrl' | 'shortDescription' | 'tags'>>,
  ) => void;
  setFeaturedContent: (payload: FeaturedContentInput) => FeaturedContent;
  setBoostState: (state: BoostState) => void;
  getBoostState: (entityId: string) => BoostState;
  isOwnedEntity: (entityId: string) => boolean;
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

const adjustWeight = (weights: Record<string, number>, category: string, diff: number): Record<string, number> => {
  const nextValue = Math.max(0, Math.min(20, (weights[category] ?? 0) + diff));
  return {
    ...weights,
    [category]: nextValue,
  };
};

const uniq = (items: string[]): string[] => Array.from(new Set(items));

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
  hasCompletedOnboarding: false,
  completeOnboarding: () => undefined,
  toggleFavorite: () => undefined,
  isFavorite: () => false,
  recordOpen: () => undefined,
  recordLaunch: () => undefined,
  registerEntity: () => {
    throw new Error('AppStateProvider not mounted');
  },
  deleteEntity: () => undefined,
  updateSavedEntity: () => undefined,
  setFeaturedContent: () => {
    throw new Error('AppStateProvider not mounted');
  },
  setBoostState: () => undefined,
  getBoostState: (entityId: string) => ({ entityId, status: 'inactive', source: 'mock' }),
  isOwnedEntity: () => false,
  search: () => [],
  saveRecentSearch: () => undefined,
};

const AppStateContext = createContext<AppStateContextProviderValue>(initialContext);

type AppStateProviderProps = {
  children: ReactNode;
};

export const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const seededEntities = useMemo(() => getEntities(), []);
  const [registeredEntities, setRegisteredEntities] = useState<Entity[]>(() => {
    return readJSON(STORAGE_KEYS.registeredEntities, [] as Entity[]);
  });
  const [sharedRegisteredEntities, setSharedRegisteredEntities] = useState<Entity[]>([]);
  const [featuredOverrides, setFeaturedOverrides] = useState<FeaturedContent[]>(() => {
    return readJSON(STORAGE_KEYS.featuredOverrides, [] as FeaturedContent[]);
  });
  const [ownedBoostEntityIds, setOwnedBoostEntityIds] = useState<string[]>(() => {
    return readJSON(STORAGE_KEYS.ownedBoostEntityIds, [] as string[]);
  });
  const [hasHydratedSharedFeed, setHasHydratedSharedFeed] = useState<boolean>(() => !isSharedFeedEnabled);
  const [favorites, setFavorites] = useState<FavoritesState>(() => {
    return readJSON(STORAGE_KEYS.favorites, initialFavorites);
  });
  const [history, setHistory] = useState<HistoryState>(() => {
    return readJSON(STORAGE_KEYS.history, initialHistory);
  });
  const [userPrefs, setUserPrefs] = useState<UserPrefs>(() => {
    return readJSON(STORAGE_KEYS.prefs, initialPrefs);
  });
  const [boosts, setBoosts] = useState<Record<string, BoostState>>(() => {
    return readJSON(STORAGE_KEYS.boosts, {} as Record<string, BoostState>);
  });

  const entities = useMemo(() => {
    const byId = new Map<string, Entity>();
    [...seededEntities, ...sharedRegisteredEntities, ...registeredEntities].forEach((entity) => {
      byId.set(entity.id, entity);
    });
    return Array.from(byId.values());
  }, [registeredEntities, seededEntities, sharedRegisteredEntities]);

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
    const byEntity = new Map<string, FeaturedContent>();
    [...seededFeaturedContent, ...featuredOverrides].forEach((item) => {
      byEntity.set(item.entityId, item);
    });
    return Array.from(byEntity.values());
  }, [featuredOverrides]);

  const mergeSharedFeaturedIntoLocal = useCallback((remoteFeatured: FeaturedContent[]) => {
    setFeaturedOverrides((previousState) => {
      const remoteByEntity = new Map(remoteFeatured.map((item) => [item.entityId, item]));
      const localNotInRemote = previousState.filter((item) => !remoteByEntity.has(item.entityId));
      return [...remoteFeatured, ...localNotInRemote];
    });
  }, []);

  const mergeSharedRegisteredIntoLocal = useCallback((remoteEntities: Entity[]) => {
    setSharedRegisteredEntities(() => {
      return remoteEntities.filter((remoteEntity) => {
        return !registeredEntities.some((localEntity) => localEntity.id === remoteEntity.id);
      });
    });
  }, [registeredEntities]);

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
    const nextWeights = normalizedSelection.reduce<Record<string, number>>((acc, category) => {
      acc[category] = 3;
      return acc;
    }, {});

    setUserPrefs((previousState) => ({
      ...previousState,
      onboardingCompleted: true,
      selectedCategories: normalizedSelection,
      categoryWeights: {
        ...previousState.categoryWeights,
        ...nextWeights,
      },
    }));
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
      previewMediaUrl: payload.previewMediaUrl,
      editorialScore: 55,
      activityScore: 30,
      engagementScore: 25,
    };

    setRegisteredEntities((previousState) => [entity, ...previousState]);
    return entity;
  }, []);

  const deleteEntity = useCallback((entityId: string) => {
    setRegisteredEntities((previousState) => previousState.filter((e) => e.id !== entityId));
    setFeaturedOverrides((previousState) => previousState.filter((fc) => fc.entityId !== entityId));
  }, []);

  const updateSavedEntity = useCallback((
    entityId: string,
    payload: Partial<Pick<Entity, 'name' | 'category' | 'telegramUrl' | 'shortDescription' | 'tags'>>,
  ) => {
    setRegisteredEntities((previousState) => previousState.map((entity) => {
      if (entity.id !== entityId) {
        return entity;
      }

      return {
        ...entity,
        ...payload,
      };
    }));
  }, []);

  const setFeaturedContent = useCallback((payload: FeaturedContentInput): FeaturedContent => {
    const next: FeaturedContent = {
      id: `featured-${payload.entityId}-${Date.now()}`,
      entityId: payload.entityId,
      mode: payload.mode,
      contentType: payload.contentType,
      title: payload.title,
      text: payload.text,
      mediaUrl: payload.mediaUrl,
    };

    setFeaturedOverrides((previousState) => {
      return [next, ...previousState.filter((item) => item.entityId !== payload.entityId)];
    });
    setOwnedBoostEntityIds((previousState) => uniq([payload.entityId, ...previousState]));

    return next;
  }, []);

  const setBoostState = useCallback((state: BoostState) => {
    setBoosts((previousState) => ({
      ...previousState,
      [state.entityId]: state,
    }));
  }, []);

  const getBoostState = useCallback((entityId: string): BoostState => {
    return boosts[entityId] ?? { entityId, status: 'inactive', source: 'mock' };
  }, [boosts]);

  const isOwnedEntity = useCallback((entityId: string): boolean => {
    return ownedEntityIds.includes(entityId);
  }, [ownedEntityIds]);

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
    if (!isSharedFeedEnabled) {
      return;
    }

    let cancelled = false;
    const pullSharedFeed = async () => {
      const [remoteFeatured, remoteEntities] = await Promise.all([
        readSharedFeaturedOverrides(),
        readSharedRegisteredEntities(),
      ]);
      if (cancelled) {
        return;
      }

      if (remoteFeatured) {
        mergeSharedFeaturedIntoLocal(remoteFeatured);
      }
      if (remoteEntities) {
        mergeSharedRegisteredIntoLocal(remoteEntities);
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
    }, 10_000);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mergeSharedFeaturedIntoLocal, mergeSharedRegisteredIntoLocal]);

  useEffect(() => {
    if (!isSharedFeedEnabled || !hasHydratedSharedFeed) {
      return;
    }

    void writeSharedFeaturedOverrides(featuredOverrides, registeredEntities);
  }, [featuredOverrides, hasHydratedSharedFeed, registeredEntities]);

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
      hasCompletedOnboarding: userPrefs.onboardingCompleted,
      completeOnboarding,
      toggleFavorite,
      isFavorite,
      recordOpen,
      recordLaunch,
      registerEntity,
      deleteEntity,
      updateSavedEntity,
      setFeaturedContent,
      setBoostState,
      getBoostState,
      isOwnedEntity,
      search,
      saveRecentSearch,
    };
  }, [
    boosts,
    completeOnboarding,
    entities,
    favorites,
    featuredContent,
    getBoostState,
    history,
    isOwnedEntity,
    isFavorite,
    ownedEntities,
    registeredEntities,
    rankedEntities,
    recordLaunch,
    recordOpen,
    registerEntity,
    deleteEntity,
    updateSavedEntity,
    search,
    setBoostState,
    setFeaturedContent,
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
