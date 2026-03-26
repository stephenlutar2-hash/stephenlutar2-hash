# Workspace

## Overview

SZL Holdings is a pnpm monorepo encompassing a suite of security, AI, and media platforms. The project aims to consolidate various applications into a single, unified architecture, providing a comprehensive ecosystem for security monitoring, AI analytics, enterprise management, and digital storytelling. The core intelligence, the Alloy Nuro Engine, leverages advanced AI to provide data-driven insights and autonomous monitoring across all platforms.

## User Preferences

- **Username**: slutar
- **Password**: Topshelf14@
- **Design style**: Dark luxury aesthetic — glassmorphism, deep blacks
- **Brand colors**: ROSIE (electric blue/violet), AEGIS (gold/amber), LUTAR (emerald green), BEACON (cyan/electric blue), NIMBUS (cyan/purple), FIRESTORM (orange/red), VESSELS (ocean-blue/emerald)
- **Domain**: szlholdings.com

## Shared Design System

The monorepo uses three shared workspace packages under `lib/`:
- **`@workspace/ui`** (`lib/ui`): All shared shadcn/ui components (55+), the `cn()` utility, and hooks (`useIsMobile`, `useToast`, `toast`). Apps import from `@workspace/ui` instead of maintaining local copies.
- **`@workspace/branding`** (`lib/branding`): Shared CSS variable contract (theme-contract.css), base layer styles (base.css), utility classes (utilities.css — glass-panel, text-gradient, glow-shadow, etc.), and TypeScript theme types. See `lib/branding/THEME_REFERENCE.md` for creating new app themes.
- **`@workspace/platform`** (`lib/platform`): Shared `ErrorBoundary`, `AuthGuard`/`AuthProvider`/`useAuth` (with `redirectComponent` prop for router-agnostic redirects), `LayoutShell` (sidebar/topbar variants with breadcrumbs, page transitions via framer-motion), `PageTransition`, loading/empty/error state components, and environment validation helpers.

## System Architecture

The project is built as a pnpm workspace monorepo using Node.js 24, pnpm, and TypeScript 5.9. The backend is an Express 5 API server, while frontends use React, Vite, Tailwind CSS, and shadcn/ui. PostgreSQL with Drizzle ORM handles data persistence, and Zod is used for validation. API codegen is managed by Orval from an OpenAPI spec.

**Single-Port Consolidation:** The entire workspace operates through a single API server on port 3000. This server is responsible for:
- Serving all frontend applications as static files from their `dist/public` directories (e.g., `/` for Rosie, `/aegis/` for Aegis).
- Handling all API routes under the `/api/` prefix.

**Platform Portfolio:** The monorepo includes several distinct applications, each serving a specific purpose:
- **ROSIE**: AI-powered security monitoring.
- **AEGIS**: Enterprise security fortress.
- **LUTAR**: Personal empire command center.
- **BEACON**: Decision analytics dashboard, integrating Zeus, INCA, and DreamEra functionalities.
- **NIMBUS**: Predictive AI analytics.
- **FIRESTORM**: Security simulation lab for defensive strategy testing.
- **DREAMERA**: AI storytelling and artifact mapping.
- **ALLOYSCAPE**: Infrastructure operations platform — management interface for the Alloy AI engine. Provides orchestration monitoring (with visual pipeline view), system module status, workflow templates, execution logs, service health, connector management, and user/role controls. All pages feature Framer Motion animations, skeleton loading states, search/sort/filter controls, status badges, and animated progress bars.
- **DREAMSCAPE**: Premium creative systems platform — immersive gallery, world explorer, hierarchy map, prompt studio, and generation history. All pages feature Framer Motion animations, skeleton loading states, search/filter controls, stats overview panels, status badges, and animated progress indicators.
- **ZEUS**: Modular core architecture system.
- **VESSELS**: Maritime/logistics fleet intelligence platform (ocean-blue/emerald theme).
- **INCA**: Standalone intelligence/analytics platform — project management, experiment tracking, insight cards, model performance monitoring, and executive dashboard. Dark navy/cyan/violet theme with glassmorphism. Consumes existing INCA API endpoints.
- **CARLOTA JO**: Luxury consulting/family-office website — strategic advisory, portfolio optimization, technology transformation, and M&A advisory. Features hero, 6 expandable service areas, founder bio, testimonials, case studies, contact form, and consultation booking flow with session pricing.
- **LYTE**: Executive observability command center — premium dark glass-card design with blue/cyan palette. Features 7 tabs: Command Dashboard (hero health score, KPI strip, attention queue, strategic highlights, risk/drift, ownership map, environment health), Signals (grouped by domain, search/filter), AI Actions (recommendations with execute/escalate), Impact (economic intelligence), Portfolio (sortable grid with readiness rings), Integrations (adapter status), Settings (system health). In-memory demo data (no DB), 6 API endpoints at `/api/lyte/*`.
- **SZL Holdings**: Premium founder experience website — cinematic luxury landing with staggered letter-reveal hero (parallax + canvas particle background), interactive ecosystem constellation visualization (desktop SVG network + mobile card fallback), scroll-triggered animated counter metrics, premium milestone timeline with scroll-driven progress bar, upgraded portfolio cards (tech stack badges, status indicators, category labels), vision pillars, innovation areas, contact inquiry form, and sticky navigation. Dark/gold palette with Framer Motion animations, lazy-loaded sections, prefers-reduced-motion support, full SEO metadata (OG, Twitter, structured data, favicon). Registered as artifact at `/szl-holdings/`.
- **Apps Showcase**, **Readiness Report**, and **Career** for public-facing information.

**Authentication:** A unified login system supports:
- **Demo Login:** Credentials `slutar` / `Topshelf14@` with session token management.
- **Entra External ID (MSAL):** Enterprise SSO when environment variables `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID` are set. Features JWKS validation and MSAL popup flow for frontend authentication.

**Alloy Nuro Engine (Autonomous AI Neural Core):**
- Central AI intelligence across SZL Holdings, using OpenAI gpt-5.2.
- Employs a "tool-first" approach with 40+ tools providing CRUD access to all platform databases, ensuring data grounding and preventing hallucination.
- API routes for conversation management (`/api/alloy/conversations`) and autonomous health sweeps (`/api/alloy/monitor`).
- Uses an agent loop with OpenAI function-calling and streaming, buffering content until tool calls are complete to ensure grounded responses.

**Database Schema:** PostgreSQL database includes tables for:
- `sessions` (auth), `rosie_threats`, `rosie_incidents`, `rosie_scans` (ROSIE).
- `beacon_metrics`, `beacon_projects` (BEACON).
- `nimbus_predictions`, `nimbus_alerts` (NIMBUS).
- `zeus_modules`, `zeus_logs` (ZEUS).
- `inca_projects`, `inca_experiments` (INCA).
- `dreamera_content`, `dreamera_campaigns` (DREAMERA).
- `conversations`, `messages` (Alloy Engine).

**API Routes:** All API routes are prefixed with `/api/` and include endpoints for authentication, platform-specific CRUD operations, Alloy Engine interactions, and monitoring. Write operations on ROSIE are authenticated. Database-backed routes are guarded by `requireDatabase` middleware that returns 503 if `DATABASE_URL` is not configured. Firestorm simulation routes (`/api/firestorm/*`) are protected by `requireAuth` — all scenario, event, detection, and report endpoints require a valid session token. Vessels routes (`/api/vessels/*`) serve in-memory mock fleet/route/asset/alert/intelligence data.

**Production Hardening:**
- Health endpoints: `/health`, `/healthz` (root level), `/api/health`, `/api/healthz` — all return `{ok, project, timestamp}`.
- RBAC: `lib/rbac.ts` with `requireRole()` middleware supporting emperor/admin/operator/client/user hierarchy.
- Feature flags: `lib/featureFlags.ts` reads `FEATURE_*` env vars.
- Audit logging: `lib/audit.ts` structured pino audit middleware on auth/payment/social routes.
- DB graceful fallback: `@workspace/db` warns on missing `DATABASE_URL` instead of crashing; `isDatabaseAvailable()` export + `requireDatabase` middleware.
- Apps Showcase: `/catalog` page with grouped project cards including INCA (deployed).
- SEO: Open Graph meta tags and descriptions on ROSIE, apps-showcase, and career HTML.
- Accessibility: Skip-to-content links on apps-showcase pages.

## External Dependencies

- **PostgreSQL**: Primary database.
- **OpenAI**: Powers the Alloy Nuro Engine (gpt-5.2 via Replit AI Integrations).
- **Microsoft Entra External ID (MSAL)**: For enterprise Single Sign-On (SSO).
- **Stripe**: Payment processing integration (Beacon, Lutar).
- **Plaid**: Financial data aggregation (Lutar).
- **Meta (Facebook/Instagram)**, **Twitter**, **LinkedIn**: Social media integration for content publishing and analytics (DreamEra).
- **Azure Application Insights**: For monitoring and telemetry, if `APPLICATIONINSIGHTS_CONNECTION_STRING` is configured.
- **Azure Key Vault**: Centralized secrets management when `AZURE_KEY_VAULT_URL` is set (falls back to env vars).
- **Azure Managed Redis**: Session storage and caching when `AZURE_REDIS_URL` is set (falls back to in-memory).
- **Azure Blob Storage**: File uploads/exports when `AZURE_STORAGE_CONNECTION_STRING` or `AZURE_STORAGE_ACCOUNT_NAME` is set.

## Azure Infrastructure

Infrastructure-as-code (Bicep) templates in `infra/` define the full Azure production stack:
- Front Door + WAF, Static Web Apps (×11), Container Apps, Key Vault, PostgreSQL Flexible Server, Redis Cache, Blob Storage, Application Insights.
- Dockerfile at repo root builds the entire monorepo into a single container image.
- GitHub Actions CI/CD workflow at `.github/workflows/deploy.yml`.
- See `infra/README.md` for provisioning instructions, parameters, and cost estimates.