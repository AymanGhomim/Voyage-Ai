# Voyage AI ✈️

> A cinematic, AI-powered collaborative travel planning workspace.

## Features

- 🔐 **Authentication** — Sign up / Sign in / Demo account. All trips and AI features are protected behind auth.
- 🗺️ **Trip workspace** — Hero cover, budget tracker, animated map, day-by-day itinerary
- 🤖 **AI Assistant** — Generates a full 5-day itinerary from a natural-language prompt
- 💬 **Crew chat** — Live crew panel with typing indicator and AI replies
- 📱 **Responsive** — Full mobile sidebar via Sheet drawer

## Tech Stack

| Layer | Library |
|---|---|
| Framework | TanStack Start (SSR) |
| Routing | TanStack Router (file-based) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| UI | shadcn/ui |
| State | React useState / Context |
| Auth | localStorage (client-side simulation) |

## Getting Started

```bash
npm install
npm run dev
```

## Auth notes

- Accounts are stored in `localStorage` (client-side simulation).
- A **demo account** is auto-created when you click "Continue with demo account" on the login form.
- Visiting `/app` without being signed in shows a lock screen with a sign-in button.

## Deploy

```bash
npm run build
# Deploy .output/ to Cloudflare Workers / Vercel / any Node host
```
