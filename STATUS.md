# STATUS.md

## Project
TonDiscover

## Current goal
Ship a Telegram Mini App for visual discovery of channels + apps, with a simple TON boost flow and a stable demo.

## Current state
- Concept locked
- Core routes migrated to TonDiscover pages
- Seeded channels + apps integrated
- localStorage states wired (onboarding, favorites, history, boosts)
- TON boost flow scoped to native transfer with safe mock fallback
- Template shop/USDT pages removed
- Strategy confirmed: **minimal UI first, UI polish later in a separate branch**

## Selected MVP
- Lightweight interest onboarding
- Explore feed for channels + apps
- Entity detail page
- Join / Launch
- Favorites + history for apps
- Creator flow:
  - register entity
  - create featured card
  - boost visibility
- Lightweight post search bar
- Visible and simple TON boost

## UI strategy
### Phase 1
Build a **minimal**, functional, readable UI:
- simple layout
- basic components
- clear navigation
- no expensive polish

### Phase 2
Build **visual polish in a separate Git branch**:
- improved tiles
- stronger visual hierarchy
- better rhythm and layout
- possibly light animations
- merge only after validation on a stable base

## Working branches
- `master`: stable integration
- `core`: product logic, pages, data, boost
- `ui`: parallel visual improvements

## Out of scope
- real AI recommendations
- heavy backend
- large-scale scraping
- staking / reputation
- advanced analytics
- full search engine
- UI polish blocking core product

## Main risks
- scope expansion
- video becoming too complex
- unnecessarily heavy backend
- TON integration blocking progress
- frontend / backend divergence
- UI branch drifting too far from the stable base

## Fallbacks
- seeded JSON everywhere at first
- localStorage for history / favorites / preferences
- mocked boost if TON integration takes too long
- simplified search over the dataset
- replace video with image / text if unstable
- postpone UI polish if it threatens integration

## Immediate priorities
1. Validate onboarding -> explore -> detail -> join/launch
2. Validate favorites/history persistence
3. Validate creator register + featured content flow
4. Validate boost visibility (badge + ranking change)
5. Freeze `core` for demo stability
6. Start safe visual polish on `ui` only after `core` is stable

## Source of truth
- local build
- manual demo
- files in the repo
