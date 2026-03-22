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

## TonConnect in Telegram Mini App

For official Telegram Wallet compatibility:

- Use a root manifest URL (`https://<public-host>/tonconnect-manifest.json`)
- Set a TMA return URL (`VITE_TWA_RETURN_URL=https://t.me/<your_bot_or_app>`)
- Avoid free tunnel interstitial pages (they can return warning HTML instead of manifest JSON)

Optional env variables:

```bash
VITE_TONCONNECT_MANIFEST_URL=https://<public-host>/tonconnect-manifest.json
VITE_TWA_RETURN_URL=https://t.me/tondiscover
VITE_CREATOR_REPUTATION_CONTRACT_ADDRESS=<deployed-ton-contract-address>
```

## Creator reputation contract

This repo now includes a TON contract workspace in `ton-contracts/reputation`.

It tracks:

- submissions per wallet
- boosts per wallet
- total TON spent per wallet

Quick flow:

1. Build and deploy the contract from `ton-contracts/reputation`
2. Set `VITE_CREATOR_REPUTATION_CONTRACT_ADDRESS`
3. Restart the app
4. Open `My Profile -> Identity` to see on-chain metrics

## Shared post visibility (optional, for multi-user demo)

By default, published featured posts are stored in browser `localStorage`, which means only the current user/device sees them.

Default setup uses same-origin shared API (recommended for hackathon):

```bash
VITE_SHARED_FEED_URL=/shared-feed
```

Optional variables:

```bash
VITE_SHARED_FEED_READ_URL=/shared-feed
VITE_SHARED_FEED_WRITE_URL=/shared-feed
VITE_SHARED_FEED_WRITE_METHOD=PUT
VITE_SHARED_FEED_TOKEN=your_bearer_token
```

When configured, each app instance also auto-refreshes shared featured posts (focus + periodic pull) so friend posts appear without manual patching.

Read endpoint response format:

```json
{
  "featuredOverrides": [],
  "registeredEntities": []
}
```

Write request body format:

```json
{
  "featuredOverrides": [],
  "registeredEntities": []
}
```

Quick start shared mode:

```bash
# Terminal 1: shared feed backend
npm run shared-feed

# Terminal 2: mini app
npm run dev

# Terminal 3: public tunnel for app + shared API
npm run public-app
```

Share the ngrok app URL with your friend. Because `VITE_SHARED_FEED_URL=/shared-feed`, both users hit the same public app host and the same shared backend data.

## Telegram scraper (demo data pull)

Use a lightweight scraper to pull public Telegram metadata/posts and map them into `server/shared-feed.json`.

Default run (uses `server/telegram-targets.json`):

```bash
npm run scrape:telegram
```

Custom handles:

```bash
npm run scrape:telegram -- toncoin telegram wallet
```

Useful flags:

```bash
npm run scrape:telegram -- --replace
npm run scrape:telegram -- --targets server/telegram-targets.json --out server/shared-feed.json
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
