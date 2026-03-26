import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";
import { isDatabaseAvailable, pool } from "@szl-holdings/db";
import { isKeyVaultConfigured } from "./lib/keyvault";
import { isRedisConfigured, isRedisReady } from "./lib/redis";
import { isBlobStorageConfigured } from "./lib/blobStorage";
import { securityHeaders } from "./middleware/securityHeaders";
import { domainRoutingMiddleware } from "./middleware/domainRouting";
import { requestContextMiddleware } from "./lib/requestContext";
import { errorHandler } from "./middleware/errorHandler";
import { formatErrorResponse } from "./lib/errors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

app.use(securityHeaders());
app.use(domainRoutingMiddleware());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(requestContextMiddleware());

app.use(cors());
app.use((req: Request, res: Response, next: Function) => {
  if (req.originalUrl === "/api/stripe/webhook" || req.url === "/api/stripe/webhook") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    project: "SZL Holdings",
    timestamp: new Date().toISOString(),
    azure: {
      keyVault: isKeyVaultConfigured(),
      redis: { configured: isRedisConfigured(), connected: isRedisReady() },
      blobStorage: isBlobStorageConfigured(),
    },
  });
});

app.get("/healthz", async (_req: Request, res: Response) => {
  let dbOk = isDatabaseAvailable();
  if (dbOk && pool) {
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
    } catch {
      dbOk = false;
    }
  }
  const ok = dbOk;
  res.status(ok ? 200 : 503).json({ ok, project: "SZL Holdings", timestamp: new Date().toISOString(), database: dbOk });
});

app.get("/readyz", async (_req: Request, res: Response) => {
  const checks: Record<string, { ready: boolean; error?: string }> = {};
  checks.database = { ready: isDatabaseAvailable() };
  if (isDatabaseAvailable() && pool) {
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      checks.database = { ready: true };
    } catch (err) {
      checks.database = { ready: false, error: err instanceof Error ? err.message : "Connection failed" };
    }
  }
  checks.redis = { ready: isRedisReady() };
  checks.keyVault = { ready: isKeyVaultConfigured() };
  checks.blobStorage = { ready: isBlobStorageConfigured() };
  const allReady = checks.database.ready && (!isRedisConfigured() || checks.redis.ready);
  res.status(allReady ? 200 : 503).json({ ok: allReady, project: "SZL Holdings", timestamp: new Date().toISOString(), checks });
});

app.use("/api", router);

app.use("/api", (req: Request, res: Response) => {
  const requestId = (req as any).id as string | undefined;
  res.status(404).json(
    formatErrorResponse(404, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`, requestId),
  );
});

app.use(errorHandler());

const artifactsRoot = path.resolve(__dirname, "..", "..");


app.get("/alloy", (req: Request, res: Response) => {
  const qs = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
  res.redirect(301, `/alloyscape/${qs}`);
});
app.get("/alloy/{*splat}", (req: Request, res: Response) => {
  const raw = (req.params as Record<string, unknown>).splat;
  const rest = Array.isArray(raw) ? raw.join("/") : (raw as string) || "";
  const qs = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
  res.redirect(301, `/alloyscape/${rest}${qs}`);
});

const frontends: Array<{ basePath: string; dir: string }> = [
  { basePath: "/rosie", dir: "rosie" },
  { basePath: "/aegis", dir: "aegis" },
  { basePath: "/beacon", dir: "beacon" },
  { basePath: "/lutar", dir: "lutar" },
  { basePath: "/nimbus", dir: "nimbus" },
  { basePath: "/firestorm", dir: "firestorm" },
  { basePath: "/dreamera", dir: "dreamera" },
  { basePath: "/dreamscape", dir: "dreamscape" },
  { basePath: "/zeus", dir: "zeus" },
  { basePath: "/apps-showcase", dir: "apps-showcase" },
  { basePath: "/readiness-report", dir: "readiness-report" },
  { basePath: "/career", dir: "career" },
  { basePath: "/alloyscape", dir: "alloyscape" },
  { basePath: "/vessels", dir: "vessels" },
  { basePath: "/carlota-jo", dir: "carlota-jo" },
  { basePath: "/lyte", dir: "lyte" },
  { basePath: "/inca", dir: "inca" },
  { basePath: "/szl-holdings", dir: "szl-holdings" },
];

for (const fe of frontends) {
  const distDir = path.join(artifactsRoot, fe.dir, "dist", "public");
  app.use(fe.basePath, express.static(distDir));
  app.get(`${fe.basePath}/{*splat}`, (_req: Request, res: Response) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

const rosieDistDir = path.join(artifactsRoot, "rosie", "dist", "public");
app.use(express.static(rosieDistDir));
app.get("{*splat}", (_req: Request, res: Response) => {
  res.sendFile(path.join(rosieDistDir, "index.html"));
});

export default app;
