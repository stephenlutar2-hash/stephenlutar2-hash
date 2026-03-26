import type { Request, Response, NextFunction } from "express";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import { getDomainMapping, type DomainEntry } from "../config/domainMap";
import { logger } from "../lib/logger";

const artifactsRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
  "..",
);

const PASSTHROUGH_PREFIXES = ["/api", "/health", "/healthz", "/readyz"];

const rewrittenHtmlCache = new Map<string, string | null>();

function getRewrittenIndexHtml(mapping: DomainEntry): string | null {
  const cacheKey = mapping.domain;
  if (rewrittenHtmlCache.has(cacheKey)) return rewrittenHtmlCache.get(cacheKey)!;

  const distDir = path.join(artifactsRoot, mapping.artifactDir, "dist", "public");
  const indexPath = path.join(distDir, "index.html");

  try {
    let html = fs.readFileSync(indexPath, "utf-8");

    if (mapping.path !== "/") {
      const prefix = mapping.path.endsWith("/") ? mapping.path : `${mapping.path}/`;
      html = html.replaceAll(prefix, "/");
      const noTrailing = mapping.path.replace(/\/$/, "");
      if (noTrailing) {
        html = html.replaceAll(`"${noTrailing}"`, '"/"');
        html = html.replaceAll(`'${noTrailing}'`, "'/'");
      }
    }

    rewrittenHtmlCache.set(cacheKey, html);
    return html;
  } catch {
    rewrittenHtmlCache.set(cacheKey, null);
    return null;
  }
}

export function domainRoutingMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const host = req.hostname || req.headers.host || "";
    const mapping = getDomainMapping(host);

    if (!mapping) {
      return next();
    }

    if (mapping.type === "api") {
      if (!PASSTHROUGH_PREFIXES.some((p) => req.url.startsWith(p))) {
        req.url = `/api${req.url}`;
      }
      return next();
    }

    if (PASSTHROUGH_PREFIXES.some((p) => req.url.startsWith(p))) {
      return next();
    }

    const distDir = path.join(artifactsRoot, mapping.artifactDir, "dist", "public");

    if (mapping.path !== "/") {
      const prefix = mapping.path;
      if (req.url.startsWith(prefix + "/") || req.url === prefix) {
        req.url = req.url.slice(prefix.length) || "/";
      }
    }

    const staticHandler = express.static(distDir);
    staticHandler(req, res, () => {
      const html = getRewrittenIndexHtml(mapping);
      if (html) {
        res.type("html").send(html);
      } else {
        logger.error({ host, url: req.url, artifactDir: mapping.artifactDir }, "Failed to serve index.html for custom domain");
        next();
      }
    });
  };
}

export function clearDomainHtmlCache(): void {
  rewrittenHtmlCache.clear();
}
