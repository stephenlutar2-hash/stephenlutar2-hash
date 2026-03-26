export interface DomainEntry {
  domain: string;
  artifactDir: string;
  path: string;
  type: "frontend" | "api";
}

export const DOMAIN_MAP: DomainEntry[] = [
  { domain: "szlholdings.com", artifactDir: "szl-holdings", path: "/szl-holdings", type: "frontend" },
  { domain: "www.szlholdings.com", artifactDir: "szl-holdings", path: "/szl-holdings", type: "frontend" },
  { domain: "carlotajo.com", artifactDir: "carlota-jo", path: "/carlota-jo", type: "frontend" },
  { domain: "www.carlotajo.com", artifactDir: "carlota-jo", path: "/carlota-jo", type: "frontend" },
  { domain: "vesselsintel.com", artifactDir: "vessels", path: "/vessels", type: "frontend" },
  { domain: "www.vesselsintel.com", artifactDir: "vessels", path: "/vessels", type: "frontend" },

  { domain: "rosie.szlholdings.com", artifactDir: "rosie", path: "/", type: "frontend" },
  { domain: "inca.szlholdings.com", artifactDir: "inca", path: "/inca", type: "frontend" },
  { domain: "aegis.szlholdings.com", artifactDir: "aegis", path: "/aegis", type: "frontend" },
  { domain: "beacon.szlholdings.com", artifactDir: "beacon", path: "/beacon", type: "frontend" },
  { domain: "nimbus.szlholdings.com", artifactDir: "nimbus", path: "/nimbus", type: "frontend" },
  { domain: "lyte.szlholdings.com", artifactDir: "lyte", path: "/lyte", type: "frontend" },
  { domain: "dreamera.szlholdings.com", artifactDir: "dreamera", path: "/dreamera", type: "frontend" },
  { domain: "dreamscape.szlholdings.com", artifactDir: "dreamscape", path: "/dreamscape", type: "frontend" },
  { domain: "zeus.szlholdings.com", artifactDir: "zeus", path: "/zeus", type: "frontend" },
  { domain: "alloyscape.szlholdings.com", artifactDir: "alloyscape", path: "/alloyscape", type: "frontend" },
  { domain: "firestorm.szlholdings.com", artifactDir: "firestorm", path: "/firestorm", type: "frontend" },
  { domain: "lutar.szlholdings.com", artifactDir: "lutar", path: "/lutar", type: "frontend" },

  { domain: "api.szlholdings.com", artifactDir: "api-server", path: "/api", type: "api" },
  { domain: "apps.szlholdings.com", artifactDir: "apps-showcase", path: "/apps-showcase", type: "frontend" },
  { domain: "readiness.szlholdings.com", artifactDir: "readiness-report", path: "/readiness-report", type: "frontend" },
  { domain: "career.szlholdings.com", artifactDir: "career", path: "/career", type: "frontend" },
];

const byPath = new Map<string, DomainEntry>();
const byDir = new Map<string, DomainEntry>();
const byDomain = new Map<string, DomainEntry>();

for (const entry of DOMAIN_MAP) {
  if (!byPath.has(entry.path)) byPath.set(entry.path, entry);
  if (!byDir.has(entry.artifactDir)) byDir.set(entry.artifactDir, entry);
  byDomain.set(entry.domain, entry);
}

export function getDomainMapping(host: string): DomainEntry | undefined {
  const normalized = host.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
  return byDomain.get(normalized);
}

function getBrowserLocation(): { hostname: string; protocol: string } | null {
  const g = globalThis as Record<string, unknown>;
  if (typeof g.window !== "undefined" && g.window !== null) {
    const w = g.window as { location?: { hostname?: string; protocol?: string } };
    if (w.location?.hostname) {
      return { hostname: w.location.hostname, protocol: w.location.protocol || "https:" };
    }
  }
  return null;
}

export function isCustomDomain(): boolean {
  const loc = getBrowserLocation();
  if (!loc) return false;
  return byDomain.has(loc.hostname.toLowerCase());
}

export function getAppUrl(pathOrDir: string, subPath = "/"): string {
  const entry = byPath.get(pathOrDir) || byDir.get(pathOrDir);
  if (!entry) return pathOrDir + subPath;

  if (isCustomDomain()) {
    const loc = getBrowserLocation();
    const proto = loc?.protocol || "https:";
    return `${proto}//${entry.domain}${subPath}`;
  }

  const base = entry.path === "/" ? "" : entry.path;
  return `${base}${subPath}`;
}

export function getApiUrl(apiPath: string): string {
  if (isCustomDomain()) {
    const loc = getBrowserLocation();
    const proto = loc?.protocol || "https:";
    return `${proto}//api.szlholdings.com${apiPath}`;
  }
  return `/api${apiPath}`;
}
