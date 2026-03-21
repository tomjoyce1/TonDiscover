# AGENTS.md

## Mission
Build a stable, clear, demo-ready version of **TonDiscover** in a hackathon setting.
Absolute priority: **a working demo**.

## Priority order
1. App opens reliably, no crash, no white screen
2. Complete happy path: onboarding -> explore -> detail -> join/launch -> visible boost
3. **Minimal but readable UI**
4. Favorites/history and utility search
5. Lightweight personalization
6. UI polish in a separate branch
7. Refactor / optimization only if everything else is solid

## Product rules
- TonDiscover is a **visual discovery Telegram Mini App**
- The product is **browse-first**, not search-first
- The feed mixes **channels + apps**
- Cards can contain **text, image, or video**
- Apps have **favorites + lightweight history**
- Post search is **secondary**
- TON is used to **boost visibility**
- A boost must be **visible, simple, and labeled**

## Non-goals
Do not build:
- a full Telegram search engine
- an ML recommendation engine
- an onchain reputation system
- staking / vouching
- a complex backend
- large-scale scraping
- an advanced creator dashboard
- advanced analytics
- a full marketplace
- ultra-polished UI from the start

## UI strategy
### Phase 1 — Minimal UI
Goal:
- functional interface
- mobile-first
- clean but simple
- basic components
- no complex animations
- no expensive micro-interactions

This phase lives on the main build branch.

### Phase 2 — UI polish in parallel
Once the happy path is stable, visual improvements can be developed in **a dedicated separate Git branch**, then integrated after validation.

Example strategy:
- `main` or integration branch: stable base
- `lane-core`: product logic / happy path / integrations
- `lane-ui-polish`: visual improvements, layout, light animations, better-looking cards

### Absolute rule
The UI branch must **never** block the demo.
If a visual choice threatens:
- stability
- pace
- clarity

then keep the minimal version.

## Execution rules
- simplicity > sophistication
- speed > elegance
- proof > intuition
- a local patch > a global refactor
- every risky integration must have a fallback
- if blocked for more than 20 minutes: simplify, mock, or bypass

## Code rules
- TypeScript strict
- small, readable components
- no new dependency without a clear justification
- no large refactor unless explicitly requested
- no intentional dead code
- no vague TODOs everywhere
- prefer local state and seeded data at first
- add comments only when useful

## UI rules
### Minimal UI first
- mobile-first
- clear structure
- strong readability
- simple styling
- 2-column discovery feed if quick to implement
- fallback to 1 column if needed at the very beginning
- video with simple fallback
- no complex autoplay if fragile

### UI polish later
- better visual hierarchy
- better tiles
- cleaner spacing
- improved badges and CTAs
- light animations if safe
- stronger “Snap/Discover” feel if the core already works

## Data rules
- start with seeded JSON
- localStorage for preferences / favorites / history
- backend only if needed for boost or minimal persistence
- all models must stay small and understandable

## TON rules
- TON Connect only for the boost flow
- no tokenomics
- no complicated financial logic
- if risky, mock boost success in the demo environment

## Work structure
- one owner per task
- do not edit the same sensitive files in parallel
- prefer small PRs / small diffs
- always explain:
  - what changed
  - why
  - how to test it

## Git / branches
- `main`: stable / integration branch
- `lane-core`: product features and main logic
- `lane-ui-polish`: parallel UI improvements
- single merge owner
- do not mix large visual refactors and business logic in the same diff

## Definition of done
A task is done only if:
- it runs locally
- it does not break the happy path
- it is manually testable
- its effect is visible in the demo

A UI polish task is done only if:
- it did not break the minimal version
- it is easy to merge
- it does not introduce unnecessary complexity

## Expected agent behavior
When proposing a solution:
- choose the simplest one that works
- state assumptions
- state risks
- propose a fallback when useful
- avoid scope drift
- always distinguish:
  - **minimal shippable version**
  - **improved version later**