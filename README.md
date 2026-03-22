# TonDiscover

TonDiscover is a visual discovery Telegram Mini App for finding channels and apps in one feed, then joining or launching them in one tap.

## Problem and User

- User: Telegram users who want to discover useful channels and mini apps quickly.
- Problem: discovery is fragmented and search-first; users miss quality content.
- Solution: a browse-first visual feed mixing channels + apps, with simple boost visibility.

## What Works in the Demo

- Onboarding -> Explore -> Detail -> Join/Launch
- Mixed feed with channel and app cards
- Card content types: text, image, video (with safe fallback for invalid media links)
- Create and edit entities/posts
- Favorites and history
- Boost flow (TON-first with safe mock fallback)

## Quick Local Run

Requirements:

- Node.js 18+ (npm included)

Commands:

```bash
npm install
npm run dev
```

Open:

- `http://localhost:5173`

Build check:

```bash
npm run build
```

## Optional Shared Feed Mode (multi-device demo)

Run shared feed server:

```bash
npm run shared-feed
```

Then run app:

```bash
npm run dev
```

## Main Tech Stack

- React + TypeScript + Vite
- Telegram Mini App SDK
- TON Connect
- Local storage + optional lightweight shared feed server

## How Boost Works on TON

When a user boosts an entity or post:

1. The app requests wallet confirmation through TON Connect.
2. A TON transfer is sent to the boost receiver wallet.
3. If `VITE_CREATOR_REPUTATION_CONTRACT_ADDRESS` is set, the same action also sends a contract message to the Creator Reputation Registry contract in `ton-contracts/reputation`.
4. On successful confirmation, the app stores an active boost state for that target and updates visibility in the feed/manage views.

The smart contract records creator reputation metrics (submissions, boosts, total TON spent), so creator activity can be verifiable on-chain.


## Notes

- Prioritized demo reliability and happy-path completion over heavy backend complexity.
- Boost visibility is intentionally simple and visible in UI.
