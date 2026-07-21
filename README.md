# Stashd

Save any link, and let AI organize it for you. Stashd scrapes page metadata, generates an AI summary and tags with Gemini, and lets you track what you still need to read — all in a fast, keyboard-friendly vault.

**Live app:** https://stashd-client-seven.vercel.app
**API:** https://stashd-server.onrender.com/api/healthz

## Features

- **Save links instantly** — paste a URL, Stashd scrapes the title, description, image, and favicon automatically
- **AI enrichment** — one click generates a concise summary and relevant tags using Gemini
- **Semantic search** — search your vault in natural language, not just exact keyword matches
- **Reading status** — track links as `to read`, `reading`, or `done`; stale-link detection flags anything sitting unread for 14+ days
- **Collections** — organize links into folders
- **Light / dark / system theme**
- **Fully responsive** — collapsible mobile drawer navigation

## Tech stack

**Frontend** — React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui (Radix primitives), TanStack Query, Wouter, GSAP

**Backend** — Node.js, Express 5, TypeScript, Drizzle ORM, PostgreSQL (Neon), Google Gemini API, Cheerio

**Tooling** — pnpm workspaces (monorepo), OpenAPI 3.1 contract with Orval-generated Zod schemas and React Query hooks, Pino structured logging

**Deployment** — Vercel (frontend), Render (backend), Neon (database)

## Architecture

Stashd is a pnpm monorepo built around a single OpenAPI contract. The API is defined once in `api-spec/openapi.yaml`, and Orval generates a fully-typed Zod validation layer and React Query client from it — so the frontend and backend can never drift out of sync on request/response shapes.

```text
stashd/
├── apps/
│   ├── client/          # React frontend
│   └── server/          # Express API
├── packages/
│   ├── db/               # Drizzle schema + DB client
│   ├── api-schema/       # Generated Zod schemas
│   └── api-client/       # Generated React Query hooks
└── api-spec/
    └── openapi.yaml       # Single source of truth for the API contract
```

## Getting started

### Prerequisites
- Node.js 22+
- pnpm 10+
- A PostgreSQL database (e.g. [Neon](https://neon.tech))
- A [Gemini API key](https://aistudio.google.com/apikey)

### Setup

```bash
git clone https://github.com/init4saurabh/stashd.git
cd stashd
pnpm install
cp .env.example .env   # fill in DATABASE_URL, GEMINI_API_KEY, PORT, CLIENT_PORT
pnpm run typecheck:libs
pnpm db:push            # creates tables in your database
```

### Run locally

```bash
pnpm dev:server   # starts the API on PORT
pnpm dev:client   # starts the frontend on CLIENT_PORT, proxies /api to the backend
```

## License

MIT