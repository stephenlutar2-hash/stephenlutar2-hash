# Workspace

## Overview

SZL Holdings is a pnpm monorepo unifying security, AI, and media platforms. The project aims to deliver a comprehensive ecosystem for security monitoring, AI analytics, enterprise management, and digital storytelling. At its core, the Alloy Nuro Engine provides AI-driven insights and autonomous monitoring. The business vision is to offer cutting-edge, integrated solutions that enhance security, operational efficiency, and creative potential across various digital domains.

## User Preferences

-   **Username**: slutar
-   **Password**: Topshelf14@
-   **Design style**: Dark luxury aesthetic — glassmorphism, deep blacks
-   **Brand colors**: ROSIE (electric blue/violet), AEGIS (gold/amber), LUTAR (emerald green), BEACON (cyan/electric blue), NIMBUS (cyan/purple), FIRESTORM (orange/red), VESSELS (ocean-blue/emerald)
-   **Domain**: szlholdings.com

## System Architecture

The project is a pnpm monorepo using Node.js 24, pnpm, and TypeScript 5.9. The backend is an Express 5 API server, while frontends use React, Vite, Tailwind CSS, and shadcn/ui. Data is managed with PostgreSQL and Drizzle ORM, with Zod for validation. API code generation uses Orval from an OpenAPI spec.

**Core Architectural Principles:**

*   **Single-Port Consolidation:** A single API server on port 3000 serves all frontend applications as static files and handles all API routes under `/api/`.
*   **Custom Domain Routing:** Middleware detects the `Host` header for domain-based routing, configured in `config/domainMap.ts`, supporting standalone and product subdomains.
*   **Shared Design System:** Reusable UI components, styling, and core platform functionalities are provided by `@szl-holdings/ui`, `@workspace/branding`, and `@szl-holdings/platform`.

**Platform Portfolio:**

The monorepo includes a suite of applications for Security & AI, Logistics & Management, and Corporate & Showcase purposes. Key applications include ROSIE (AI security monitoring), AEGIS (enterprise security), BEACON (decision analytics), NIMBUS (predictive AI), FIRESTORM (security simulation), ALLOYSCAPE (AI infrastructure), DREAMERA (AI storytelling), VESSELS (maritime/logistics intelligence), and LUTAR (personal command center).

**API-Wired Frontends:**

Four frontends fetch data from backend API routes using a state+fallback pattern (hardcoded defaults as initial state, API fetch on mount, update on success, graceful fallback if API unavailable):
*   **Career** (`/api/career/*`): Profile, skills, certifications, timeline, case studies. Routes: `/career/all`, `/career/profile`, `/career/skills`, `/career/certifications`, `/career/timeline`, `/career/case-studies`.
*   **Zeus** (`/api/zeus/*`): Topology services, module dependencies, self-healing events. Routes: `/zeus/topology`, `/zeus/dependencies`, `/zeus/self-healing-events`. Dashboard, ArchitectureMap, ModuleDependencyGraph all wired.
*   **Readiness Report** (`/api/readiness/*`): Predictive readiness scores, dimension averages, risk predictions. Routes: `/readiness/predictive`, `/readiness/health-checks`.
*   **Apps Showcase** (`/api/apps-showcase/*`): 18-app catalog with health status, uptime, response times. Route: `/apps-showcase/catalog`.

**Authentication and AI System:**

A unified login supports Demo Login and Microsoft Entra External ID (MSAL) for Enterprise Single Sign-On (SSO) with JWKS validation.

All AI agents utilize a centralized model registry that defines OpenAI model parameters and supports hot-swapping via environment variables. The system uses a "tool-first" approach with 40+ tools for database operations, preventing hallucination. Eighteen domain-specific AI agents each have distinct expert personas and system prompts, sharing a common SSE streaming backend engine. These agents cover areas like Research Intelligence (INCA), Maritime Operations (Vessels), Security Intelligence (ROSIE), and Governance & Compliance (Aegis). Each frontend integrates a themed `DomainChatWidget`.

**Security & Governance:**

The system incorporates health endpoints, security headers (CSP, HSTS), Role-Based Access Control (RBAC), API rate limiting, Zod-based schema validation, HTML escaping for XSS prevention, structured audit logging, database-backed feature flags, and Zod-based environment validation. Centralized error handling provides consistent error responses. Request IDs are propagated via `AsyncLocalStorage`. The system uses a mock/live provider pattern for external services, a typed service layer, and pagination middleware for list endpoints. Dedicated analytics, SSE streaming, search, and bulk operation endpoints are available for various platforms. Pino logger redacts sensitive information. The system supports SEO, accessibility features, and mobile-first UX with PWA capabilities.

**Import & Data Integration:**

A shared import infrastructure provides reusable components for file uploads, data preview, and column mapping, supporting CSV, JSON, XML, YAML, ICS, and IPYNB formats. API routes handle domain-specific imports.

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
*   **SEO & Accessibility:** Full OG + Twitter Card meta tags on all 18 apps (og:title, og:description, og:image, og:type, twitter:card, twitter:title, twitter:description), font preloading via `rel="preload"`, skip-to-content links.
*   **Analytics:** Self-hosted pageview tracking via `navigator.sendBeacon` in every index.html, POST `/api/analytics/pageview` logging endpoint.
*   **Newsletter:** Email capture on SZL Holdings Contact section and Apps Showcase CTA. POST `/api/newsletter/subscribe` with `newsletter_subscribers` DB table (Drizzle schema at `lib/db/src/schema/newsletter.ts`).
*   **Demo Mode:** "Explore Demo" button on 8 gated app login pages (Rosie, Aegis, Firestorm, Lutar, Vessels, Beacon, Nimbus, AlloyScape). Sets `szl_demo_mode=true` in localStorage to bypass auth. Brand-colored `DemoBanner` fixed banner with "Sign up for full access" link in each App.tsx.
*   **Press Kit:** `/press` route on SZL Holdings with company overview, founder bio, brand color palette, key metrics, boilerplate copy, and asset download links (`PressKit.tsx`).
*   **Mobile-First UX:** All 19 apps enhanced with touch-first interactions (44×44px min tap targets via `.touch-target` CSS class), safe area handling for notch devices (`.safe-top`, `.safe-bottom`), and mobile-optimized navigation. Dashboard apps (INCA, Aegis, Firestorm, Vessels, Dreamscape, Zeus, Rosie, Lyte, AlloyScape, Beacon, Nimbus) have bottom navigation bars on mobile. Landing pages (Career, Carlota Jo, Apps Showcase, DreamEra) have hamburger menus. Shared hooks (`useDeviceType`, `useOrientation`, `usePrefersReducedMotion`, `useSafeArea`) in `lib/ui/src/hooks/use-mobile.tsx`. Reduced-motion support in `PageTransition`. Skeleton loading animation via `.skeleton-pulse` CSS class. `PullToRefresh` and `MobileSheet` interaction primitives available from `@szl-holdings/ui`.
*   **PWA Support:** `vite-plugin-pwa` installed with shared `createPwaPlugin()` helper in `lib/platform/src/pwa-config.ts`. All 18 apps have autoUpdate service workers, runtime caching (fonts/API), offline fallback to `index.html`, and web app manifests with app-specific names/theme colors. PWA meta tags in all `index.html` files (`viewport-fit=cover`, `apple-mobile-web-app-capable`).
*   **Premium Extensions & Monetization:** Shared extension infrastructure with 60+ API endpoints, automation engine, webhook management, notification center, scheduled report generator, and developer API key portal. Domain-specific features for Security, Intelligence, Operations, Creative, and Business applications. Integrated Command Palette (Cmd+K) across all 18 apps.
*   **Performance Hardening:** Express `compression` middleware (Brotli/Gzip, Stripe webhook excluded), static asset caching headers (1-year immutable for hashed assets, 1-day for non-hashed static assets, 1-hour for index.html), pre-compressed `.br`/`.gz` file serving, request timeout middleware (30s API, 10s health), HTTP keep-alive/headers timeout configuration, 1MB JSON body limit, graceful shutdown handling, branded static error page fallback. Vite builds produce pre-compressed files via `vite-plugin-compression2`. Manual chunk splitting separates `vendor-react` and `vendor-motion`. Azure Container Apps scaled to 1 CPU / 2Gi RAM per instance, max 10 replicas, concurrency trigger at 25. Front Door static asset caching rules. Load test script at `scripts/load-test.mjs`.

**MCP Registry Integration:**

A centralized Model Context Protocol (MCP) client layer connects to community MCP servers, bridging their tools into the OpenAI function-calling format. It includes an MCP Client Library, an MCP-to-OpenAI Bridge, and an MCP Registry Config mapping 14 MCP servers.

**Extensions & Premium Monetization Layer:**

A shared extension infrastructure provides 60+ API endpoints across all applications, including shared services like an automation engine, webhook management, notification center, scheduled report generator, and developer API key portal. Each app has tailored extension features. A reusable `CommandPalette` component provides a Cmd+K shortcut for navigation.

## External Dependencies

*   **PostgreSQL**: Primary database.
*   **OpenAI**: Powers the Alloy Nuro Engine.
*   **Microsoft Entra External ID (MSAL)**: For enterprise Single Sign-On (SSO).
*   **Stripe**: Payment processing.
*   **Google Services (Gmail, Calendar, Drive)**: Via Replit connectors.
*   **Plaid**: Financial data aggregation.
*   **Meta (Facebook/Instagram), Twitter, LinkedIn**: Social media integration for DreamEra.
*   **Azure Application Insights**: Monitoring and telemetry.
*   **Azure Key Vault**: Centralized secrets management.
*   **Azure Managed Redis**: Session storage and caching.
*   **Azure Blob Storage**: File uploads and exports.