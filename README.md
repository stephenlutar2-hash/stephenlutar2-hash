# SZL Holdings

Enterprise platform portfolio — security monitoring, AI analytics, and operational intelligence.

## Quick Start

```bash
pnpm install
cp .env.example .env          # edit with your credentials
pnpm run dev                  # builds all frontends, starts API server on :3000
```

## Root Scripts

| Script               | Description                                          |
|----------------------|------------------------------------------------------|
| `pnpm run dev`       | Build all frontends then start the API server         |
| `pnpm run build`     | Production build (frontends + API server)             |
| `pnpm run start`     | Start the built API server                            |
| `pnpm run lint`      | Run Prettier check and TypeScript type-checking       |
| `pnpm run typecheck` | TypeScript project-wide type verification             |
| `pnpm run seed`      | Seed the database with sample data                    |

## App Inventory

| App              | Path                 | Description                                            |
|------------------|----------------------|--------------------------------------------------------|
| ROSIE            | `/`                  | AI-powered security monitoring command center          |
| Aegis            | `/aegis/`            | Enterprise defensive security suite                    |
| Beacon           | `/beacon/`           | Telemetry dashboard for KPIs and project metrics       |
| Lutar            | `/lutar/`            | Environmental impact and sustainability tracking       |
| Nimbus           | `/nimbus/`           | Predictive AI analytics with confidence scoring        |
| Firestorm        | `/firestorm/`        | Security simulation lab for defensive strategy testing |
| DreamEra         | `/dreamera/`         | AI storytelling and artifact mapping engine             |
| Zeus             | `/zeus/`             | Modular core architecture backbone                     |
| Apps Showcase    | `/apps-showcase/`    | Public portfolio showcase with project catalog         |
| Readiness Report | `/readiness-report/` | Operational readiness assessment                       |
| Career           | `/career/`           | Personal portfolio and career highlights               |

## Architecture

```
workspace/
├── artifacts/          # All applications (frontends + API server)
│   ├── api-server/     # Express 5 API — serves all frontends + /api/* routes
│   ├── rosie/          # React + Vite frontend
│   ├── aegis/          # React + Vite frontend
│   └── ...             # Other app frontends
├── lib/
│   └── db/             # Drizzle ORM schema + PostgreSQL connection
├── infra/              # Azure Bicep IaC templates
├── .github/workflows/  # CI/CD pipeline
├── .env.example        # Configuration reference
└── package.json        # Root workspace scripts
```

**Single-port design:** One Express server on port 3000 serves every frontend as static files and all API routes under `/api/`.

**Database:** PostgreSQL via Drizzle ORM. Server starts gracefully without `DATABASE_URL` — DB routes return 503 until configured.

**Auth:** Demo login (`slutar`/`Topshelf14@`) or Azure Entra External ID SSO.

**Production:** Azure Container Apps + Front Door + Static Web Apps. See `infra/README.md` for deployment.

## Domain

[szlholdings.com](https://szlholdings.com)
