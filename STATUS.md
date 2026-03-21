# STATUS.md

## Project
TonDiscover

## Current goal
Ship a Telegram Mini App for visual discovery of channels + apps, with a simple TON boost flow and a stable demo.

## Current state
- Concept locked
- Main pages defined
- 2-column visual feed targeted
- Creator flow clarified
- MVP scope clarified
- Repo / template still needs initialization
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
- `main`: stable integration
- `lane-core`: product logic, pages, data, boost
- `lane-ui-polish`: parallel visual improvements

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
1. Initialize the repo from a Telegram Mini App template
2. Set up page structure + routing
3. Integrate seeded dataset
4. Build minimal UI
5. Build feed + detail + creator flow
6. Add TON boost after that
7. Start the UI polish branch in parallel once the base is stable

## Source of truth
- local build
- manual demo
- files in the repo