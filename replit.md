# Workspace

## Overview

SZL Holdings is a pnpm monorepo that unifies a suite of security, AI, and media platforms. The project aims to provide a comprehensive ecosystem for security monitoring, AI analytics, enterprise management, and digital storytelling. Its core, the Alloy Nuro Engine, leverages advanced AI for data-driven insights and autonomous monitoring across all platforms. The business vision is to deliver cutting-edge, integrated solutions that enhance security, operational efficiency, and creative potential for users across various digital domains.

## User Preferences

-   **Username**: slutar
-   **Password**: Topshelf14@
-   **Design style**: Dark luxury aesthetic — glassmorphism, deep blacks
-   **Brand colors**: ROSIE (electric blue/violet), AEGIS (gold/amber), LUTAR (emerald green), BEACON (cyan/electric blue), NIMBUS (cyan/purple), FIRESTORM (orange/red), VESSELS (ocean-blue/emerald)
-   **Domain**: szlholdings.com

## System Architecture

The project is a pnpm workspace monorepo, built with Node.js 24, pnpm, and TypeScript 5.9. The backend is an Express 5 API server, while frontends use React, Vite, Tailwind CSS, and shadcn/ui. Data is managed by PostgreSQL with Drizzle ORM, and Zod is used for validation. API codegen uses Orval from an OpenAPI spec.

**Core Architectural Principles:**

*   **Single-Port Consolidation:** A single API server on port 3000 serves all frontend applications as static files and handles all API routes under `/api/`.
*   **Custom Domain Routing:** Middleware detects the `Host` header for domain-based routing, configured in `config/domainMap.ts`, supporting standalone and product subdomains.
*   **Shared Design System:** Reusable UI components, styling, and core platform functionalities (error handling, authentication, layout shells) are provided by `@szl-holdings/ui`, `@workspace/branding`, and `@szl-holdings/platform`.

**Platform Portfolio:**

The monorepo includes several distinct applications covering various domains:

*   **Security & AI:** ROSIE (AI security monitoring), AEGIS (enterprise security), BEACON (decision analytics), NIMBUS (predictive AI), FIRESTORM (security simulation), ALLOYSCAPE (AI infrastructure), DREAMERA (AI storytelling + **Social Media Command Center** at `/dreamera/social-command/` with 7 pages, DB-backed), DREAMSCAPE (creative systems), LYTE (observability), ZEUS (core architecture), INCA (intelligence/analytics).
*   **Logistics & Management:** VESSELS (maritime/logistics intelligence), LUTAR (personal command center), CARLOTA JO (consulting/family-office).
*   **Corporate & Showcase:** SZL Holdings (founder experience), Apps Showcase, Readiness Report, Career (public information).

**Premium Design Upgrades (T001–T006):**

Five brand properties have been upgraded to premium tier:
*   **SZL Holdings**: ThoughtLeadership section, Team section, upgraded Footer, live metrics ticker with CSS scroll animation
*   **Carlota Jo**: Client-centric nav (Your Needs/Results/Insights/Contact), trust signals bar, results-at-a-glance case study cards, insights/blog section
*   **Career**: Liquid glass hero (`.liquid-glass` CSS), dark/light mode toggle (`light-mode` class on `documentElement`), glassmorphism `.glass-card` on all cards
*   **Apps Showcase**: Filterable catalog (7 category tabs), instant search, Featured Spotlight section (ROSIE/Nimbus/DreamEra), live status indicators, `AnimatePresence` grid
*   **Lutar Dashboard**: Executive KPI ribbon, Financial Projections LineChart with scenario toggles, Division Performance bar charts, scroll-triggered `whileInView` animations
*   **Shared**: Consistent `.glass-card` utility across all 5 CSS files, `prefers-reduced-motion` support, mobile blur reduction `@media (max-width: 640px)`, smooth scrolling

**Authentication:**

A unified login system supports Demo Login and Microsoft Entra External ID (MSAL) for Enterprise Single Sign-O (SSO) with JWKS validation.

All AI agents use a centralized model registry (`artifacts/api-server/src/lib/model-registry.ts`) that defines which OpenAI model, temperature, max tokens, and top_p each agent uses. Models are resolved at request time (not import time), enabling hot-swap via environment variables (e.g. `AGENT_MODEL_DEFAULT=gpt-4o`, `AGENT_MODEL_ALLOY=gpt-4o`). A bi-weekly freshness monitor logs warnings when models haven't been reviewed in 14+ days. Admin endpoint: `GET /api/agents/status` (requires auth+admin). Public endpoint: `GET /api/agents/freshness`. The registry status is also included in `/readyz` health checks.

The central AI intelligence uses a "tool-first" approach with 40+ tools for database CRUD operations, ensuring data grounding and preventing hallucination. Each of the 18 domain-specific AI agents has a distinct expert persona and system prompt, sharing a common SSE streaming backend engine (`artifacts/api-server/src/routes/domain-agents/`):

*   **INCA — Research Intelligence Agent**: DB-backed tools for projects, experiments, model comparison, accuracy trends, and insights. Requires auth.
*   **Vessels — Maritime Operations Agent**: DB-backed tools for fleet, vessel, voyage, emissions, maintenance, alerts, certificates, and shipments. Requires auth.
*   **ROSIE — Security Intelligence Agent**: DB-backed tools for threats, incidents, and scans.
*   **Aegis — Governance & Compliance Advisor**: DB-backed tools for security posture, audit logs, user roles, feature flags, compliance summaries. Requires auth.
*   **Firestorm — Incident Response Strategist**: DB-backed tools for active incidents, threat landscape, scan results, incident details, attack surface summaries. Requires auth.
*   **Beacon — Performance Analyst**: DB-backed tools for KPI metrics, projects, category filtering, project health, and performance dashboards. Requires auth.
*   **Nimbus — Predictive Intelligence Analyst**: DB-backed tools for predictions, alerts, category filtering, unread alerts, and predictive intelligence briefings. Requires auth.
*   **Lyte — Observability Engineer**: DB-backed tools for system health, recent logs, infrastructure status, alert triage, and platform KPIs. Requires auth.
*   **Zeus — Infrastructure Architect**: DB-backed tools for modules, system logs, module details, architecture overview, and health reports. Requires auth.
*   **DreamEra — Creative Director**: DB-backed tools for content listing, campaigns, content by type, performance reports, and campaign analytics. Requires auth.
*   **Dreamscape — World-Building Companion**: Tools for world regions, character archetypes, story elements, world seeds, and narrative connections. Public access.
*   **Lutar — Command Agent**: Static tools for platform overview and capabilities.
*   **AlloyScape — Operations Commander**: Cross-platform tools for platform overview, security status, infrastructure health, analytics summaries, and operations briefings. Requires auth.
*   **SZL Holdings — Portfolio Concierge**: Tools for app links, listing all 18 platforms, searching the portfolio, and ecosystem stats. Public access.
*   **Carlota Jo — Strategic Engagement Advisor**: Tools for consultation booking, service matching, and portfolio insights. Public access.
*   **Readiness Report — Assessment Agent**: Static tools for platform info.
*   **Career — Portfolio Agent**: Static tools for career milestones.
*   **Apps Showcase — Catalog Guide**: Static tools for platform catalog.

Routes: `/api/domain-agents/:agentType/conversations` (CRUD) and `/api/domain-agents/:agentType/conversations/:id/messages` (SSE streaming). Anonymous sessions use HMAC-derived usernames for security. Each frontend app integrates a themed `DomainChatWidget` component (floating button → collapsible chat panel). The `conversations` table has an `agentType` column (default "alloy") to isolate agent conversations. Tool files: `tools-{agentSlug}.ts` in the domain-agents directory.

**Registered Artifacts (18 apps + API server):**

All 18 frontend apps are registered as Replit artifacts with their own artifact.toml, workflows, and port assignments. The API server builds all frontends and serves them as static files in production. Ports: ROSIE (25013), Aegis (25001), Beacon (25004), Nimbus (25011), Zeus (25014), DreamEra (25006), Dreamscape (25007), Firestorm (25008), Lyte (25010), Lutar (25009), AlloyScape (25002), Apps Showcase (25003), Readiness Report (25012), Career (25005), INCA (24481), Vessels (18485), SZL Holdings (24490), Carlota Jo (19688).

**Security & Governance:**

The system incorporates robust security and governance features:

*   **Health Endpoints:** Comprehensive health checks at various levels.
*   **Security Headers:** Middleware for CSP, HSTS, and other security headers.
*   **RBAC:** Role-Based Access Control using a DB-backed `user_roles` table with `requireRole()` middleware.
*   **Rate Limiting:** Global API rate limiting (200 req/min), auth-specific (20/15min), and write-specific (60/min) per-IP and per-user rate limiting.
*   **Schema Validation:** Zod-based validation and sanitization for all incoming data.
*   **Input Sanitization:** HTML escaping for XSS prevention.
*   **Audit Logging:** Structured audit logs for all mutating operations to both logs and a database table.
*   **Feature Flags:** Database-backed feature flags with API management.
*   **Environment Validation:** Zod-based config schema (`lib/envValidation.ts`) with typed `AppConfig` and `getConfig()` accessor. Fails fast on missing required vars.
*   **Centralized Error Handling:** `lib/errors.ts` (AppError class with static factories), `middleware/errorHandler.ts` (asyncHandler wrapper, global error middleware). Consistent error response shape: `{ status, code, message, requestId?, timestamp, details? }`.
*   **Request ID Propagation:** `lib/requestContext.ts` — AsyncLocalStorage-based request context middleware with `getRequestId()` helper. Request IDs included in all error responses.
*   **Mock/Live Provider Pattern:** `providers/` directory with interfaces and mock/live implementations for Redis cache, Blob storage, Stripe, and Plaid. Controlled via `MOCK_PROVIDERS` env var (comma-separated). Factory at `providers/factory.ts`.
*   **Typed Service Layer:** `services/` directory with service classes for each platform (RosieService, BeaconService, NimbusService, ZeusService, IncaService, DreameraService, AlloyService, StripeService). Routes delegate to services for business logic.
*   **Pagination Middleware:** Reusable `middleware/pagination.ts` provides `parsePagination()`, `paginateArray()`, `sortArray()`, `filterByFields()`, and `searchItems()` utilities for all list endpoints. Supports `?page=1&limit=25&sort=field&order=asc` query params plus field-based filtering and date range filtering.
*   **Analytics Endpoints:** INCA (`/api/inca/analytics/*`), Vessels (`/api/vessels/analytics/*`), and Nimbus (`/api/nimbus/analytics/*`) have dedicated aggregation endpoints for dashboards (experiment success rates, model leaderboard, project health, fleet utilization, emissions trends, voyage efficiency, port dwell, maintenance costs, prediction accuracy, alert frequency, confidence distribution).
*   **SSE Streaming:** Each platform (INCA, Vessels, Nimbus) exposes `/api/{platform}/stream` for real-time dashboard updates on creates, updates, status changes, and bulk operations.
*   **Search Endpoints:** `/api/{platform}/search?q=term` provides full-text matching across key fields (vessel names, project titles, experiment hypotheses, alert titles, etc.).
*   **Bulk Operations:** Bulk status updates and bulk deletes with `requireOperator()` authorization on all three platforms.
*   **Logger Redaction:** Pino logger redacts sensitive information.
*   **DB Graceful Fallback:** Handles missing `DATABASE_URL` gracefully.
*   **SEO & Accessibility:** Open Graph tags, descriptions, and skip-to-content links.
*   **Mobile-First UX:** All 19 apps enhanced with touch-first interactions (44×44px min tap targets via `.touch-target` CSS class), safe area handling for notch devices (`.safe-top`, `.safe-bottom`), and mobile-optimized navigation. Dashboard apps (INCA, Aegis, Firestorm, Vessels, Dreamscape, Zeus, Rosie, Lyte, AlloyScape, Beacon, Nimbus) have bottom navigation bars on mobile. Landing pages (Career, Carlota Jo, Apps Showcase, DreamEra) have hamburger menus. Shared hooks (`useDeviceType`, `useOrientation`, `usePrefersReducedMotion`, `useSafeArea`) in `lib/ui/src/hooks/use-mobile.tsx`. Reduced-motion support in `PageTransition`. Skeleton loading animation via `.skeleton-pulse` CSS class. `PullToRefresh` and `MobileSheet` interaction primitives available from `@szl-holdings/ui`.
*   **PWA Support:** `vite-plugin-pwa` installed with shared `createPwaPlugin()` helper in `lib/platform/src/pwa-config.ts`. All 18 apps have autoUpdate service workers, runtime caching (fonts/API), offline fallback to `index.html`, and web app manifests with app-specific names/theme colors. PWA meta tags in all `index.html` files (`viewport-fit=cover`, `apple-mobile-web-app-capable`).
*   **Premium Extensions & Monetization:** Shared extension infrastructure with 60+ API endpoints, automation engine, webhook management, notification center, scheduled report generator, and developer API key portal. Domain-specific features for Security, Intelligence, Operations, Creative, and Business applications. Integrated Command Palette (Cmd+K) across all 18 apps.

**Import & Data Integration (Import Center):**

A shared import infrastructure provides reusable components for file uploads, data preview, column mapping, and progress feedback through a 5-step wizard. It supports CSV, JSON, XML, YAML, ICS, and IPYNB formats. API routes at `POST /api/import/:domain/:type` handle domain-specific imports with handlers for inca, vessels, rosie, beacon, nimbus, dreamera, and zeus, and a generic fallback.

**MCP Registry Integration:**

A centralized Model Context Protocol (MCP) client layer connects to community MCP servers, bridging their tools into the existing OpenAI function-calling format used by domain agents. It includes an MCP Client Library, an MCP-to-OpenAI Bridge, and an MCP Registry Config mapping 14 MCP servers. Each agent dynamically loads MCP tools based on registry mappings. Registry API Endpoints provide full CRUD for server connections and tool execution, with a Lyte MCP Dashboard for status and mappings.

**Extensions & Premium Monetization Layer:**

A shared extension infrastructure (`artifacts/api-server/src/services/extensions.ts`, `app-extensions.ts`, `routes/extensions.ts`) provides 60+ API endpoints across all 18 apps:

*   **Shared Services**: Automation engine (rules with triggers/actions/conditions), webhook management, notification center, scheduled report generator, developer API key portal.
*   **Per-App Domain Extensions**: Each app has tailored extension features mapped in `app-extensions.ts`:
    *   Security apps (ROSIE, Aegis, Firestorm): Threat hunting rules, compliance policies, red team playbooks, detection signatures.
    *   Intelligence apps (INCA, Nimbus, Beacon): Experiment templates, model pipelines, prediction models, KPI formulas, decision frameworks.
    *   Operations apps (Vessels, Zeus, Lyte): Fleet optimization rules, voyage templates, architecture blueprints, module templates, observability dashboards, SLO definitions.
    *   Creative apps (DreamEra, Dreamscape, AlloyScape): Content templates, campaign workflows, world-building presets, style libraries, infrastructure blueprints, scaling policies.
    *   Business apps (SZL Holdings, Carlota Jo, Lutar, Career, Apps Showcase, Readiness Report): Portfolio strategies, engagement templates, empire expansion playbooks, career milestones, showcase templates, assessment checklists.
*   **Frontend**: Each app has an Extensions page (`/extensions` route) with tabbed UI (Automation, Webhooks, Notifications, Reports, API Keys, domain-specific features) using AnimatePresence transitions.
*   **Command Palette**: Reusable `CommandPalette` component (`lib/ui/src/components/command-palette.tsx`) with Cmd+K shortcut, fuzzy search, and `useAppCommands` hook providing navigation commands. Wired into all 18 apps.
*   **Auth**: All extension endpoints require valid JWT tokens (`requireAuth` middleware). In-memory storage (Maps/arrays) — no DB schema changes.
*   **Routes**: `GET/POST/PUT/DELETE /api/extensions/{domain}/{feature}` mounted via extensionsRouter in `routes/index.ts`.

## External Dependencies

*   **PostgreSQL**: Primary database.
*   **OpenAI**: Powers the Alloy Nuro Engine.
*   **Microsoft Entra External ID (MSAL)**: For enterprise Single Sign-On (SSO).
*   **Stripe**: Payment processing.
*   **Plaid**: Financial data aggregation.
*   **Meta (Facebook/Instagram), Twitter, LinkedIn**: Social media integration for DreamEra.
*   **Azure Application Insights**: Monitoring and telemetry.
*   **Azure Key Vault**: Centralized secrets management.
*   **Azure Managed Redis**: Session storage and caching.
*   **Azure Blob Storage**: File uploads and exports.

## GitHub Repository

The codebase is pushed to **https://github.com/stephenlutar2-hash/szl-holdings** (public, `main` branch). The `origin` remote is configured.

**Manual follow-ups required:**
1. `.github/workflows/` files need to be pushed using a token with `workflow` scope (the Replit GitHub OAuth token only has `repo` scope).
2. Set the social preview image in GitHub Settings using `.github/hero-banner.png` (no API endpoint exists for this).
