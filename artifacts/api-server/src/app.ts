import express, { type Express, type Request, type Response, type NextFunction } from "express";
import compression from "compression";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import fs from "node:fs";
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

app.use(compression({
  filter: (req: Request, res: Response) => {
    if (req.originalUrl === "/api/stripe/webhook" || req.url === "/api/stripe/webhook") {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024,
  level: 6,
}));

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

function requestTimeout(timeoutMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ status: 408, code: "REQUEST_TIMEOUT", message: "Request timed out" });
      }
    }, timeoutMs);
    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));
    next();
  };
}

app.use(cors());
app.use((req: Request, res: Response, next: Function) => {
  if (req.originalUrl === "/api/stripe/webhook" || req.url === "/api/stripe/webhook") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json({ limit: "1mb" })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/health", requestTimeout(10000), (_req: Request, res: Response) => {
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

app.get("/healthz", requestTimeout(10000), async (_req: Request, res: Response) => {
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

app.get("/readyz", requestTimeout(10000), async (_req: Request, res: Response) => {
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

app.use("/api", requestTimeout(30000), router);

app.use("/api", (req: Request, res: Response) => {
  const requestId = (req as any).id as string | undefined;
  res.status(404).json(
    formatErrorResponse(404, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`, requestId),
  );
});

app.use(errorHandler());

const artifactsRoot = path.resolve(__dirname, "..", "..");

const HASHED_ASSET_RE = /\.[a-f0-9]{8,}\.\w+$/;
const ONE_YEAR = 31536000;
const ONE_HOUR = 3600;

function servePreCompressed(req: Request, res: Response, next: NextFunction): void {
  const acceptEncoding = req.headers["accept-encoding"] || "";
  const filePath = req.path;

  if (typeof acceptEncoding === "string") {
    const baseDir = (req as any)._staticBaseDir as string | undefined;
    if (baseDir) {
      const fullPath = path.join(baseDir, filePath);
      if (acceptEncoding.includes("br")) {
        const brPath = fullPath + ".br";
        if (fs.existsSync(brPath)) {
          res.setHeader("Content-Encoding", "br");
          res.setHeader("Vary", "Accept-Encoding");
          const ext = path.extname(filePath).slice(1);
          const mimeTypes: Record<string, string> = {
            js: "application/javascript",
            css: "text/css",
            html: "text/html",
            json: "application/json",
            svg: "image/svg+xml",
          };
          if (mimeTypes[ext]) {
            res.setHeader("Content-Type", mimeTypes[ext]);
          }
          res.sendFile(brPath);
          return;
        }
      }
      if (acceptEncoding.includes("gzip")) {
        const gzPath = fullPath + ".gz";
        if (fs.existsSync(gzPath)) {
          res.setHeader("Content-Encoding", "gzip");
          res.setHeader("Vary", "Accept-Encoding");
          const ext = path.extname(filePath).slice(1);
          const mimeTypes: Record<string, string> = {
            js: "application/javascript",
            css: "text/css",
            html: "text/html",
            json: "application/json",
            svg: "image/svg+xml",
          };
          if (mimeTypes[ext]) {
            res.setHeader("Content-Type", mimeTypes[ext]);
          }
          res.sendFile(gzPath);
          return;
        }
      }
    }
  }
  next();
}

const ONE_DAY = 86400;

function staticCacheHeaders(req: Request, res: Response, next: NextFunction): void {
  const filePath = req.path;

  if (filePath === "/" || filePath === "/index.html" || filePath.endsWith("/index.html")) {
    res.setHeader("Cache-Control", `public, max-age=${ONE_HOUR}, must-revalidate`);
  } else if (HASHED_ASSET_RE.test(filePath)) {
    res.setHeader("Cache-Control", `public, max-age=${ONE_YEAR}, immutable`);
  } else if (/\.(js|css|woff2?|ttf|eot|otf)$/.test(filePath)) {
    res.setHeader("Cache-Control", `public, max-age=${ONE_DAY}`);
  } else if (/\.(png|jpe?g|gif|webp|avif|ico|svg)$/.test(filePath)) {
    res.setHeader("Cache-Control", `public, max-age=${ONE_DAY}`);
  } else {
    res.setHeader("Cache-Control", `public, max-age=${ONE_HOUR}`);
  }
  next();
}

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
  app.use(fe.basePath, (req: Request, _res: Response, next: NextFunction) => {
    (req as any)._staticBaseDir = distDir;
    next();
  }, servePreCompressed, staticCacheHeaders, express.static(distDir, { etag: true, lastModified: true }));
  app.get(`${fe.basePath}/{*splat}`, (_req: Request, res: Response) => {
    res.setHeader("Cache-Control", `public, max-age=${ONE_HOUR}, must-revalidate`);
    res.sendFile(path.join(distDir, "index.html"));
  });
}

const rosieDistDir = path.join(artifactsRoot, "rosie", "dist", "public");
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any)._staticBaseDir = rosieDistDir;
  next();
}, servePreCompressed, staticCacheHeaders, express.static(rosieDistDir, { etag: true, lastModified: true }));

const errorPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SZL Holdings — Temporarily Unavailable</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;background:#06060b;color:#e5e5e5;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}
    .container{text-align:center;max-width:480px}
    .logo{font-size:2.5rem;font-weight:700;color:#c9a84c;margin-bottom:1.5rem;letter-spacing:-0.02em}
    h1{font-size:1.5rem;font-weight:600;margin-bottom:0.75rem;color:#fff}
    p{color:#999;line-height:1.6;margin-bottom:1.5rem}
    .btn{display:inline-block;padding:0.75rem 1.5rem;background:#c9a84c;color:#06060b;text-decoration:none;border-radius:0.5rem;font-weight:600;transition:opacity 0.2s}
    .btn:hover{opacity:0.85}
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">SZL Holdings</div>
    <h1>We'll Be Right Back</h1>
    <p>Our platform is experiencing high demand. Please refresh in a moment.</p>
    <a href="/" class="btn">Refresh Page</a>
  </div>
</body>
</html>`;

app.get("{*splat}", (req: Request, res: Response) => {
  const filePath = path.join(rosieDistDir, "index.html");
  if (fs.existsSync(filePath)) {
    res.setHeader("Cache-Control", `public, max-age=${ONE_HOUR}, must-revalidate`);
    res.sendFile(filePath);
  } else {
    res.status(503).setHeader("Cache-Control", "no-cache").setHeader("Content-Type", "text/html").send(errorPageHtml);
  }
});

export default app;
