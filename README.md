# Pandemic Rapid Response Online

Real-time cooperative board game built with Vite, React, TypeScript, Tailwind CSS, and Firebase Realtime Database. Visual design follows the **Pandemic Rapid Response Design System** (dark mission-console aesthetic).

## Quick Start

```bash
npm install
npm run dev
```

- **Landing:** http://localhost:5173/
- **Play:** http://localhost:5173/play

## Firebase Setup (Online Multiplayer)

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Realtime Database** + **Anonymous Authentication**
3. Deploy rules: `npx -y firebase-tools@latest deploy --only database`
4. Copy `.env.example` → `.env` and fill in values
5. Restart dev server

Without Firebase, the game runs in **local mode** (in-memory rooms).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run test` | Vitest unit tests |
| `npm run analyze` | Bundle size report (`dist/stats.html`) |

## Project Structure

```
src/
├── components/ds/     Design system components (Button, Die, RoomTile, …)
├── components/layout/ Site chrome (nav, footer, SEO, tooltips)
├── styles/tokens/   DS CSS variables (colors, typography, elevation)
├── pages/           Landing, play, game, help pages
├── lib/             Rules, Firebase, analytics
└── hooks/           Game, multiplayer, timer, dice
```

## Deploy (Vercel)

Set `VITE_FIREBASE_*`, optional `VITE_GA_ID`, `VITE_SENTRY_DSN`, `VITE_SITE_URL` in project settings.

## Design System

Tokens vendored from `design-system/` zip into `src/styles/tokens/`. Reference readme at `design-system/readme.md`.

## Docs

- [QA Checklist](docs/QA_CHECKLIST.md)
- [Launch Guide](docs/LAUNCH.md)
- [Pre-Launch Checklist](docs/PRE_LAUNCH_CHECKLIST.md)
