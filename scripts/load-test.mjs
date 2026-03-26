import http from "node:http";
import { URL } from "node:url";

const BASE_URL = process.env.LOAD_TEST_URL || "http://localhost:3000";

const ROUTES = [
  "/health",
  "/healthz",
  "/readyz",
  "/api/auth/entra-config",
  "/rosie/",
  "/aegis/",
  "/beacon/",
  "/lutar/",
  "/nimbus/",
  "/firestorm/",
  "/dreamera/",
  "/dreamscape/",
  "/zeus/",
  "/apps-showcase/",
  "/readiness-report/",
  "/career/",
  "/alloyscape/",
  "/vessels/",
  "/carlota-jo/",
  "/lyte/",
  "/inca/",
  "/szl-holdings/",
];

const CONCURRENCY = parseInt(process.env.LOAD_TEST_CONCURRENCY || "100", 10);
const DURATION_MS = parseInt(process.env.LOAD_TEST_DURATION || "10000", 10);

function makeRequest(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname,
      method: "GET",
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        resolve({
          url: parsed.pathname,
          status: res.statusCode,
          latency: Date.now() - start,
          bytes: Buffer.byteLength(body),
          ok: true,
        });
      });
    });

    req.on("error", (err) => {
      resolve({
        url: parsed.pathname,
        status: 0,
        latency: Date.now() - start,
        bytes: 0,
        ok: false,
        error: err.message,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        url: parsed.pathname,
        status: 0,
        latency: Date.now() - start,
        bytes: 0,
        ok: false,
        error: "timeout",
      });
    });

    req.end();
  });
}

async function runLoadTest() {
  console.log(`\n  SZL Holdings Load Test`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Concurrency: ${CONCURRENCY}`);
  console.log(`  Duration: ${DURATION_MS}ms\n`);

  const results = [];
  const startTime = Date.now();
  let active = 0;
  let routeIdx = 0;

  async function sendRequest() {
    while (Date.now() - startTime < DURATION_MS) {
      const route = ROUTES[routeIdx % ROUTES.length];
      routeIdx++;
      const result = await makeRequest(`${BASE_URL}${route}`);
      results.push(result);
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(sendRequest());
  }

  await Promise.all(workers);

  const totalTime = Date.now() - startTime;
  const totalRequests = results.length;
  const successes = results.filter((r) => r.ok && r.status >= 200 && r.status < 500).length;
  const failures = totalRequests - successes;
  const latencies = results.map((r) => r.latency).sort((a, b) => a - b);

  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;
  const max = latencies[latencies.length - 1] || 0;
  const min = latencies[0] || 0;
  const rps = (totalRequests / (totalTime / 1000)).toFixed(1);

  console.log(`  Results`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Total requests:  ${totalRequests}`);
  console.log(`  Successful:      ${successes}`);
  console.log(`  Failed:          ${failures}`);
  console.log(`  Duration:        ${(totalTime / 1000).toFixed(1)}s`);
  console.log(`  Requests/sec:    ${rps}`);
  console.log(`  `);
  console.log(`  Latency`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Min:    ${min}ms`);
  console.log(`  Avg:    ${avg.toFixed(1)}ms`);
  console.log(`  P50:    ${p50}ms`);
  console.log(`  P95:    ${p95}ms`);
  console.log(`  P99:    ${p99}ms`);
  console.log(`  Max:    ${max}ms`);

  const routeStats = {};
  for (const r of results) {
    if (!routeStats[r.url]) {
      routeStats[r.url] = { count: 0, totalLatency: 0, errors: 0 };
    }
    routeStats[r.url].count++;
    routeStats[r.url].totalLatency += r.latency;
    if (!r.ok || r.status >= 500) routeStats[r.url].errors++;
  }

  console.log(`\n  Per-Route Summary`);
  console.log(`  ─────────────────────────────────────`);
  for (const [route, stats] of Object.entries(routeStats).sort((a, b) => a[0].localeCompare(b[0]))) {
    const avgLatency = (stats.totalLatency / stats.count).toFixed(0);
    const status = stats.errors > 0 ? `WARN (${stats.errors} errors)` : "OK";
    console.log(`  ${route.padEnd(25)} ${String(stats.count).padStart(5)} reqs  avg ${avgLatency}ms  ${status}`);
  }

  console.log(`\n  Thresholds`);
  console.log(`  ─────────────────────────────────────`);
  const staticUnder500 = results.filter((r) => !r.url.startsWith("/api") && r.url !== "/health" && r.url !== "/healthz" && r.url !== "/readyz").filter((r) => r.latency <= 500).length;
  const staticTotal = results.filter((r) => !r.url.startsWith("/api") && r.url !== "/health" && r.url !== "/healthz" && r.url !== "/readyz").length;
  const apiUnder2s = results.filter((r) => r.url.startsWith("/api")).filter((r) => r.latency <= 2000).length;
  const apiTotal = results.filter((r) => r.url.startsWith("/api")).length;

  console.log(`  Static pages < 500ms:  ${staticTotal > 0 ? ((staticUnder500 / staticTotal) * 100).toFixed(1) : "N/A"}% (${staticUnder500}/${staticTotal})`);
  console.log(`  API routes < 2000ms:   ${apiTotal > 0 ? ((apiUnder2s / apiTotal) * 100).toFixed(1) : "N/A"}% (${apiUnder2s}/${apiTotal})`);
  console.log(`  Error rate:            ${((failures / totalRequests) * 100).toFixed(1)}%`);
  console.log();

  if (failures > totalRequests * 0.05) {
    console.log("  FAIL: Error rate exceeds 5%");
    process.exit(1);
  }
  if (p95 > 2000) {
    console.log("  WARN: P95 latency exceeds 2000ms");
  }

  console.log("  PASS: Load test completed successfully\n");
}

runLoadTest().catch((err) => {
  console.error("Load test failed:", err);
  process.exit(1);
});
