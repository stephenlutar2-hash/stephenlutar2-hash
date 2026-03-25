# Workspace

## Overview

pnpm workspace monorepo for **SZL Holdings** — a portfolio of security, AI, and media platforms. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (all platform APIs)
│   ├── rosie/              # ROSIE Security - AI monitoring platform (/)
│   ├── aegis/              # AEGIS - Enterprise security fortress (/aegis/)
│   ├── lutar/              # LUTAR - Personal empire command center (/lutar/)
│   ├── beacon/             # BEACON - Decision dashboard + Zeus/INCA/DreamEra (/beacon/)
│   ├── nimbus/             # NIMBUS - Predictive AI platform (/nimbus/)
│   ├── firestorm/          # FIRESTORM - White-hat offensive security (/firestorm/)
│   ├── dreamera/           # DREAMERA - AI storytelling platform (/dreamera/)
│   ├── zeus/               # ZEUS - Modular core architecture (/zeus/)
│   ├── apps-showcase/      # Apps Showcase - Platform portfolio (/apps-showcase/)
│   ├── readiness-report/   # Project Readiness Report (/readiness-report/)
│   └── career/             # Career Portfolio - Personal website (/career/)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Platform Portfolio

| Platform | Route | Description | Backend |
|----------|-------|-------------|---------|
| ROSIE | `/` | AI-powered security monitoring platform | Full CRUD: threats, incidents, scans |
| AEGIS | `/aegis/` | Enterprise security fortress, zero-trust architecture | Landing page (frontend-only) |
| LUTAR | `/lutar/` | Personal empire management command center | Landing + dashboard (frontend-only) |
| BEACON | `/beacon/` | Decision analytics dashboard (multi-page) | Full CRUD: metrics, projects |
| NIMBUS | `/nimbus/` | Predictive AI analytics + alerts | Full CRUD: predictions, alerts |
| FIRESTORM | `/firestorm/` | White-hat offensive security operations | Landing page (frontend-only) |
| DREAMERA | `/dreamera/` | AI storytelling & artifact mapping platform | Landing + dashboard (frontend-only, React state) |
| ZEUS | `/zeus/` | Modular core architecture system | Landing + dashboard (frontend-only, React state) |
| Apps Showcase | `/apps-showcase/` | Platform portfolio with pricing tiers | Public site (no auth) |
| Readiness Report | `/readiness-report/` | Portfolio readiness dashboard | Public site (no auth, static data) |
| Career | `/career/` | Luxury personal portfolio for Sean Lutar | Public site (no auth, contact form) |
| ZEUS (in Beacon) | `/beacon/zeus` | Modular core infrastructure (inside Beacon) | Full CRUD: modules, logs |
| INCA AI | `/beacon/inca` | AI innovation engine (inside Beacon) | Full CRUD: projects, experiments |
| DREAM ERA (in Beacon) | `/beacon/dreamera` | Media & lifestyle platform (inside Beacon) | Full CRUD: content, campaigns |

## Authentication

All platforms share a unified login system. Credentials: `slutar` / `Topshelf14@`.
- Login: `POST /api/auth/login` — returns session token (24h expiry)
- Auth check: `GET /api/auth/me` — validate token via Bearer header
- Logout: `POST /api/auth/logout`
- Write routes (POST/PUT/DELETE) on ROSIE are protected with `requireAuth` middleware
- Frontend login pages at `/login` on each platform with auth guards on protected routes

## Database Schema (PostgreSQL)

- `sessions` - Auth session tokens with expiration
- `rosie_threats` - Security threat events with severity/status
- `rosie_incidents` - Security incidents with assignees
- `rosie_scans` - Platform security scan results
- `beacon_metrics` - KPI metrics for Beacon dashboard
- `beacon_projects` - Project tracking for all SZL platforms
- `nimbus_predictions` - AI predictions with confidence scores
- `nimbus_alerts` - System alerts with severity levels
- `zeus_modules` - Infrastructure module tracking with uptime
- `zeus_logs` - System logs with levels (info/warn/error/debug)
- `inca_projects` - AI research projects with accuracy tracking
- `inca_experiments` - AI experiments linked to projects
- `dreamera_content` - Media content (articles/videos/podcasts/social)
- `dreamera_campaigns` - Marketing campaigns with budget/reach
- `conversations` - Alloy Engine chat conversations
- `messages` - Alloy Engine conversation messages (cascade delete with conversations)

## API Routes

All routes served at `/api/` prefix:
- `POST /api/auth/login` - Login (returns session token)
- `GET /api/auth/me` - Validate token
- `POST /api/auth/logout` - Logout
- `GET /api/rosie/threats` - Security threats (public read)
- `POST /api/rosie/threats` - Create threat (auth required)
- `DELETE /api/rosie/threats/:id` - Delete threat (auth required)
- `GET /api/rosie/incidents` - Security incidents (public read)
- `POST/PUT/DELETE /api/rosie/incidents/:id` - Incident CRUD (auth required)
- `GET /api/rosie/scans` - Scan results (public read)
- `POST /api/rosie/scans` - Create scan (auth required)
- `GET/POST /api/beacon/metrics` - Beacon KPI metrics CRUD
- `PUT/DELETE /api/beacon/metrics/:id`
- `GET/POST /api/beacon/projects` - Project tracking CRUD
- `PUT/DELETE /api/beacon/projects/:id`
- `GET/POST /api/nimbus/predictions` - AI predictions CRUD
- `DELETE /api/nimbus/predictions/:id`
- `GET/POST /api/nimbus/alerts` - System alerts CRUD
- `DELETE /api/nimbus/alerts/:id`
- `GET/POST /api/zeus/modules` - Infrastructure modules CRUD
- `PUT/DELETE /api/zeus/modules/:id`
- `GET/POST /api/zeus/logs` - System logs
- `GET/POST /api/inca/projects` - AI research projects CRUD
- `PUT/DELETE /api/inca/projects/:id`
- `GET/POST /api/inca/experiments` - AI experiments
- `GET/POST /api/dreamera/content` - Media content CRUD
- `PUT/DELETE /api/dreamera/content/:id`
- `GET/POST /api/dreamera/campaigns` - Campaign management
- `DELETE /api/dreamera/campaigns/:id`

## Alloy Nuro Engine (Autonomous AI Neural Core)

The Alloy Nuro Engine is the central intelligence powering all of SZL Holdings (AlloyScape). It uses OpenAI gpt-5.2 (via Replit AI Integrations) with strict tool-first enforcement to ensure all responses are grounded in real database data — never fabricated.

### API Routes (all require auth)
- `POST /api/alloy/conversations` — Create a new conversation
- `GET /api/alloy/conversations` — List all conversations
- `GET /api/alloy/conversations/:id` — Get conversation with message history
- `DELETE /api/alloy/conversations/:id` — Delete a conversation
- `POST /api/alloy/conversations/:id/messages` — Send message, stream AI response (SSE)
- `POST /api/alloy/monitor` — Trigger autonomous health sweep with AI analysis

### Architecture
- **Tool Registry** (`routes/alloy/tools.ts`): 40+ tools giving AI agent access to all platform databases (CRUD operations for Rosie, Beacon, Nimbus, Zeus, INCA, DreamEra)
- **Agent Loop** (`routes/alloy/agent.ts`): OpenAI function-calling loop with streaming. Uses `tool_choice: "required"` on first round to force database queries before any response. Content is buffered during tool-call rounds to prevent premature streaming of ungrounded text.
- **Monitor** (`routes/alloy/monitor.ts`): Autonomous health sweep across all platforms with AI-generated recommendations
- **Model**: gpt-5.2 with function calling and streaming
- **Anti-hallucination**: System prompt with strict rules against data fabrication. Tool-first enforcement ensures all numbers, counts, statuses come from actual database queries.
- **DB**: Conversations and messages tables with cascade delete

### Dependencies
- `@workspace/integrations-openai-ai-server` — OpenAI SDK client (lib/integrations-openai-ai-server)
- Env vars: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` (auto-provisioned)

## User Preferences

- **Username**: slutar
- **Password**: Topshelf14@
- **Design style**: Dark luxury aesthetic — glassmorphism, deep blacks
- **Brand colors**: ROSIE (electric blue/violet), AEGIS (gold/amber), LUTAR (emerald green), BEACON (cyan/electric blue), NIMBUS (cyan/purple), FIRESTORM (orange/red)
- **Domain**: szlholdings.com (not yet wired)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Architecture — Single-Port Consolidation

The entire workspace runs through a single API server process on one port (3000). In both development and production:
- The API server (`artifacts/api-server`) serves all frontend apps as static files from their `dist/public` directories
- `GET /` serves Rosie, `GET /aegis/` serves Aegis, etc.
- `GET /api/*` handles API routes, `GET /health` returns health check
- Frontend artifact.toml files have been removed; only the API server artifact remains
- In development, frontends are pre-built before the API server starts (`pnpm -w run build:frontends`)

## Root Scripts

- `pnpm run dev` — builds all frontends, then starts the API server
- `pnpm run build` — builds frontends + API server for production
- `pnpm run build:frontends` — builds all 6 frontend apps
- `pnpm run start` — starts the API server (assumes already built)
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Seed Script

Run `scripts/node_modules/.bin/tsx artifacts/api-server/src/seed.ts` to populate all platform data.

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes: `src/routes/` — auth.ts, rosie.ts, beacon.ts, nimbus.ts, zeus.ts, inca.ts, dreamera.ts, health.ts, alloy/ (agent, tools, monitor).

### `lib/db` (`@workspace/db`)

Database layer. Schema files: `src/schema/auth.ts`, `rosie.ts`, `beacon.ts`, `nimbus.ts`, `zeus.ts`, `inca.ts`, `dreamera.ts`, `conversations.ts`, `messages.ts`.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec with all platform endpoints. Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` / `lib/api-client-react`

Generated Zod schemas and React Query hooks from OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts. Run via `pnpm --filter @workspace/scripts run <script>`.
