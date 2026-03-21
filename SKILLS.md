# SKILLS.md

## Skill 1 — Build page fast
When building a page:
1. create the structure
2. wire mock data
3. render empty / minimal loading state
4. add the main CTA
5. verify mobile-first behavior
6. do not polish too early

## Skill 2 — Add component
When adding a component:
1. keep props simple
2. support only minimal variants
3. avoid business logic inside it
4. keep it reusable
5. test it with realistic seeded data

## Skill 3 — Handle risky feature
For any risky feature:
1. build the simple version first
2. define an explicit fallback
3. avoid heavy dependencies
4. do not block the happy path

## Skill 4 — Discovery feed logic
The feed must remain:
- browse-first
- visual
- fast
- explainable

Ranking order:
- boosted
- simple global score
- small local personalization

## Skill 5 — Personalization
Personalization must:
- stay local
- stay lightweight
- never dominate the global feed
- use:
  - onboarding interests
  - opens
  - joins
  - launches
  - favorites
  - skips

## Skill 6 — TON integration
TON must remain:
- limited to boosting
- visible in the demo
- easy to explain
- easy to roll back / mock if needed

## Skill 7 — Search
Search is a utility:
- small
- secondary
- acceptable if limited to the dataset
- must never delay the core product

## Skill 8 — UI strategy
Always separate:
- **minimal UI to ship**
- **UI polish to improve**

### Minimal UI
Goal:
- make everything usable quickly
- simple components
- sober styles
- clear structure
- no complex animation dependencies

### UI polish
Goal:
- improve visual impact
- improve tiles
- improve spacing / badges / CTAs
- make the feed feel more “discover/explore”

### Rule
Never wait for polish to validate a page.
Every page must exist first in a minimal version.

## Skill 9 — Git branch discipline
When there is a parallel UI branch:
1. keep business logic in the core branch
2. avoid modifying the same files everywhere when possible
3. isolate visual changes
4. merge only after validation
5. do not let the polish branch redefine the product

## Skill 10 — Hackathon behavior
Always prefer:
- working code
- small diffs
- fast manual testing
- simple components
- clear fallbacks
- minimal UI first
- polish later