# SZL Holdings — Azure Infrastructure

This directory contains Bicep templates to provision the full Azure production stack for SZL Holdings.

## Architecture

```
                         ┌─────────────────┐
     szlholdings.com ──► │  Azure Front Door │
                         │  + WAF Policy    │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌───────▼────────┐         ┌────────▼───────┐
            │ Static Web Apps │         │ Container Apps  │
            │ (11 frontends) │         │  (API server)   │
            └────────────────┘         └───────┬─────────┘
                                               │
                         ┌─────────────────────┼─────────────────────┐
                         │                     │                     │
                  ┌──────▼──────┐     ┌────────▼──────┐    ┌────────▼──────┐
                  │  Key Vault  │     │  PostgreSQL    │    │  Redis Cache  │
                  │  (secrets)  │     │ Flexible Server│    │  (sessions)   │
                  └─────────────┘     └───────────────┘    └───────────────┘
                         │
                  ┌──────▼──────┐     ┌───────────────┐
                  │Blob Storage │     │ App Insights   │
                  │ (assets)    │     │ + Log Analytics│
                  └─────────────┘     └───────────────┘
```

## Prerequisites

- Azure CLI (`az`) installed and logged in: `az login`
- An Azure subscription
- A resource group created: `az group create -n szlholdings-rg -l eastus2`
- An Azure Container Registry: `az acr create -n szlholdingsacr -g szlholdings-rg --sku Basic`

## Quick Start

### 1. Deploy Infrastructure

```bash
az deployment group create \
  --resource-group szlholdings-rg \
  --template-file infra/main.bicep \
  --parameters infra/parameters.json \
  --parameters pgAdminLogin=<YOUR_PG_LOGIN> pgAdminPassword=<YOUR_PG_PASSWORD>
```

### 2. Build and Push Container Image

```bash
# Build the container image
docker build -t szlholdingsacr.azurecr.io/szlholdings-api:latest .

# Log in to ACR
az acr login --name szlholdingsacr

# Push
docker push szlholdingsacr.azurecr.io/szlholdings-api:latest
```

### 3. Update Container App

```bash
az containerapp update \
  --name szlholdings-api \
  --resource-group szlholdings-rg \
  --image szlholdingsacr.azurecr.io/szlholdings-api:latest
```

### 4. Run Database Migrations

```bash
# Get the PostgreSQL connection string from deployment outputs
DATABASE_URL="postgresql://<login>:<password>@<server>.postgres.database.azure.com:5432/szlholdings?sslmode=require"

# Run migrations
DATABASE_URL=$DATABASE_URL pnpm --filter @workspace/db run db:push
```

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `baseName` | Prefix for all resources | `szlholdings` |
| `location` | Azure region | Resource group location |
| `pgAdminLogin` | PostgreSQL admin username | (required) |
| `pgAdminPassword` | PostgreSQL admin password | (required) |
| `customDomain` | Custom domain for Front Door | `szlholdings.com` |
| `apiImageTag` | Container image tag | `latest` |
| `acrLoginServer` | ACR login server | `szlholdingsacr.azurecr.io` |
| `redisSku` | Redis Cache SKU | `Basic` |
| `pgSkuTier` | PostgreSQL SKU tier | `Burstable` |
| `pgSkuName` | PostgreSQL compute size | `Standard_B1ms` |
| `pgStorageSizeGB` | PostgreSQL storage | `32` |

## Resources Provisioned

| Resource | Purpose |
|----------|---------|
| **Front Door + WAF** | CDN, SSL termination, DDoS/bot protection, rate limiting |
| **Static Web Apps** (×11) | Host each frontend SPA (Rosie, Aegis, Beacon, etc.) |
| **Container Apps** | Host the Express API server with auto-scaling |
| **Key Vault** | Centralized secrets (API keys, DB credentials, tokens) |
| **PostgreSQL Flexible Server** | Primary database |
| **Redis Cache** | Session storage and API response caching |
| **Blob Storage** | File uploads, exports, assets, logs |
| **Application Insights** | Telemetry, tracing, error tracking |
| **Log Analytics** | Centralized log aggregation |

## Custom Domain Setup

1. Add a CNAME record for your domain pointing to the Front Door endpoint
2. Validate domain ownership in the Azure Portal under Front Door > Domains
3. Associate the custom domain with the Front Door endpoint route

```bash
# Example: Add custom domain
az afd custom-domain create \
  --resource-group szlholdings-rg \
  --profile-name szlholdings-fd \
  --custom-domain-name szlholdings-com \
  --host-name szlholdings.com
```

## Store Secrets in Key Vault

After provisioning, populate Key Vault with application secrets:

```bash
KV_NAME=$(az deployment group show -g szlholdings-rg -n main --query properties.outputs.keyVaultUrl.value -o tsv | sed 's|https://||;s|\.vault.*||')

az keyvault secret set --vault-name $KV_NAME --name "stripe-secret-key" --value "<YOUR_KEY>"
az keyvault secret set --vault-name $KV_NAME --name "plaid-client-id" --value "<YOUR_KEY>"
az keyvault secret set --vault-name $KV_NAME --name "plaid-secret" --value "<YOUR_KEY>"
az keyvault secret set --vault-name $KV_NAME --name "jwt-secret" --value "<YOUR_KEY>"
```

## CI/CD

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that:

1. Builds the monorepo (frontends + API server)
2. Pushes the API container image to ACR
3. Updates the Container App revision
4. Deploys each frontend to its Static Web App

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AZURE_CLIENT_ID` | Service principal / federated identity client ID |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `PG_ADMIN_LOGIN` | PostgreSQL admin username |
| `PG_ADMIN_PASSWORD` | PostgreSQL admin password |
| `SWA_TOKEN_rosie` | Static Web App deployment token for Rosie |
| `SWA_TOKEN_aegis` | Static Web App deployment token for Aegis |
| ... | One `SWA_TOKEN_<app>` per frontend app |

## Environment Variables (API Server)

The API server uses these environment variables. All Azure integrations are opt-in — omit them for local development.

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 3000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NODE_ENV` | No | `production` / `development` |
| `AZURE_KEY_VAULT_URL` | No | Key Vault URL — enables centralized secret management |
| `AZURE_REDIS_URL` | No | Redis connection string — enables Redis session/cache |
| `AZURE_STORAGE_CONNECTION_STRING` | No | Blob Storage connection string |
| `AZURE_STORAGE_ACCOUNT_NAME` | No | Blob Storage account name (uses managed identity) |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | No | App Insights telemetry |

## Cost Estimates (Monthly)

| Resource | SKU | Estimated Cost |
|----------|-----|---------------|
| Front Door Premium | Per request + bandwidth | ~$35-100 |
| Static Web Apps Standard (×11) | Standard tier | ~$0-99 |
| Container Apps | 0.5 vCPU, 1GB RAM | ~$15-40 |
| Key Vault | Standard | ~$1-5 |
| PostgreSQL Flexible | B1ms, 32GB | ~$13-25 |
| Redis Cache | Basic C0 | ~$16 |
| Blob Storage | Standard LRS | ~$1-10 |
| Application Insights | Per GB ingested | ~$2-20 |
| **Total** | | **~$80-300/mo** |
