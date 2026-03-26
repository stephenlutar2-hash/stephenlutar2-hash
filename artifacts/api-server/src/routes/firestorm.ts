import { Router } from "express";
import { requireAuth } from "./auth";

const router = Router();

router.use("/firestorm", requireAuth);

router.get("/firestorm/health", (_req, res) => {
  res.json({ ok: true, group: "firestorm", timestamp: new Date().toISOString() });
});

interface Scenario {
  id: string;
  name: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  expectedDetections: string[];
  timelineEvents: { time: string; event: string; type: "normal" | "anomalous" }[];
  estimatedDuration: string;
  status: "idle" | "running" | "complete";
}

interface SyntheticEvent {
  id: string;
  timestamp: string;
  scenarioId: string;
  scenarioName: string;
  type: "network" | "auth" | "file" | "process" | "dns";
  severity: "critical" | "high" | "medium" | "low" | "info";
  source: string;
  destination: string;
  detail: string;
  detected: boolean;
}

const scenarios: Scenario[] = [
  {
    id: "port-scan-sweep",
    name: "Port Scan Sweep",
    category: "Reconnaissance",
    severity: "medium",
    description: "Simulates a comprehensive port scanning operation against internal network segments to validate IDS/IPS detection rules and alerting thresholds.",
    expectedDetections: ["IDS Port Scan Alert", "Firewall Anomaly", "SIEM Correlation Rule"],
    timelineEvents: [
      { time: "T+0s", event: "SYN scan initiated on subnet 10.0.1.0/24", type: "anomalous" },
      { time: "T+5s", event: "TCP/80, TCP/443 responses collected", type: "normal" },
      { time: "T+12s", event: "Uncommon ports TCP/8080, TCP/9090 probed", type: "anomalous" },
      { time: "T+20s", event: "UDP scan phase begins", type: "anomalous" },
      { time: "T+30s", event: "Scan results aggregated — 147 open ports identified", type: "normal" },
    ],
    estimatedDuration: "2 min",
    status: "idle",
  },
  {
    id: "brute-force-login",
    name: "Brute Force Login Burst",
    category: "Credential Attack",
    severity: "high",
    description: "Generates rapid authentication attempts against target endpoints to test account lockout policies, rate limiting, and SIEM correlation capabilities.",
    expectedDetections: ["Failed Login Threshold", "Account Lockout Trigger", "Rate Limit Alert", "Brute Force Correlation"],
    timelineEvents: [
      { time: "T+0s", event: "50 login attempts/sec initiated against /api/auth", type: "anomalous" },
      { time: "T+3s", event: "Account lockout triggered for test-user-01", type: "normal" },
      { time: "T+5s", event: "Rate limiter engaged — 429 responses observed", type: "normal" },
      { time: "T+10s", event: "Credential rotation from dictionary list", type: "anomalous" },
      { time: "T+15s", event: "Source IP blacklisted by WAF", type: "normal" },
    ],
    estimatedDuration: "1 min",
    status: "idle",
  },
  {
    id: "sql-injection",
    name: "SQL Injection Pattern",
    category: "Application Attack",
    severity: "critical",
    description: "Injects common SQL injection payloads to validate WAF rules, input sanitization, and database query monitoring configurations.",
    expectedDetections: ["WAF SQL Injection Rule", "DB Query Anomaly", "Application Error Spike", "Input Validation Alert"],
    timelineEvents: [
      { time: "T+0s", event: "UNION-based injection payload sent to search endpoint", type: "anomalous" },
      { time: "T+2s", event: "WAF blocks request — rule WFR-2001 triggered", type: "normal" },
      { time: "T+5s", event: "Time-based blind injection attempt", type: "anomalous" },
      { time: "T+8s", event: "Error-based injection generates 500 response", type: "anomalous" },
      { time: "T+12s", event: "Application logs show sanitization in effect", type: "normal" },
    ],
    estimatedDuration: "1.5 min",
    status: "idle",
  },
  {
    id: "ddos-surge",
    name: "DDoS Surge Pattern",
    category: "Availability Attack",
    severity: "critical",
    description: "Simulates volumetric traffic patterns to validate DDoS mitigation, auto-scaling triggers, and traffic shaping policies.",
    expectedDetections: ["DDoS Mitigation Trigger", "Traffic Anomaly Alert", "Auto-Scale Event", "CDN Rate Limit"],
    timelineEvents: [
      { time: "T+0s", event: "Baseline traffic: 200 req/sec — normal", type: "normal" },
      { time: "T+5s", event: "Traffic ramp to 5,000 req/sec", type: "anomalous" },
      { time: "T+10s", event: "DDoS mitigation layer activated", type: "normal" },
      { time: "T+15s", event: "Auto-scaling triggered — 4 additional instances", type: "normal" },
      { time: "T+25s", event: "Traffic peak: 20,000 req/sec — synthetic", type: "anomalous" },
      { time: "T+30s", event: "CDN edge filtering engaged", type: "normal" },
    ],
    estimatedDuration: "3 min",
    status: "idle",
  },
  {
    id: "suspicious-admin-login",
    name: "Suspicious Admin Login",
    category: "Insider Threat",
    severity: "high",
    description: "Simulates anomalous administrative access patterns including off-hours logins, impossible travel, and privilege escalation to test behavioral analytics.",
    expectedDetections: ["Off-Hours Admin Access", "Impossible Travel Alert", "Privilege Escalation", "UEBA Anomaly Score"],
    timelineEvents: [
      { time: "T+0s", event: "Admin login at 03:00 UTC from unusual geolocation", type: "anomalous" },
      { time: "T+3s", event: "Second login from different continent within 2 min", type: "anomalous" },
      { time: "T+8s", event: "Privilege escalation: user → admin role change", type: "anomalous" },
      { time: "T+12s", event: "Access to sensitive configuration endpoints", type: "anomalous" },
      { time: "T+15s", event: "UEBA score exceeds threshold — alert generated", type: "normal" },
    ],
    estimatedDuration: "1 min",
    status: "idle",
  },
  {
    id: "lateral-movement",
    name: "Lateral Movement Indicators",
    category: "Post-Exploitation",
    severity: "critical",
    description: "Generates synthetic lateral movement patterns including SMB/RDP pivoting and credential reuse to validate network segmentation and EDR detection.",
    expectedDetections: ["Lateral Movement Alert", "SMB Anomaly", "EDR Process Chain", "Network Segmentation Violation"],
    timelineEvents: [
      { time: "T+0s", event: "Initial foothold established on workstation-042", type: "anomalous" },
      { time: "T+5s", event: "SMB enumeration of file shares on 10.0.2.0/24", type: "anomalous" },
      { time: "T+10s", event: "Pass-the-hash attempt to server-db-01", type: "anomalous" },
      { time: "T+15s", event: "RDP session initiated to server-app-03", type: "anomalous" },
      { time: "T+20s", event: "EDR detects suspicious process chain", type: "normal" },
      { time: "T+25s", event: "Network segmentation blocks cross-VLAN access", type: "normal" },
    ],
    estimatedDuration: "2 min",
    status: "idle",
  },
  {
    id: "data-staging",
    name: "Data Staging Indicators",
    category: "Exfiltration",
    severity: "high",
    description: "Simulates data collection and staging behaviors to test DLP rules, file integrity monitoring, and egress filtering capabilities.",
    expectedDetections: ["DLP Policy Trigger", "Large File Transfer Alert", "Egress Filter Match", "FIM Alert"],
    timelineEvents: [
      { time: "T+0s", event: "Bulk file access across multiple directories", type: "anomalous" },
      { time: "T+5s", event: "Archive creation: staging_data.tar.gz (2.4 GB)", type: "anomalous" },
      { time: "T+10s", event: "DNS tunneling attempt to external resolver", type: "anomalous" },
      { time: "T+15s", event: "DLP blocks outbound transfer on port 443", type: "normal" },
      { time: "T+20s", event: "FIM detects unauthorized access to /data/sensitive", type: "normal" },
    ],
    estimatedDuration: "1.5 min",
    status: "idle",
  },
];

const activeEvents: SyntheticEvent[] = [];
const runningTimers = new Map<string, ReturnType<typeof setInterval>>();

const EVENT_TYPES: SyntheticEvent["type"][] = ["network", "auth", "file", "process", "dns"];
const SOURCES = ["workstation-042", "server-app-03", "fw-edge-01", "waf-prod-02", "ids-sensor-05", "endpoint-127"];
const DESTINATIONS = ["10.0.1.15", "10.0.2.200", "192.168.1.1", "cdn-edge.szl.internal", "db-primary.szl.internal"];

function generateEvent(scenario: Scenario): SyntheticEvent {
  const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    type,
    severity: scenario.severity,
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    destination: DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)],
    detail: `[${scenario.category}] Synthetic ${type} event — ${scenario.name}`,
    detected: Math.random() > 0.15,
  };
}

router.get("/firestorm/scenarios", (_req, res) => {
  res.json(scenarios.map((s) => ({ ...s })));
});

router.post("/firestorm/scenarios/:id/start", (req, res) => {
  const scenario = scenarios.find((s) => s.id === req.params.id);
  if (!scenario) return res.status(404).json({ error: "Scenario not found" });
  if (scenario.status === "running") return res.json({ message: "Already running", scenario });

  scenario.status = "running";
  const timer = setInterval(() => {
    const evt = generateEvent(scenario);
    activeEvents.unshift(evt);
    if (activeEvents.length > 200) activeEvents.length = 200;
  }, 2000);
  runningTimers.set(scenario.id, timer);

  res.json({ message: "Scenario started", scenario });
});

router.post("/firestorm/scenarios/:id/stop", (req, res) => {
  const scenario = scenarios.find((s) => s.id === req.params.id);
  if (!scenario) return res.status(404).json({ error: "Scenario not found" });

  scenario.status = "complete";
  const timer = runningTimers.get(scenario.id);
  if (timer) {
    clearInterval(timer);
    runningTimers.delete(scenario.id);
  }

  res.json({ message: "Scenario stopped", scenario });
});

router.get("/firestorm/events/live", (_req, res) => {
  res.json(activeEvents.slice(0, 50));
});

router.get("/firestorm/detections/coverage", (_req, res) => {
  const total = activeEvents.length || 1;
  const detected = activeEvents.filter((e) => e.detected).length;
  const falsePositives = Math.floor(Math.random() * 3);
  const falseNegatives = activeEvents.filter((e) => !e.detected).length;

  const rulesCoverage: Record<string, number> = {};
  for (const s of scenarios) {
    for (const d of s.expectedDetections) {
      rulesCoverage[d] = Math.floor(70 + Math.random() * 30);
    }
  }

  res.json({
    totalEvents: total,
    detectedEvents: detected,
    detectionRate: Math.round((detected / total) * 100),
    falsePositives,
    falseNegatives,
    rulesCoverage,
    confidenceScore: Math.round(85 + Math.random() * 12),
  });
});

router.get("/firestorm/reports", (_req, res) => {
  const reports = [
    {
      id: "rpt-001",
      title: "Weekly Simulation Summary",
      date: new Date().toISOString(),
      status: "complete",
      scenariosRun: 5,
      detectionRate: 92,
      avgResponseTime: "4.2 min",
      missedDetections: 3,
      responseReadiness: 88,
    },
    {
      id: "rpt-002",
      title: "Lateral Movement Drill Report",
      date: new Date(Date.now() - 86400000).toISOString(),
      status: "complete",
      scenariosRun: 2,
      detectionRate: 87,
      avgResponseTime: "6.1 min",
      missedDetections: 5,
      responseReadiness: 79,
    },
    {
      id: "rpt-003",
      title: "DDoS Readiness Assessment",
      date: new Date(Date.now() - 172800000).toISOString(),
      status: "complete",
      scenariosRun: 3,
      detectionRate: 95,
      avgResponseTime: "2.8 min",
      missedDetections: 1,
      responseReadiness: 94,
    },
  ];

  const runningScenarios = scenarios.filter((s) => s.status === "running").length;
  const completedScenarios = scenarios.filter((s) => s.status === "complete").length;

  res.json({
    reports,
    summary: {
      totalScenarios: scenarios.length,
      runningScenarios,
      completedScenarios,
      totalEvents: activeEvents.length,
      avgDetectionRate: 91,
      avgResponseTime: "4.4 min",
      overallReadiness: 87,
    },
  });
});

router.get("/firestorm/reports/export", (req, res) => {
  const format = req.query.format || "json";

  const data = {
    exportDate: new Date().toISOString(),
    platform: "Firestorm Simulation Lab",
    scenarios: scenarios.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      severity: s.severity,
      status: s.status,
      expectedDetections: s.expectedDetections,
    })),
    events: activeEvents.slice(0, 100),
    detectionSummary: {
      totalEvents: activeEvents.length,
      detected: activeEvents.filter((e) => e.detected).length,
      missed: activeEvents.filter((e) => !e.detected).length,
    },
  };

  if (format === "csv") {
    const header = "id,timestamp,scenarioId,scenarioName,type,severity,source,destination,detail,detected\n";
    const rows = data.events.map((e) =>
      `${e.id},${e.timestamp},${e.scenarioId},${e.scenarioName},${e.type},${e.severity},${e.source},${e.destination},"${e.detail}",${e.detected}`
    ).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=firestorm-report.csv");
    return res.send(header + rows);
  }

  res.setHeader("Content-Disposition", "attachment; filename=firestorm-report.json");
  return res.json(data);
});

export default router;
