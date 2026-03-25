FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/db/package.json lib/db/
COPY lib/integrations/openai-ai-server/package.json lib/integrations/openai-ai-server/
COPY artifacts/api-server/package.json artifacts/api-server/
COPY artifacts/rosie/package.json artifacts/rosie/
COPY artifacts/aegis/package.json artifacts/aegis/
COPY artifacts/beacon/package.json artifacts/beacon/
COPY artifacts/lutar/package.json artifacts/lutar/
COPY artifacts/nimbus/package.json artifacts/nimbus/
COPY artifacts/firestorm/package.json artifacts/firestorm/
COPY artifacts/dreamera/package.json artifacts/dreamera/
COPY artifacts/zeus/package.json artifacts/zeus/
COPY artifacts/apps-showcase/package.json artifacts/apps-showcase/
COPY artifacts/readiness-report/package.json artifacts/readiness-report/
COPY artifacts/career/package.json artifacts/career/
COPY lib/api-zod/package.json lib/api-zod/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/artifacts/*/node_modules ./artifacts/
COPY --from=deps /app/lib/*/node_modules ./lib/
COPY . .
RUN pnpm run build

FROM node:22-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build /app/artifacts/api-server/package.json ./artifacts/api-server/
COPY --from=build /app/artifacts/rosie/dist/public ./artifacts/rosie/dist/public
COPY --from=build /app/artifacts/aegis/dist/public ./artifacts/aegis/dist/public
COPY --from=build /app/artifacts/beacon/dist/public ./artifacts/beacon/dist/public
COPY --from=build /app/artifacts/lutar/dist/public ./artifacts/lutar/dist/public
COPY --from=build /app/artifacts/nimbus/dist/public ./artifacts/nimbus/dist/public
COPY --from=build /app/artifacts/firestorm/dist/public ./artifacts/firestorm/dist/public
COPY --from=build /app/artifacts/dreamera/dist/public ./artifacts/dreamera/dist/public
COPY --from=build /app/artifacts/zeus/dist/public ./artifacts/zeus/dist/public
COPY --from=build /app/artifacts/apps-showcase/dist/public ./artifacts/apps-showcase/dist/public
COPY --from=build /app/artifacts/readiness-report/dist/public ./artifacts/readiness-report/dist/public
COPY --from=build /app/artifacts/career/dist/public ./artifacts/career/dist/public

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
