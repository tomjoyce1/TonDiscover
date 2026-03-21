# TonDiscover (Hackathon Build)

TonDiscover is a Telegram Mini App for visual discovery of channels and apps.

## Demo priorities

1. Stable app start (no crash/white screen)
2. Happy path: onboarding → explore → detail → join/launch → visible boost
3. Minimal readable UI first
4. Favorites/history + utility search
5. UI polish only after core stability

## Branches

- `master`: stable demo/integration
- `core`: product logic and demo path
- `ui`: visual polish lane

## Current MVP scope

- onboarding interests
- explore feed with channels + apps
- entity detail with Join/Launch
- favorites and launch history (localStorage)
- creator register + featured content
- boost visibility flow with TON-first payment and safe mock fallback

## Tech notes

- React + TypeScript + Vite
- Telegram Mini App SDK
- TonConnect for wallet flow
- local seeded data first (no required backend)

## Local run

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Control files

- `AGENTS.md` — execution guardrails
- `STATUS.md` — current project status
- `SKILLS.md` — team implementation skills/playbook
- `OPERATING_PLAN.md` — milestone-by-milestone operating plan
