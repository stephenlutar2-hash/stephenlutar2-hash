# Workspace

## Overview

SZL Holdings is a pnpm monorepo that unifies security, AI, and media platforms into a single architecture. The project aims to provide a comprehensive ecosystem for security monitoring, AI analytics, enterprise management, and digital storytelling. Its core intelligence, the Alloy Nuro Engine, uses advanced AI for data-driven insights and autonomous monitoring across all platforms. The business vision is to deliver cutting-edge, integrated solutions across various digital domains, enhancing security, operational efficiency, and creative potential for its users.

## User Preferences

- **Username**: slutar
- **Password**: Topshelf14@
- **Design style**: Dark luxury aesthetic — glassmorphism, deep blacks
- **Brand colors**: ROSIE (electric blue/violet), AEGIS (gold/amber), LUTAR (emerald green), BEACON (cyan/electric blue), NIMBUS (cyan/purple), FIRESTORM (orange/red), VESSELS (ocean-blue/emerald)
- **Domain**: szlholdings.com

## System Architecture

The project is a pnpm workspace monorepo, built with Node.js 24, pnpm, and TypeScript 5.9. The backend is an Express 5 API server, while frontends use React, Vite, Tailwind CSS, and shadcn/ui. Data is managed by PostgreSQL with Drizzle ORM, and Zod is used for validation. API codegen uses Orval from an OpenAPI spec.

**Core Architectural Principles:**

*   **Single-Port Consolidation:** A single API server on port 3000 serves all frontend applications as static files and handles all API routes under `/api/`.
*   **Custom Domain Routing:** Middleware detects the `Host` header for domain-based routing, configured in `config/domainMap.ts`, supporting standalone and product subdomains.
*   **Shared Design System:** Reusable UI components, styling, and core platform functionalities (error handling, authentication, layout shells) are provided by `@szl-holdings/ui`, `@workspace/branding`, and `@szl-holdings/platform`.

**Platform Portfolio:**

The monorepo includes several applications: ROSIE, AEGIS, LUTAR, BEACON, NIMBUS, FIRESTORM, DREAMERA, ALLOYSCAPE, DREAMSCAPE, ZEUS, VESSELS, INCA, CARLOTA JO, LYTE, SZL Holdings, Apps Showcase, Readiness Report, and Career.

**Authentication:**

A unified login system supports Demo Login and Microsoft Entra External ID (MSAL) for Enterprise Single Sign-On (SSO) with JWKS validation.

**Alloy Nuro Engine & Model Registry:**

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

The system includes:
*   Health Endpoints
*   Security Headers (CSP, HSTS)
*   Role-Based Access Control (RBAC)
*   Rate Limiting (global, auth-specific, write-specific)
*   Zod-based Schema Validation and Input Sanitization
*   Structured Audit Logging for mutating operations
*   Database-backed Feature Flags
*   Zod-based Environment Validation
*   Centralized Error Handling with consistent response shapes
*   Request ID Propagation
*   Mock/Live Provider Pattern for external services
*   Typed Service Layer for business logic
*   Pagination Middleware for list endpoints
*   Dedicated Analytics Endpoints for INCA, Vessels, and Nimbus
*   SSE Streaming for real-time dashboard updates
*   Search Endpoints (`/api/{platform}/search`)
*   Bulk Operations with authorization
*   Pino logger Redaction for sensitive information
*   DB Graceful Fallback
*   SEO & Accessibility features.

**Import & Data Integration (Import Center):**

A shared import infrastructure provides reusable components for file uploads, data preview, column mapping, and progress feedback. It supports CSV, JSON, XML, YAML, ICS, and IPYNB formats. API routes at `POST /api/import/:domain/:type` handle domain-specific imports with handlers for inca, vessels, rosie, beacon, nimbus, dreamera, and zeus, and a generic fallback.

**MCP Registry Integration:**

A centralized Model Context Protocol (MCP) client layer connects to community MCP servers, bridging their tools into the existing OpenAI function-calling format used by domain agents. It includes an MCP Client Library, an MCP-to-OpenAI Bridge, and an MCP Registry Config mapping 14 MCP servers. Each agent dynamically loads MCP tools based on registry mappings. Registry API Endpoints provide full CRUD for server connections and tool execution, with a Lyte MCP Dashboard for status and mappings.

## External Dependencies

*   **PostgreSQL**: Primary database.
*   **OpenAI**: Powers the Alloy Nuro Engine.
*   **Microsoft Entra External ID (MSAL)**: For enterprise Single Sign-On (SSO).
*   **Stripe**: Payment processing.
*   **Plaid**: Financial data aggregation.
*   **Meta (Facebook/Instagram), Twitter, LinkedIn**: Social media integration for DreamEra.
*   **Azure Application Insights**: For monitoring and telemetry.
*   **Azure Key Vault**: Centralized secrets management.
*   **Azure Managed Redis**: Session storage and caching.
*   **Azure Blob Storage**: File uploads and exports.