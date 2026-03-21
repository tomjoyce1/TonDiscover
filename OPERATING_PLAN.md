# TonDiscover — Detailed Operating Plan

## 0. Purpose of this document

This is the **execution and architecture plan** for TonDiscover.

It must be detailed enough for:

* the team to split work without ambiguity
* Codex to implement without inventing architecture
* merges to happen safely
* the demo path to stay protected at all times

This is not a concept note.
This is not a pitch.
This is the operational source of truth.

---

# 1. Product target

## 1.1 What we are building

TonDiscover is a **Telegram Mini App** for discovery of:

* public Telegram channels
* Telegram / TON-related Mini Apps

The experience is:

* browse-first
* visual-first
* mobile-first
* fast to understand
* easy to demo

## 1.2 What the demo must prove

The demo must prove 5 things clearly:

1. user can open the Mini App inside Telegram
2. user can browse a visual discovery feed of channels and apps
3. user can open a detail page and perform a direct action:

   * join a channel
   * launch an app
4. creator can register an entity and define what is featured
5. creator can boost visibility through TON or a safe TON-like fallback

## 1.3 Hard non-goals

We are not building:

* a full Telegram search engine
* a full Telegram index
* a real ML recommendation system
* a creator dashboard product
* an onchain reputation protocol
* a complete ad marketplace
* a complex backend platform

---

# 2. Delivery priorities

## P0 — survival

Must work:

* app opens
* no crash
* no white screen
* routing works
* local seeded data loads

## P1 — core demo path

Must work:

* onboarding
* explore feed
* detail page
* join / launch action
* creator hub
* register entity
* featured content selection
* boost path with visible effect

## P2 — useful support features

Should work if stable:

* favorites for apps
* recent launches/history for apps
* search bar over local dataset
* lightweight personalization

## P3 — visual improvements

Can be done in parallel branch only:

* nicer 2-column layout
* improved discovery tiles
* better spacing
* badges
* stronger hierarchy
* light motion

## P4 — nice extras

Only if everything else is frozen:

* stronger persistence
* better scoring tuning
* better transitions
* prettier loading/empty states

---

# 3. Team topology and responsibilities

## 3.1 Roles

### Person A — Integration / core owner

Owns:

* app shell
* routing
* page composition
* merge ownership
* cross-page navigation
* keeping happy path stable

### Person B — Data / logic owner

Owns:

* data models
* seeded dataset
* ranking logic
* local persistence
* search logic
* favorites/history logic
* boost logic or boost mock state

### Person C — UI owner

Owns:

* minimal UI implementation where needed
* reusable tile/component visuals
* layout system
* polish branch later
* visual consistency

## 3.2 Merge ownership

Only one person merges into integration branch at a time.
Default merge owner: **Person A**.

## 3.3 Ownership rule

Every task has:

* exactly one owner
* one visible output
* one validation step

No shared vague tasks like:

* “work on frontend a bit”
* “improve backend maybe”
* “do discovery thing”

---

# 4. Branching and lane model

## 4.1 Branches

* `main`: stable integration branch
* `lane-core`: product logic and all demo-critical implementation
* `lane-ui-polish`: visual polish only
* `lane-backend` optional and opened only if strictly necessary

## 4.2 Rules

### main

Used only for:

* validated merges
* stable state
* source of truth for demoable version

### lane-core

Contains:

* routing
* page skeletons
* state wiring
* data wiring
* forms
* search logic
* favorites/history
* personalization
* boost logic

### lane-ui-polish

Contains:

* tile layout improvements
* spacing
* typography hierarchy
* badges
* motion if safe
* feed aesthetic improvements

Must avoid:

* touching core ranking logic without coordination
* refactoring state structure casually
* changing route contracts

### lane-backend

Only open if we truly need:

* a tiny backend for boost persistence
* a tiny backend for registration persistence

Default assumption:
**no backend required for the first complete demo path**

## 4.3 Merge flow

Recommended:

1. merge `main` into working branch
2. develop
3. build/test locally
4. small PR / small diff
5. merge by merge owner

---

# 5. Core architecture

# 5.1 High-level architecture

TonDiscover architecture is split into 5 layers:

1. **Platform layer**

   * Telegram Mini App environment
   * wallet integration surface

2. **App shell layer**

   * routing
   * layout shell
   * navigation state

3. **Domain layer**

   * entities
   * featured content
   * boosts
   * user preferences
   * favorites/history

4. **View-model / state layer**

   * filtered lists
   * computed scores
   * onboarding state
   * search results
   * boost state

5. **Presentation layer**

   * pages
   * tiles
   * forms
   * badges
   * CTA components

This must stay simple.
No enterprise abstraction theater.

---

# 5.2 Suggested repo structure

```text
repo/
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ routes.tsx
│  │  ├─ providers/
│  │  └─ layout/
│  ├─ pages/
│  │  ├─ OnboardingPage/
│  │  ├─ ExplorePage/
│  │  ├─ EntityDetailPage/
│  │  ├─ FavoritesHistoryPage/
│  │  ├─ CreatorHubPage/
│  │  ├─ RegisterEntityPage/
│  │  ├─ FeaturedCardPage/
│  │  ├─ BoostPage/
│  │  └─ SearchPage/
│  ├─ components/
│  │  ├─ discovery/
│  │  ├─ entity/
│  │  ├─ creator/
│  │  ├─ boost/
│  │  ├─ search/
│  │  └─ common/
│  ├─ domain/
│  │  ├─ entities/
│  │  ├─ boosts/
│  │  ├─ personalization/
│  │  ├─ favorites/
│  │  └─ search/
│  ├─ data/
│  │  ├─ seeds/
│  │  ├─ adapters/
│  │  └─ repositories/
│  ├─ services/
│  │  ├─ telegram/
│  │  ├─ ton/
│  │  └─ storage/
│  ├─ hooks/
│  ├─ utils/
│  ├─ types/
│  └─ styles/
├─ public/
├─ AGENTS.md
├─ STATUS.md
├─ SKILLS.md
├─ OPERATING_PLAN.md
├─ README.md
└─ ...
```

## 5.3 Directory responsibilities

### `src/app`

App shell only:

* route registration
* top-level providers
* Telegram bootstrapping
* global layout wrappers

### `src/pages`

Page-level composition only.
Pages must not contain heavy business logic if avoidable.
They should call hooks/services/domain helpers.

### `src/components`

Reusable UI blocks.
No hidden app-wide state logic inside these.

### `src/domain`

Pure product logic:

* scoring
* mapping
* filtering
* personalization math
* helpers for boost visibility

### `src/data`

Seed files and repository-like access.
This lets us start local and later swap a minimal backend if necessary.

### `src/services`

External environment access:

* Telegram APIs or bridge helpers
* TON helpers
* localStorage helpers

### `src/hooks`

Hooks that combine domain + storage + page usage.

### `src/types`

Explicit shared TypeScript types.

---

# 6. Routing architecture

## 6.1 Required routes

### `/`

* redirect to onboarding or explore depending on state

### `/onboarding`

* choose interests

### `/explore`

* main feed

### `/entity/:id`

* detail page for channel/app

### `/favorites`

* favorites and recent launches

### `/creator`

* creator hub

### `/creator/register`

* register channel/app

### `/creator/featured`

* choose featured content / build featured card

### `/creator/boost/:id`

* boost specific entity

### `/search`

* search results page or overlay-backed route

## 6.2 Route contract rule

Every route must be able to render even with incomplete optional data.
No route should hard crash because:

* video preview is missing
* tag list is empty
* boost expiry is null

---

# 7. Domain model architecture

# 7.1 Core types

## Entity

Represents either a channel or an app.

Suggested fields:

* `id: string`
* `type: 'channel' | 'app'`
* `name: string`
* `telegramUrl: string`
* `category: string`
* `tags: string[]`
* `shortDescription: string`
* `longDescription?: string`
* `avatarOrCover: string`
* `contentType: 'text' | 'image' | 'video'`
* `previewText?: string`
* `previewMediaUrl?: string`
* `subscriberCount?: number`
* `usageIndicator?: number`
* `postsLast7Days?: number`
* `launchCount?: number`
* `lastActivityAt?: string`
* `joinCountFromApp?: number`
* `launchCountFromApp?: number`
* `featuredContentId?: string`
* `isBoosted?: boolean`
* `boostExpiresAt?: string | null`

## FeaturedContent

Represents what is shown in discovery card/detail hero.

Suggested fields:

* `id: string`
* `entityId: string`
* `mode: 'latest' | 'pinned' | 'specific' | 'manual'`
* `contentType: 'text' | 'image' | 'video'`
* `title?: string`
* `text?: string`
* `mediaUrl?: string`
* `sourcePostId?: string`
* `sourceLabel?: string`

## UserPreferences

Suggested fields:

* `selectedCategories: string[]`
* `categoryWeights: Record<string, number>`
* `recentSearches: string[]`

## FavoritesState

Suggested fields:

* `favoriteAppIds: string[]`

## HistoryState

Suggested fields:

* `recentLaunchedAppIds: string[]`
* `recentOpenedEntityIds?: string[]`

## BoostState

Suggested fields:

* `entityId: string`
* `status: 'inactive' | 'pending' | 'active' | 'failed'`
* `startedAt?: string`
* `expiresAt?: string`
* `source: 'mock' | 'ton'`

---

# 7.2 Domain logic modules

### `domain/entities`

Responsible for:

* entity typing
* entity normalization
* helper selectors

### `domain/boosts`

Responsible for:

* boost state logic
* boosted sorting bonus
* expiry checks

### `domain/personalization`

Responsible for:

* category weight updates
* score bonus calculation
* clipping/capping weights

### `domain/search`

Responsible for:

* local dataset search
* ranking search results by textual match

### `domain/favorites`

Responsible for:

* add/remove favorites
* dedupe history
* recent launch ordering

---

# 8. Data source strategy

## 8.1 Initial source of truth

Initial build must use **local seeded JSON** only.

Why:

* zero API dependency
* zero backend dependency
* deterministic demo
* easier merge flow

## 8.2 Seed files

Recommended split:

* `data/seeds/entities.ts`
* `data/seeds/featuredContent.ts`
* `data/seeds/categories.ts`

## 8.3 Seed requirements

Seed at least:

* 20 to 30 entities total
* both channels and apps
* 5 to 6 categories
* mixed content types:

  * text
  * image
  * video
* at least 2 boosted examples
* at least 3 apps for favorites/history demo

## 8.4 Repository abstraction

Even when using local JSON, expose access through small helpers:

* `getAllEntities()`
* `getEntityById(id)`
* `getFeaturedContentForEntity(id)`
* `searchEntities(query)`

This helps if a minimal backend is added later.

---

# 9. State architecture

# 9.1 State split

## App shell state

* route-level only
* open/close overlays if needed

## Persistent local state

Stored in localStorage:

* onboarding interests
* favorites
* recent launches/history
* personalization category weights
* optional mocked registrations

## Derived state

Computed in memory:

* filtered feed
* final scores
* search result ordering
* boosted badges

## Temporary page state

* form inputs
* selected featured mode
* current filter chip
* search query

---

# 9.2 localStorage contract

Suggested keys:

* `tondiscover:onboarding`
* `tondiscover:favorites`
* `tondiscover:history`
* `tondiscover:preferences`
* `tondiscover:registeredEntities`
* `tondiscover:boosts`

Rule:
Create a tiny storage helper layer instead of calling `localStorage` everywhere.

Example service responsibilities:

* safe parse
* default values
* version-tolerant reads

---

# 10. Ranking architecture

# 10.1 Feed ranking philosophy

The ranking must be:

* easy to explain
* deterministic enough for the demo
* lightly personalized
* visibly affected by boost

## 10.2 Ranking equation

Recommended structure:

`finalScore = globalScore + personalizationBonus`

Where:

`globalScore = editorialScore + activityScore + engagementScore + boostScore`

### editorialScore

Manual seed curation score.
Useful because seeded demos need quality control.

### activityScore

Derived from:

* postsLast7Days
* lastActivityAt recency
* launchCount for apps if needed

### engagementScore

Derived from:

* joinCountFromApp
* launchCountFromApp

### boostScore

Large temporary fixed bonus when active.
Must be big enough to be visible.

### personalizationBonus

Small capped bonus based on user preferences and behavior.
Must never dominate global ranking.

## 10.3 Personalization update rules

Recommended local rules:

* onboarding category selected: `+3`
* open entity in category: `+2`
* join channel in category: `+4`
* launch app in category: `+4`
* favorite app in category: `+3`
* repeated skips or no interaction: `-1`

Cap weights to avoid runaway ranking.

## 10.4 Ranking implementation rule

Ranking code must live in domain helpers, not directly inside JSX.

---

# 11. Search architecture

## 11.1 Search scope

Search is secondary.
It must not become the product.

## 11.2 Search implementation

MVP implementation searches only local seeded data over:

* entity name
* short description
* long description
* preview text
* tags
* maybe featured content text

## 11.3 Search UI behavior

* lightweight search bar on explore page
* opens search page or overlay
* results separated or labeled by type:

  * channels
  * apps
  * maybe posts/snippets if available from featured content

## 11.4 Fallback

If search becomes annoying:

* limit it to entities only
* show text snippets as “matched content” instead of full post search

---

# 12. Favorites and history architecture

## 12.1 Scope

Apps only.
Do not complicate it.

## 12.2 Favorites

Behavior:

* toggle favorite on app detail or card
* persist locally
* show in favorites tab

## 12.3 History

Behavior:

* when app is launched, add app ID to recent history
* keep most recent first
* dedupe entries
* cap length, e.g. 10 or 20

## 12.4 Route/page

One `FavoritesHistoryPage` with tabs:

* favorites
* recent

---

# 13. Creator flow architecture

# 13.1 Creator hub

Page contains 3 action cards:

* Register entity
* Create featured card
* Boost visibility

Only the first two must work before boost.

# 13.2 Register entity flow

## Form fields

* type: channel/app
* name
* URL
* category
* short description
* optional long description
* image URL or placeholder
* tags

## Submission behavior

For MVP:

* store locally or in memory
* show success state
* newly registered entity should become visible in feed or preview list if feasible

## Validation

Keep validation simple:

* required fields only
* no advanced URL verification needed beyond basic sanity

# 13.3 Featured card flow

## Purpose

Creators choose what preview users will see.

## Modes

* latest
* pinned
* specific
* manual

## MVP simplification

Because real Telegram post fetching is risky, support these safely:

* `latest` -> maps to seeded placeholder content
* `pinned` -> maps to seeded placeholder content
* `specific` -> choose from a local mocked list
* `manual` -> fill text/image/video preview directly

## Output

Writes a `FeaturedContent` object tied to an entity.

# 13.4 Boost flow

## Minimum UI states

* select duration/option
* connect wallet or show mocked connect
* activate boost
* success confirmation
* visible feed effect

## Absolute rule

A boost must change something the user can immediately see:

* badge
* sorting position
* “boosted until” indicator

---

# 14. TON integration architecture

# 14.1 Required product effect

TON is here to support:

* creator-paid visibility boost

Nothing more.

# 14.2 Integration modes

## Mode A — Real-ish TON Connect path

* wallet connect via TON Connect
* user signs/sends tx
* app marks boosted after local confirmation or minimal response path

## Mode B — Safe demo mode

* wallet connect UI real or simulated
* payment confirmation mocked
* boost state activated locally

## 14.3 Recommended implementation strategy

Implement the boost system behind one service interface:

* `connectWallet()`
* `activateBoost(entityId, option)`
* `getBoostState(entityId)`

Then internally swap between:

* real TON implementation
* mock implementation

This avoids rewriting page logic.

## 14.4 Rule

Page-level components must not care whether boost is real or mocked.
They should just consume boost status.

---

# 15. UI architecture

# 15.1 UI phases

## Phase 1 — Minimal UI

Goal:

* usable
* readable
* mobile-first
* quick to build

Characteristics:

* simple layout
* simple typography
* basic chips/buttons
* clean but not fancy

## Phase 2 — UI polish

Done in `lane-ui-polish` only after happy path is stable.

Characteristics:

* stronger tile composition
* better spacing
* visual hierarchy
* improved CTA contrast
* optional light motion

## 15.2 Design rules

* no visual change may block the core flow
* support text/image/video previews with safe fallbacks
* video should default to thumbnail/poster if risky
* 2-column explore layout is preferred but can degrade safely if needed

## 15.3 Shared UI components

Required components:

* `DiscoveryTile`
* `MediaPreview`
* `FilterChipBar`
* `EntityMetaRow`
* `BoostBadge`
* `ActionCard`
* `SearchBar`
* `FavoriteButton`
* `BoostOptionCard`
* `FeaturedContentPicker`

### Component responsibilities

#### `DiscoveryTile`

Props:

* entity
* featuredContent
* action handlers

Displays:

* media preview
* badge(s)
* entity meta
* CTA

#### `MediaPreview`

Handles:

* text preview
* image preview
* video thumbnail/preview
* safe fallback

#### `FeaturedContentPicker`

Handles:

* latest
* pinned
* specific
* manual

#### `BoostOptionCard`

Handles:

* duration
* price
* selection state

---

# 16. Page-by-page architecture

# 16.1 OnboardingPage

## Responsibilities

* show category choices
* persist selected interests
* route to explore

## Dependencies

* categories seed
* storage service

## Validation

Done when:

* user can select 3+
* continue persists state
* next route opens correctly

---

# 16.2 ExplorePage

## Responsibilities

* show 2-column discovery grid
* show filters/chips
* show search bar
* compute ranked entities
* open detail pages

## Dependencies

* entities repository
* featured content repository
* ranking domain helpers
* preferences state

## Validation

Done when:

* feed renders from local data
* channels and apps both appear
* tile content types render
* filters affect view
* boosted entities are visibly marked

---

# 16.3 EntityDetailPage

## Responsibilities

* show hero/media preview
* show metadata/stats
* show Join or Launch CTA
* allow favorite for apps

## Dependencies

* entity by ID
* featured content by entity ID
* favorites/history service

## Validation

Done when:

* page opens from feed
* app favorite works
* launch updates history
* join/launch CTA is clear

---

# 16.4 FavoritesHistoryPage

## Responsibilities

* render favorite apps
* render recent launches
* allow relaunch

## Dependencies

* favorites state
* history state
* entity repo

## Validation

Done when:

* favorite apps list displays
* recent launches update after launch

---

# 16.5 CreatorHubPage

## Responsibilities

* route user to creator actions
* clearly separate:

  * register entity
  * create featured card
  * boost visibility

## Validation

Done when:

* page is understandable without explanation

---

# 16.6 RegisterEntityPage

## Responsibilities

* capture entity metadata
* create local entity entry
* persist if needed

## Dependencies

* local storage service or temporary state

## Validation

Done when:

* minimal submit works
* data structure created cleanly

---

# 16.7 FeaturedCardPage

## Responsibilities

* let creator choose featured mode
* produce local `FeaturedContent`
* preview result if possible

## Dependencies

* entity selection
* local/mock recent posts list

## Validation

Done when:

* one featured content object can be attached to entity

---

# 16.8 BoostPage

## Responsibilities

* select boost option
* connect wallet/mock
* activate boost
* confirm visibility effect

## Dependencies

* boost service
* selected entity

## Validation

Done when:

* activating boost changes the feed outcome visibly

---

# 16.9 SearchPage / SearchOverlay

## Responsibilities

* capture query
* show local dataset results
* route to selected entity

## Dependencies

* search domain helpers

## Validation

Done when:

* searching returns meaningful local results

---

# 17. Build order with file-level intent

## Phase 1 — Bootstrap

Files first:

* `src/app/App.tsx`
* `src/app/routes.tsx`
* `src/pages/*` placeholder files
* control files at repo root

Output:

* app starts
* routing works

## Phase 2 — Types and seeds

Files:

* `src/types/entities.ts`
* `src/types/featuredContent.ts`
* `src/data/seeds/entities.ts`
* `src/data/seeds/featuredContent.ts`
* `src/data/seeds/categories.ts`

Output:

* typed local data exists

## Phase 3 — Repositories and services

Files:

* `src/data/repositories/entitiesRepo.ts`
* `src/services/storage/*`
* `src/domain/*` ranking/search helpers

Output:

* pages can read consistent data

## Phase 4 — Core pages minimal

Files:

* `OnboardingPage`
* `ExplorePage`
* `EntityDetailPage`
* `CreatorHubPage`

Output:

* first user navigation works

## Phase 5 — Core components minimal

Files:

* `DiscoveryTile`
* `MediaPreview`
* `FilterChipBar`
* `EntityMetaRow`
* `SearchBar`

Output:

* feed becomes real

## Phase 6 — Secondary logic

Files:

* favorites/history hooks/services
* search helper
* personalization helper

Output:

* support features work

## Phase 7 — Creator and boost

Files:

* `RegisterEntityPage`
* `FeaturedCardPage`
* `BoostPage`
* `services/ton/*`
* `domain/boosts/*`

Output:

* creator demo path works

## Phase 8 — UI polish lane

Files mostly in:

* `components/*`
* page layout styling
* shared style utilities

Output:

* improved look without touching architecture unnecessarily

---

# 18. Checkpoints and proof of completion

## Checkpoint 0 — Repo control ready

Proof:

* repo runs
* control files committed
* branches exist

## Checkpoint 1 — Skeleton stable

Proof:

* route to placeholder pages works
* local seeded data imports successfully

## Checkpoint 2 — Explore feed alive

Proof:

* onboarding -> explore works
* 2-column grid renders mixed entity types

## Checkpoint 3 — Entity action path alive

Proof:

* detail page opens
* join works
* launch works
* app favorite/history updates

## Checkpoint 4 — Creator path alive

Proof:

* creator hub usable
* register form works
* featured content selection works minimally

## Checkpoint 5 — Boost visible

Proof:

* boost activation causes visible reorder + badge

## Checkpoint 6 — Secondary support stable

Proof:

* search works locally
* personalization lightly shifts feed

## Checkpoint 7 — Demo freeze candidate

Proof:

* full flow works without explanation
* unstable features removed or mocked safely

---

# 19. Exact validation checklist

## Build checklist

* install works
* dev server works
* no secret env required for local demo except optional TON setup
* app does not crash on missing optional media

## Functional checklist

* onboarding saves
* explore feed loads
* at least one text tile works
* at least one image tile works
* at least one video preview degrades safely
* filters work
* detail page works
* join opens link
* launch opens link
* favorite toggles
* history updates
* creator register works
* featured content is selectable
* boost changes ranking visibly
* search returns results

## Demo checklist

* all main clicks succeed
* no critical network dependency required for demo path if avoidable
* one fallback exists for TON if needed

---

# 20. Risk register and fallback matrix

## Risk: Telegram/TON integration too slow

Fallback:

* keep UI authentic
* mock success path
* preserve visible boost effect

## Risk: Search too ambitious

Fallback:

* entity-only search
* preview snippet match only

## Risk: Video tiles unstable

Fallback:

* poster image only
* no autoplay
* fallback to image or text

## Risk: Featured content selection too complex

Fallback:

* support only latest/pinned/manual
* specific-post mode mocked with static list

## Risk: lane-ui-polish conflicts heavily

Fallback:

* stop merging polish
* demo from minimal core UI

## Risk: scope explosion

Cut in this order:

1. advanced search segmentation
2. rich specific-post picker
3. nuanced personalization
4. rich video behavior
5. fancy animations

Never cut:

* app load
* feed
* detail
* join/launch
* creator registration
* visible boost effect

---

# 21. 45-minute operating cadence

Every 45-minute block must produce:

* one concrete target
* 2 to 4 tasks max
* one owner per task
* one proof per task

## Required status format

At end of each block record:

* done
* blocked
* changed files
* next block

## Forbidden block outcomes

* “we discussed a lot”
* “we explored options”
* “we almost finished”

A block must output something visible.

---

# 22. Codex instructions on top of this plan

When using Codex on this repo:

1. read `AGENTS.md`
2. read `STATUS.md`
3. read `SKILLS.md`
4. read this `OPERATING_PLAN.md`
5. identify the current checkpoint
6. propose the smallest safe next step
7. preserve minimal UI first
8. treat polish as separate branch work

## Codex must always report

* current checkpoint
* files it wants to change
* smallest implementation path
* how to test
* fallback if risky

## Codex must not do

* architecture rewrites unless requested
* large refactors casually
* add heavy dependencies without strong reason
* block the demo on elegance

---

# 23. Freeze rules

Once the full happy path works:

* no new features
* only bug fixes
* only demo-critical polish
* only safe merges
* no new risky dependency
* no architecture changes

The final target is not “most advanced app”.
The target is:
**most stable and convincing demo for the time available.**

---

# 24. Final summary

## Execution order

1. repo + template + control files
2. routing + page shells
3. types + seeds
4. repositories + storage helpers
5. onboarding + explore + detail
6. favorites/history/search/personalization
7. creator registration + featured content
8. boost flow
9. UI polish in separate branch
10. freeze and rehearse demo

## Core law

At every moment, preserve the smallest path to a working demo.
