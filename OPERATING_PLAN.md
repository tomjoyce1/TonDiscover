# TonDiscover — Operating Plan v2 (Hackathon)

## 1) Mission and hard constraints

Build a stable Telegram Mini App demo for channel/app discovery with a visible TON boost effect.

Hard constraints:
- no crash, no white screen, mobile-first
- happy path first: onboarding → explore → detail → join/launch → visible boost
- minimal UI in `core`, polish later in `ui`
- seeded local data first, no heavy backend
- if TON payment is risky, fallback to mock success while keeping boost visibility

Branch model:
- `master`: stable integration and demo branch
- `core`: product logic and demo-critical implementation
- `ui`: visual polish only after `core` is stable

---

## 2) Milestone ladder (small, objective-driven)

### M0 — Repo control and docs sync
Objective: align operating docs and branch references with real repo.

Work:
- set all control docs to `master` / `core` / `ui`
- remove lane naming and backend lane references
- confirm scope: TON payment lives only in boost flow

Visible output:
- docs reflect the same branch model and same scope

Acceptance:
- no `main` / `lane-core` / `lane-ui-polish` references remain in control docs

ASK USER (Decision)
Context: Confirm the team uses `master` for demos and only merges stable work there.
Options: `master` as release branch, or `core` as release branch.
Default if no answer: Use `master` as stable release/demo branch.

---

### M1 — Route skeleton and page shells
Objective: every MVP route exists and renders safely with minimal UI.

Work:
- define routes for onboarding, explore, detail, favorites, creator, featured, boost, search
- keep app shell + Telegram integration stable
- ensure root route redirects by onboarding state

Visible output:
- user can open every route without crashes

Acceptance:
- route navigation works end-to-end in local run

ASK USER (Decision)
Context: Choose default landing behavior after first launch.
Options: redirect to onboarding first, or always open explore.
Default if no answer: redirect to onboarding until completed.

---

### M2 — Seed model and local repositories
Objective: move from template data to TonDiscover domain data.

Work:
- define `Entity`, `FeaturedContent`, `BoostState`, `UserPrefs`, `FavoritesState`, `HistoryState`
- add local seeds for mixed channels + apps and featured content
- expose repository helpers:
  - `getEntities()`
  - `getEntityById()`
  - `getFeaturedByEntityId()`
  - `searchEntities(query)`

Visible output:
- explore page reads TonDiscover entities from local seeds

Acceptance:
- mixed channel/app cards render from seed data only

ASK USER (Decision)
Context: Confirm seed volume for demo readability vs speed.
Options: 8–12 entities, 20+ entities, or dynamic generator.
Default if no answer: 8–12 hand-curated entities.

---

### M3 — Explore feed minimal
Objective: browse-first feed is functional and explainable.

Work:
- render feed tiles with text/image/video safe fallback
- add lightweight category filters
- keep utility search entry point visible but secondary
- show boost badge when active

Visible output:
- user can browse a visual feed quickly and open details

Acceptance:
- feed loads without network dependency beyond asset URLs
- boosted entries are visibly labeled

ASK USER (Decision)
Context: Choose feed density for demo.
Options: 2-column default, 1-column default, auto-switch by width.
Default if no answer: auto-switch by width (2-column desktop-ish, 1-column narrow mobile).

---

### M4 — Detail + join/launch path
Objective: complete core user action path from feed to action.

Work:
- detail page with media preview + metadata
- CTA behavior:
  - channel → Join
  - app → Launch
- record open/launch behavior locally

Visible output:
- onboarding → explore → detail → join/launch is testable

Acceptance:
- action buttons open target links and return path remains stable

ASK USER (Decision)
Context: Confirm whether action opens inside Telegram webview or external tab.
Options: external tab, same webview, or per-entity configurable.
Default if no answer: external tab with safe browser behavior.

---

### M5 — Favorites and history
Objective: add support features without breaking browse-first flow.

Work:
- app favorites toggle
- launched-app history tracking
- localStorage persistence + rehydration

Visible output:
- favorites/history page shows state changes after interactions

Acceptance:
- data survives refresh and app reopen

ASK USER (Decision)
Context: Set max history size for stable UX.
Options: keep 10, keep 20, unlimited.
Default if no answer: keep 20.

---

### M6 — Creator register + featured content
Objective: creator flow is demoable with local data only.

Work:
- register entity form (minimal required fields)
- featured content editor (latest/pinned/specific/manual)
- persist creator outputs locally
- reflect updates in explore/detail

Visible output:
- newly registered entity and featured content appear in product flow

Acceptance:
- creator path works without backend

ASK USER (Decision)
Context: define validation strictness during hackathon.
Options: required fields only, required + basic URL check, strict validation.
Default if no answer: required fields only.

---

### M7 — Boost payment + visible ranking effect
Objective: TON-backed boost flow works and visibly changes feed order.

Work:
- implement boost service contract:
  - `connectWallet()`
  - `activateBoost(entityId, option)`
  - `getBoostState(entityId)`
- use native TON transfer for boost payment
- on payment failure/blocked flow, fallback to mock success in demo mode
- apply rank bonus + badge + expiry display

Visible output:
- boosted entity moves up and is explicitly labeled

Acceptance:
- wallet connect + boost activation both produce visible effect

ASK USER (Decision)
Context: choose default runtime mode for live demo rehearsal.
Options: TON-first with auto-mock fallback, force mock mode, TON-only strict.
Default if no answer: TON-first with auto-mock fallback.

---

### M8 — Demo freeze and proof checklist
Objective: freeze stable demo and stop scope drift.

Work:
- run full happy-path manual script
- remove unstable extras, keep deterministic behavior
- lock `core`, allow only bug fixes
- start `ui` polish only if no core regressions

Visible output:
- one-click demo path that works without explanation

Acceptance:
- no critical blockers in happy path checklist

ASK USER (Decision)
Context: define freeze threshold for switching from feature work to rehearsal.
Options: freeze after M7 pass once, freeze after two consecutive passes, no freeze.
Default if no answer: freeze after two consecutive passes.

---

## 3) Risk and fallback matrix

| Risk | Fallback |
|---|---|
| TON wallet flow unstable | enable mock boost success path while preserving badge + rank effect |
| feed media causes instability | fallback to image or text preview, disable risky video behavior |
| scope expansion | cut in order: advanced search → extra personalization → UI polish extras |
| creator flow too broad | keep register + one featured mode working, postpone advanced modes |
| UI branch conflict | stop `ui` merges and demo directly from stable `core` |

---

## 4) Operator checklist (Codex + humans)

Before any implementation block:
1. Read `AGENTS.md`, `STATUS.md`, `SKILLS.md`, this file.
2. State active milestone (M0..M8).
3. List smallest safe diff.
4. List manual validation steps and fallback.

For each block:
- one owner
- 1–3 tasks max
- one visible proof
- no large refactor

Status note format:
- Done
- Blocked
- Files changed
- Next milestone step

Freeze law:
- once M8 criteria pass, no new features in `core`
- only demo-critical bug fixes
- UI polish continues in `ui` and must not block demo
