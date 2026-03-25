import { db } from "@workspace/db";
import { rosieThreatsTable, rosieIncidentsTable, rosieScansTable } from "@workspace/db/schema";

async function seedRosie() {
  console.log("Seeding ROSIE data...");

  await db.insert(rosieThreatsTable).values([
    { type: "DDoS Attack", source: "185.220.x.x (RU)", target: "Beacon API Gateway", severity: "critical", status: "blocked", description: "Volumetric DDoS attack targeting Beacon's API endpoints. Peak 2.4Gbps. Mitigated via rate limiting and IP blackholing." },
    { type: "SQL Injection", source: "103.45.x.x (CN)", target: "Zeus Database Layer", severity: "high", status: "blocked", description: "Attempted SQL injection via search parameter. Payload contained UNION SELECT statements targeting user credentials." },
    { type: "Brute Force", source: "Tor Exit Node", target: "Lutar Auth System", severity: "high", status: "blocked", description: "Automated credential stuffing attack. 14,000 attempts in 3 minutes. Account lockout engaged." },
    { type: "Zero-Day Exploit", source: "Unknown APT Group", target: "INCA AI Runtime", severity: "critical", status: "blocked", description: "Novel buffer overflow targeting ML model serving layer. ROSIE AI detected anomalous memory patterns." },
    { type: "Cross-Site Scripting", source: "82.117.x.x (UA)", target: "Dream Era CMS", severity: "medium", status: "blocked", description: "Stored XSS attempt via content submission form. Malicious script tags sanitized." },
    { type: "Ransomware Probe", source: "Compromised Host (BR)", target: "SZL File Storage", severity: "critical", status: "blocked", description: "Ransomware reconnaissance activity detected. File encryption patterns identified and quarantined." },
    { type: "API Abuse", source: "Cloud Provider (US)", target: "Nimbus Prediction API", severity: "medium", status: "blocked", description: "Rate limit exceeded. 50,000 requests/min from single API key. Key revoked." },
    { type: "Phishing Campaign", source: "Spoofed Domain", target: "SZL Holdings Email", severity: "high", status: "blocked", description: "Spear phishing targeting executive accounts. DMARC/SPF validation prevented delivery." },
    { type: "Port Scanning", source: "Shodan Bot", target: "Zeus Infrastructure", severity: "low", status: "blocked", description: "Systematic port scan across Zeus module endpoints. All non-essential ports already closed." },
    { type: "Data Exfiltration", source: "Internal Anomaly", target: "Aegis Vault", severity: "critical", status: "blocked", description: "Unusual outbound data transfer pattern detected from Aegis vault. Zero-trust policy blocked egress. No data compromised." },
  ]).onConflictDoNothing();

  await db.insert(rosieIncidentsTable).values([
    { title: "Critical: Storage Engine Node Failure", description: "Zeus Storage Engine node szl-stor-03 experienced disk failure. ROSIE initiated automatic failover to hot spare within 4.2 seconds.", severity: "critical", status: "resolved", assignee: "ROSIE AI", platform: "Zeus", resolved: true },
    { title: "Elevated: Prediction Model Drift", description: "Nimbus prediction model showing 4.2% accuracy drift from baseline. ROSIE recommending retraining cycle.", severity: "medium", status: "monitoring", assignee: "ROSIE AI", platform: "Nimbus", resolved: false },
    { title: "High: Unauthorized Access Attempt", description: "14 failed login attempts on Lutar command center from Tor network. IP range blocked. Credentials remain secure.", severity: "high", status: "resolved", assignee: "ROSIE AI", platform: "Lutar", resolved: true },
    { title: "Medium: SSL Certificate Expiring", description: "Aegis Shield platform SSL certificate expiring in 14 days. Auto-renewal scheduled.", severity: "medium", status: "scheduled", assignee: "ROSIE AI", platform: "Aegis", resolved: false },
    { title: "Critical: DDoS Mitigation Active", description: "Active DDoS mitigation on Beacon API. Traffic scrubbing engaged. Service impact: 0%. Attack volume: 2.4Gbps.", severity: "critical", status: "active", assignee: "ROSIE AI", platform: "Beacon", resolved: false },
    { title: "Low: Performance Degradation", description: "Dream Era CDN latency increased by 12ms. Rerouting traffic through secondary edge nodes.", severity: "low", status: "resolved", assignee: "ROSIE AI", platform: "Dream Era", resolved: true },
  ]).onConflictDoNothing();

  await db.insert(rosieScansTable).values([
    { platform: "Beacon", scanType: "Full Vulnerability Scan", status: "completed", threatsFound: 3, threatsBlocked: 3, duration: 847 },
    { platform: "Nimbus", scanType: "AI Model Security Audit", status: "completed", threatsFound: 1, threatsBlocked: 1, duration: 1243 },
    { platform: "Zeus", scanType: "Infrastructure Penetration Test", status: "completed", threatsFound: 5, threatsBlocked: 5, duration: 2100 },
    { platform: "INCA AI", scanType: "ML Pipeline Security Review", status: "completed", threatsFound: 2, threatsBlocked: 2, duration: 960 },
    { platform: "Dream Era", scanType: "Content Security Scan", status: "completed", threatsFound: 1, threatsBlocked: 1, duration: 540 },
    { platform: "Aegis", scanType: "Zero-Trust Architecture Audit", status: "completed", threatsFound: 0, threatsBlocked: 0, duration: 3200 },
    { platform: "Lutar", scanType: "Access Control Review", status: "completed", threatsFound: 1, threatsBlocked: 1, duration: 720 },
    { platform: "All Platforms", scanType: "Global Threat Assessment", status: "running", threatsFound: 0, threatsBlocked: 0, duration: 0 },
  ]).onConflictDoNothing();

  console.log("✅ ROSIE data seeded!");
  process.exit(0);
}

seedRosie().catch(e => { console.error("Seed failed:", e); process.exit(1); });
