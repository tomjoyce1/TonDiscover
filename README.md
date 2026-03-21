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
- optional shared feed sync endpoint for cross-user post visibility

## Shared post visibility (optional, for multi-user demo)

By default, published featured posts are stored in browser `localStorage`, which means only the current user/device sees them.

To make posts visible to all users, configure a shared JSON endpoint:

```bash
VITE_SHARED_FEED_URL=https://your-api.example.com/featured-overrides
```

Optional variables:

```bash
VITE_SHARED_FEED_READ_URL=https://your-api.example.com/featured-overrides
VITE_SHARED_FEED_WRITE_URL=https://your-api.example.com/featured-overrides
VITE_SHARED_FEED_WRITE_METHOD=PUT
VITE_SHARED_FEED_TOKEN=your_bearer_token
```

Read endpoint response format:

```json
{
  "featuredOverrides": []
}
```

Write request body format:

```json
{
  "featuredOverrides": []
}
```

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
