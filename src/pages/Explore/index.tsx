import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { DiscoveryTile } from '@/components/discovery/DiscoveryTile.tsx';
import { EntitySheet } from '@/components/discovery/EntitySheet.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { isBoostActive } from '@/domain/ranking.ts';
import type { BoostState, Entity, FeaturedContent } from '@/types/tondiscover.ts';

const FEED_BATCH_SIZE = 24;
const FEED_POST_INTERVAL = 4;
const FEED_RECENT_POST_LIMIT = 80;

type FeedItem = {
  id: string;
  entity: Entity;
  featuredContent?: FeaturedContent;
  boostState?: BoostState;
  isPost: boolean;
};

const Explore = () => {
  const { rankedEntities, boosts, featuredContent } = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(FEED_BATCH_SIZE);
  const closeSheet = useCallback(() => {
    setSelectedEntityId(null);
    setSelectedPostId(null);

    if (searchParams.has('entityId') || searchParams.has('postId')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('entityId');
      nextParams.delete('postId');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const handleTileSelect = useCallback((entityId: string, postId?: string) => {
    setSelectedEntityId(entityId);
    setSelectedPostId(postId ?? null);
  }, []);

  const feedItems = useMemo<FeedItem[]>(() => {
    const entityById = new Map(rankedEntities.map((entity) => [entity.id, entity]));
    const rankedEntityIdSet = new Set(rankedEntities.map((entity) => entity.id));
    const candidatePosts = featuredContent
      .filter((post) => rankedEntityIdSet.has(post.entityId))
      .map((post) => {
        const entity = entityById.get(post.entityId);
        if (!entity) {
          return null;
        }
        return { post, entity };
      })
      .filter((item): item is { post: FeaturedContent; entity: Entity } => item !== null)
      .sort((left, right) => {
        const leftBoosted = isBoostActive(boosts[left.post.id]);
        const rightBoosted = isBoostActive(boosts[right.post.id]);
        if (leftBoosted === rightBoosted) {
          return 0;
        }
        return rightBoosted ? 1 : -1;
      })
      .slice(0, FEED_RECENT_POST_LIMIT);

    const feed: FeedItem[] = [];
    let postCursor = 0;

    rankedEntities.forEach((entity, index) => {
      feed.push({
        id: `entity-${entity.id}`,
        entity,
        boostState: boosts[entity.id],
        isPost: false,
      });

      if ((index + 1) % FEED_POST_INTERVAL !== 0) {
        return;
      }

      if (postCursor >= candidatePosts.length) {
        return;
      }

      const postItem = candidatePosts[postCursor];
      postCursor += 1;
      const postBoost = boosts[postItem.post.id];
      const entityBoost = boosts[postItem.entity.id];
      feed.push({
        id: `post-${postItem.post.id}`,
        entity: postItem.entity,
        featuredContent: postItem.post,
        boostState: postBoost && isBoostActive(postBoost) ? postBoost : entityBoost,
        isPost: true,
      });
    });

    return feed;
  }, [boosts, featuredContent, rankedEntities]);

  const visibleFeedItems = useMemo(() => {
    return feedItems.slice(0, visibleCount);
  }, [feedItems, visibleCount]);
  const hasMore = visibleCount < feedItems.length;

  useEffect(() => {
    setVisibleCount((currentCount) => {
      const minCount = Math.min(FEED_BATCH_SIZE, feedItems.length);
      if (currentCount < minCount) {
        return minCount;
      }
      if (currentCount > feedItems.length) {
        return feedItems.length;
      }
      return currentCount;
    });
  }, [feedItems.length]);

  useEffect(() => {
    const queryEntityId = searchParams.get('entityId');
    if (!queryEntityId) {
      return;
    }

    const entityExists = rankedEntities.some((entity) => entity.id === queryEntityId);
    if (!entityExists) {
      return;
    }

    setSelectedEntityId(queryEntityId);
    setSelectedPostId(searchParams.get('postId'));
  }, [rankedEntities, searchParams]);

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      {/* Header */}
      <header className="bg-background">
        <div className="flex items-center justify-between px-5 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            <span className="text-primary">Ton</span>Discover
          </h1>
          <Link
            to="/search"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground transition-colors"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Card grid */}
      <section className="px-3">
        {visibleFeedItems.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground">No entities yet</h2>
            <p className="text-xs text-muted-foreground mt-2">Create one from the post tab, then return to explore.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visibleFeedItems.map((item) => (
              <DiscoveryTile
                key={item.id}
                entity={item.entity}
                featuredContent={item.featuredContent}
                boostState={item.boostState}
                isPost={item.isPost}
                onSelect={handleTileSelect}
              />
            ))}
          </div>
        )}

        {hasMore ? (
          <div className="flex justify-center pt-5">
            <button
              type="button"
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground"
              onClick={() => setVisibleCount((currentCount) => Math.min(currentCount + FEED_BATCH_SIZE, feedItems.length))}
            >
              Load more
            </button>
          </div>
        ) : null}
      </section>

      <BottomNav />

      {/* Entity detail overlay */}
      <EntitySheet entityId={selectedEntityId} postId={selectedPostId} onClose={closeSheet} />
    </main>
  );
};

export default Explore;
