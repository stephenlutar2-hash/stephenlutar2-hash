# Workspace

## Overview

SZL Holdings is a pnpm monorepo consolidating a suite of security, AI, and media platforms into a unified architecture. The project provides a comprehensive ecosystem for security monitoring, AI analytics, enterprise management, and digital storytelling. Its core intelligence, the Alloy Nuro Engine, uses advanced AI for data-driven insights and autonomous monitoring across all platforms. The business vision is to deliver cutting-edge, integrated solutions across various digital domains, enhancing security, operational efficiency, and creative potential for its users.

## User Preferences

- **Username**: slutar
- **Password**: Topshelf14@
- **Design style**: Dark luxury aesthetic — glassmorphism, deep blacks
- **Brand colors**: ROSIE (electric blue/violet), AEGIS (gold/amber), LUTAR (emerald green), BEACON (cyan/electric blue), NIMBUS (cyan/purple), FIRESTORM (orange/red), VESSELS (ocean-blue/emerald)
- **Domain**: szlholdings.com

## System Architecture

The project is structured as a pnpm workspace monorepo, utilizing Node.js 24, pnpm, and TypeScript 5.9. The backend is an Express 5 API server, while frontends are built with React, Vite, Tailwind CSS, and shadcn/ui. PostgreSQL with Drizzle ORM manages data, and Zod is used for validation. API codegen is handled by Orval from an OpenAPI spec.

**Core Architectural Principles:**

*   **Single-Port Consolidation:** A single API server on port 3000 serves all frontend applications as static files and handles all API routes under `/api/`.
*   **Custom Domain Routing:** Middleware detects the `Host` header for domain-based routing, with configuration in `config/domainMap.ts`. This supports standalone domains (e.g., `szlholdings.com`) and product subdomains (e.g., `{app}.szlholdings.com`).
*   **Shared Design System:** Three workspace packages (`@szl-holdings/ui`, `@workspace/branding`, `@szl-holdings/platform`) provide reusable UI components, styling, and core platform functionalities like error handling, authentication, and layout shells.

**Platform Portfolio:**

The monorepo encompasses several distinct applications:

*   **ROSIE**: AI-powered security monitoring.
*   **AEGIS**: Enterprise security management.
*   **LUTAR**: Personal empire command center.
*   **BEACON**: Decision analytics dashboard.
*   **NIMBUS**: Predictive AI analytics.
*   **FIRESTORM**: Security simulation lab.
*   **DREAMERA**: AI storytelling and artifact mapping.
*   **ALLOYSCAPE**: Infrastructure operations for the Alloy AI engine.
*   **DREAMSCAPE**: Premium creative systems platform.
*   **ZEUS**: Modular core architecture system.
*   **VESSELS**: Maritime/logistics fleet intelligence platform with a dedicated PostgreSQL schema.
*   **INCA**: Standalone intelligence/analytics platform with project management and experiment tracking.
*   **CARLOTA JO**: Luxury consulting/family-office website with DB-backed inquiry/engagement management.
*   **LYTE**: Executive observability command center with a dark glass-card design.
*   **SZL Holdings**: Premium founder experience website.
*   **Apps Showcase**, **Readiness Report**, and **Career** for public information.

**Authentication:**

A unified login system supports:

*   **Demo Login:** Predefined credentials (`slutar` / `Topshelf14@`).
*   **Entra External ID (MSAL):** Enterprise Single Sign-On (SSO) with JWKS validation.

**Alloy Nuro Engine:**

This is the central AI intelligence, powered by OpenAI gpt-5.2. It employs a "tool-first" approach with 40+ tools for database CRUD operations, ensuring data grounding and preventing hallucination.

**Domain-Specific AI Agents:**

Four domain-specific AI agents share a common SSE streaming backend engine (`artifacts/api-server/src/routes/domain-agents/`):
*   **INCA — Research Intelligence Agent**: Curated tools for projects, experiments, insights, and models. Uses `optionalAuth` for public/authenticated access.
*   **Vessels — Maritime Operations Agent**: Tools for fleet, vessel, voyage, emissions, and alert queries.
*   **SZL Holdings — Portfolio Concierge**: No tools; pure conversational agent for portfolio/vision inquiries.
*   **Carlota Jo — Strategic Engagement Advisor**: Submit-inquiry tool for consultation booking.

Each agent has a distinct system prompt and persona. Routes: `/api/domain-agents/:agentType/conversations` (CRUD) and `/api/domain-agents/:agentType/conversations/:id/messages` (SSE streaming). Anonymous sessions use HMAC-derived usernames for security. Each frontend app integrates a themed `DomainChatWidget` component (floating button → collapsible chat panel). The `conversations` table has an `agentType` column (default "alloy") to isolate agent conversations.

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

**Import & Data Integration (Import Center):**

A shared import infrastructure in `lib/ui/src/components/import/` provides reusable components: FileDropZone (drag-and-drop), DataPreviewTable (data preview), ColumnMapper (column mapping), ImportProgress (progress feedback), and ImportCenter (5-step wizard shell). File parsing supports CSV, JSON, XML, YAML, ICS, and IPYNB formats via `parse-utils.ts`. API routes at `POST /api/import/:domain/:type` handle domain-specific imports with handlers for inca, vessels, rosie, beacon, nimbus, dreamera, and zeus (with DB persistence), plus a generic fallback for remaining domains. All 16 apps have ImportCenter pages at `/import` routes with domain-specific import types, and navigation links have been added to all app sidebars/headers.

## External Dependencies

*   **PostgreSQL**: Primary database for data persistence.
*   **OpenAI**: Powers the Alloy Nuro Engine (via Replit AI Integrations).
*   **Microsoft Entra External ID (MSAL)**: For enterprise Single Sign-On (SSO).
*   **Stripe**: Payment processing (Beacon, Lutar).
*   **Plaid**: Financial data aggregation (Lutar).
*   **Meta (Facebook/Instagram), Twitter, LinkedIn**: Social media integration for DreamEra.
*   **Azure Application Insights**: For monitoring and telemetry.
*   **Azure Key Vault**: Centralized secrets management.
*   **Azure Managed Redis**: Session storage and caching.
*   **Azure Blob Storage**: File uploads and exports.
