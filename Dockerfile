FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/db/package.json lib/db/
COPY lib/integrations-openai-ai-server/package.json lib/integrations-openai-ai-server/
COPY lib/api-zod/package.json lib/api-zod/
COPY lib/api-spec/package.json lib/api-spec/
COPY lib/api-client-react/package.json lib/api-client-react/
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
COPY artifacts/vessels/package.json artifacts/vessels/
COPY artifacts/inca/package.json artifacts/inca/
COPY artifacts/lyte/package.json artifacts/lyte/
COPY artifacts/carlota-jo/package.json artifacts/carlota-jo/
COPY artifacts/szl-holdings/package.json artifacts/szl-holdings/
COPY artifacts/dreamscape/package.json artifacts/dreamscape/
COPY artifacts/alloyscape/package.json artifacts/alloyscape/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY . .
RUN pnpm install --frozen-lockfile && pnpm run build

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
COPY --from=build /app/artifacts/vessels/dist/public ./artifacts/vessels/dist/public
COPY --from=build /app/artifacts/inca/dist/public ./artifacts/inca/dist/public
COPY --from=build /app/artifacts/lyte/dist/public ./artifacts/lyte/dist/public
COPY --from=build /app/artifacts/carlota-jo/dist/public ./artifacts/carlota-jo/dist/public
COPY --from=build /app/artifacts/szl-holdings/dist/public ./artifacts/szl-holdings/dist/public
COPY --from=build /app/artifacts/dreamscape/dist/public ./artifacts/dreamscape/dist/public
COPY --from=build /app/artifacts/alloyscape/dist/public ./artifacts/alloyscape/dist/public

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-workspace.yaml ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
