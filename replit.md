# Workspace

## Overview

SZL Holdings is a pnpm monorepo encompassing a suite of security, AI, and media platforms. The project aims to consolidate various applications into a single, unified architecture, providing a comprehensive ecosystem for security monitoring, AI analytics, enterprise management, and digital storytelling. The core intelligence, the Alloy Nuro Engine, leverages advanced AI to provide data-driven insights and autonomous monitoring across all platforms.

## User Preferences

- **Username**: slutar
- **Password**: Topshelf14@
- **Design style**: Dark luxury aesthetic — glassmorphism, deep blacks
- **Brand colors**: ROSIE (electric blue/violet), AEGIS (gold/amber), LUTAR (emerald green), BEACON (cyan/electric blue), NIMBUS (cyan/purple), FIRESTORM (orange/red)
- **Domain**: szlholdings.com

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
- **FIRESTORM**: White-hat offensive security operations.
- **DREAMERA**: AI storytelling and artifact mapping.
- **ZEUS**: Modular core architecture system.
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

**API Routes:** All API routes are prefixed with `/api/` and include endpoints for authentication, platform-specific CRUD operations, Alloy Engine interactions, and monitoring. Write operations on ROSIE are authenticated.

## External Dependencies

- **PostgreSQL**: Primary database.
- **OpenAI**: Powers the Alloy Nuro Engine (gpt-5.2 via Replit AI Integrations).
- **Microsoft Entra External ID (MSAL)**: For enterprise Single Sign-On (SSO).
- **Stripe**: Payment processing integration (Beacon, Lutar).
- **Plaid**: Financial data aggregation (Lutar).
- **Meta (Facebook/Instagram)**, **Twitter**, **LinkedIn**: Social media integration for content publishing and analytics (DreamEra).
- **Azure Application Insights**: For monitoring and telemetry, if `APPLICATIONINSIGHTS_CONNECTION_STRING` is configured.