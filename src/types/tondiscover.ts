export type EntityType = 'channel' | 'app';
export type ContentType = 'text' | 'image' | 'video';

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  category: string;
  tags: string[];
  shortDescription: string;
  longDescription?: string;
  telegramUrl: string;
  contentType: ContentType;
  previewText?: string;
  previewMediaUrl?: string;
  editorialScore: number;
  activityScore: number;
  engagementScore: number;
}

export interface FeaturedContent {
  id: string;
  entityId: string;
  mode: 'latest' | 'pinned' | 'specific' | 'manual';
  contentType: ContentType;
  title?: string;
  text?: string;
  mediaUrl?: string;
}

export interface UserPrefs {
  onboardingCompleted: boolean;
  selectedCategories: string[];
  categoryWeights: Record<string, number>;
  recentSearches: string[];
}

export interface FavoritesState {
  favoriteAppIds: string[];
}

export interface HistoryState {
  recentLaunchedAppIds: string[];
  recentOpenedEntityIds: string[];
}

export interface BoostState {
  entityId: string;
  status: 'inactive' | 'pending' | 'active' | 'failed';
  startedAt?: string;
  expiresAt?: string;
  source: 'mock' | 'ton';
}

export interface BoostOption {
  id: string;
  label: string;
  amountTon: string;
  durationHours: number;
}

export interface RegisterEntityInput {
  type: EntityType;
  name: string;
  category: string;
  telegramUrl: string;
  shortDescription: string;
  tags: string[];
  contentType: ContentType;
  previewText?: string;
  previewMediaUrl?: string;
}

export interface FeaturedContentInput {
  entityId: string;
  mode: FeaturedContent['mode'];
  contentType: ContentType;
  title?: string;
  text?: string;
  mediaUrl?: string;
}
