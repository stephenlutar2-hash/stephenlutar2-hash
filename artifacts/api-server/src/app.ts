import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";
import { isKeyVaultConfigured } from "./lib/keyvault";
import { isRedisConfigured, isRedisReady } from "./lib/redis";
import { isBlobStorageConfigured } from "./lib/blobStorage";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

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
app.use(cors());
app.use((req: Request, res: Response, next: Function) => {
  if (req.originalUrl === "/api/stripe/webhook") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    azure: {
      keyVault: isKeyVaultConfigured(),
      redis: { configured: isRedisConfigured(), connected: isRedisReady() },
      blobStorage: isBlobStorageConfigured(),
    },
  });
});

app.use("/api", router);

const artifactsRoot = path.resolve(__dirname, "..", "..");

const frontends: Array<{ basePath: string; dir: string }> = [
  { basePath: "/aegis", dir: "aegis" },
  { basePath: "/beacon", dir: "beacon" },
  { basePath: "/lutar", dir: "lutar" },
  { basePath: "/nimbus", dir: "nimbus" },
  { basePath: "/firestorm", dir: "firestorm" },
  { basePath: "/dreamera", dir: "dreamera" },
  { basePath: "/zeus", dir: "zeus" },
  { basePath: "/apps-showcase", dir: "apps-showcase" },
  { basePath: "/readiness-report", dir: "readiness-report" },
  { basePath: "/career", dir: "career" },
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
