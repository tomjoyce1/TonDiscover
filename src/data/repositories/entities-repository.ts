import { seededEntities } from '@/data/seeds/entities.ts';
import { seededFeaturedContent } from '@/data/seeds/featured-content.ts';
import type { Entity, FeaturedContent } from '@/types/tondiscover.ts';

const normalize = (value: string) => value.trim().toLowerCase();

export const getEntities = (): Entity[] => seededEntities;

export const getEntityById = (
  id: string,
  allEntities: Entity[] = seededEntities,
): Entity | undefined => allEntities.find((entity) => entity.id === id);

export const getFeaturedByEntityId = (
  entityId: string,
  allFeatured: FeaturedContent[] = seededFeaturedContent,
): FeaturedContent | undefined => allFeatured.find((item) => item.entityId === entityId);

export const searchEntities = (
  query: string,
  allEntities: Entity[] = seededEntities,
  allFeatured: FeaturedContent[] = seededFeaturedContent,
): Entity[] => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return allEntities;
  }

  return allEntities.filter((entity) => {
    const featured = getFeaturedByEntityId(entity.id, allFeatured);
    const fields = [
      entity.name,
      entity.shortDescription,
      entity.longDescription,
      entity.tags.join(' '),
      entity.previewText,
      featured?.title,
      featured?.text,
    ]
      .filter((value): value is string => !!value)
      .map(normalize);

    return fields.some((field) => field.includes(normalizedQuery));
  });
};
