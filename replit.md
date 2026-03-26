# Workspace

## Overview

SZL Holdings is a pnpm monorepo that integrates security, AI, and media platforms. The project's vision is to provide a comprehensive ecosystem for advanced security monitoring, AI-driven analytics, efficient enterprise management, and innovative digital storytelling. The core Alloy Nuro Engine delivers AI-powered insights and autonomous monitoring capabilities, aiming to enhance security, operational efficiency, and creative potential across various digital domains.

## User Preferences

-   **Username**: slutar
-   **Password**: Topshelf14@
-   **Design style**: Dark luxury aesthetic — glassmorphism, deep blacks
-   **Brand colors**: ROSIE (electric blue/violet), AEGIS (gold/amber), LUTAR (emerald green), BEACON (cyan/electric blue), NIMBUS (cyan/purple), FIRESTORM (orange/red), VESSELS (ocean-blue/emerald)
-   **Domain**: szlholdings.com

## System Architecture

The project is built as a pnpm monorepo using Node.js 24, pnpm, and TypeScript 5.9. It features an Express 5 API server, with frontends developed using React, Vite, Tailwind CSS, and shadcn/ui. Data persistence is handled by PostgreSQL and Drizzle ORM, with Zod for robust data validation. API client code generation is automated via Orval from an OpenAPI specification.

**Core Architectural Principles:**

*   **Single-Port Consolidation:** A unified API server on port 3000 delivers all static frontend assets and manages API routes under `/api/`.
*   **Custom Domain Routing:** Middleware routes requests based on the `Host` header, utilizing a `domainMap.ts` configuration for product and standalone subdomains.
*   **Shared Design System:** A consistent user experience is ensured through shared components, styling, and core functionalities provided by `@szl-holdings/ui`, `@workspace/branding`, and `@szl-holdings/platform`.

**Platform Portfolio:**

The monorepo encompasses a diverse range of applications categorized into Security & AI, Logistics & Management, and Corporate & Showcase. Key applications include ROSIE (AI security monitoring), AEGIS (enterprise security), BEACON (decision analytics), NIMBUS (predictive AI), FIRESTORM (security simulation), ALLOYSCAPE (AI infrastructure), DREAMERA (AI storytelling), VESSELS (maritime/logistics intelligence), and LUTAR (personal command center).

*   **Security & AI:** ROSIE, AEGIS, BEACON, NIMBUS, FIRESTORM, ALLOYSCAPE, DREAMERA (+ Social Media Command Center), DREAMSCAPE, LYTE (observability, DB-backed with 5 tables: `lyte_services`, `lyte_slo_targets`, `lyte_cost_items`, `lyte_probes`, `lyte_alerts`), ZEUS, INCA (intelligence/analytics, GET endpoints are public for campaign demo).
*   **Logistics & Management:** VESSELS, LUTAR, CARLOTA JO.
*   **Corporate & Showcase:** SZL Holdings, Apps Showcase, Readiness Report, Career.

**API-Wired Frontends:**

Five frontends dynamically fetch data from the backend API using a state+fallback pattern, ensuring graceful degradation if the API is unavailable:
*   **Career:** Manages professional profiles, skills, certifications, and case studies.
*   **Zeus:** Provides topology services, module dependencies, and self-healing event monitoring.
*   **Readiness Report:** Displays predictive readiness scores, health checks, and risk assessments.
*   **Apps Showcase:** Catalogs 18 applications with real-time health, uptime, and response data.
*   **Aegis:** Offers compliance frameworks, vulnerability tracking, MITRE ATT&CK coverage, threat intelligence, and a comprehensive security posture score.

**Backend-Connected Frontends (AlloyScape, Dreamscape, Lutar):**

AlloyScape, Dreamscape, and Lutar have full Drizzle ORM schemas, API routes, seed data, and react-query hooks connecting frontends to real PostgreSQL data. Schema files: `lib/db/src/schema/alloyscape.ts`, `dreamscape.ts`, `lutar.ts`. API routes: `artifacts/api-server/src/routes/alloyscape.ts`, `dreamscape.ts`, `lutar.ts`. Services: `artifacts/api-server/src/services/alloyscape.ts`, `dreamscape.ts`, `lutar.ts`. Frontend hooks: `useAlloyscapeApi.ts`, `useDreamscapeApi.ts`, `useLutarApi.ts`. All API-connected pages have loading spinners and error states. Framer Motion animations are applied throughout all three apps. WorkflowTemplates and UserRoles in AlloyScape still use demo data (no DB tables for those).

**Authentication and AI System:**

Authentication supports both Demo Login and Enterprise Single Sign-On (SSO) via Microsoft Entra External ID (MSAL) with JWKS validation.

The AI system features a centralized model registry for OpenAI models, supporting hot-swapping. It employs a "tool-first" approach with over 40 tools for database operations to minimize hallucination. Eighteen domain-specific AI agents, each with a distinct persona and system prompt, share a common SSE streaming backend. These agents cover areas such as Research Intelligence (INCA), Maritime Operations (Vessels), Security Intelligence (ROSIE), and Governance & Compliance (Aegis), with each frontend integrating a `DomainChatWidget`.

**Security & Governance:**

The system incorporates robust security features including health endpoints, security headers (CSP, HSTS), Role-Based Access Control (RBAC), API rate limiting, Zod-based schema validation, XSS prevention through HTML escaping, structured audit logging, database-backed feature flags, and Zod-based environment validation. Centralized error handling ensures consistent error responses with request ID propagation. A mock/live provider pattern is used for external services, along with a typed service layer and pagination middleware. Analytics, SSE streaming, search, and bulk operation endpoints are available across platforms. Sensitive information is redacted by the Pino logger. The system supports SEO, accessibility, mobile-first UX, and PWA capabilities.

**Import & Data Integration:**

A shared import infrastructure facilitates file uploads, data preview, and column mapping for various formats (CSV, JSON, XML, YAML, ICS, IPYNB), with domain-specific API routes for imports.

**MCP Registry Integration:**

A centralized Model Context Protocol (MCP) client layer connects to community MCP servers, translating their tools into the OpenAI function-calling format. This includes an MCP Client Library, an MCP-to-OpenAI Bridge, and an MCP Registry Config for 14 MCP servers.

**Extensions & Premium Monetization Layer:**

A shared extension infrastructure provides over 60 API endpoints across all applications, including services like an automation engine, webhook management, notification center, scheduled report generator, and a developer API key portal. Each app features tailored extension functionalities and a reusable `CommandPalette` component for navigation.

## External Dependencies

*   **PostgreSQL**: Primary database.
*   **OpenAI**: AI model integration for the Alloy Nuro Engine.
*   **Microsoft Entra External ID (MSAL)**: Enterprise Single Sign-On (SSO).
*   **Stripe**: Payment processing.
*   **Google Services (Gmail, Calendar, Drive)**: Via Replit connectors.
*   **Plaid**: Financial data aggregation.
*   **Meta (Facebook/Instagram), Twitter, LinkedIn**: Social media integration for DreamEra and cross-app social sharing.
*   **Azure Application Insights**: Monitoring and telemetry.
*   **Azure Key Vault**: Centralized secrets management.
*   **Azure Managed Redis**: Session storage and caching.
*   **Azure Blob Storage**: File uploads and exports.
