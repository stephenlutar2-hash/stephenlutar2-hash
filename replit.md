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