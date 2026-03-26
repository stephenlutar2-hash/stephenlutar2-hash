import { db } from "@szl-holdings/db";
import {
  aegisComplianceFrameworksTable,
  aegisVulnerabilitiesTable,
  aegisMitreTechniquesTable,
} from "@szl-holdings/db/schema";

export async function seedAegis() {
  const existingFrameworks = await db.select().from(aegisComplianceFrameworksTable).limit(1);
  if (existingFrameworks.length > 0) {
    console.log("[seed-aegis] Data already seeded, skipping.");
    return;
  }

  console.log("[seed-aegis] Seeding Aegis compliance frameworks...");
  await db.insert(aegisComplianceFrameworksTable).values([
    { name: "ISO 27001", score: 100, controls: 114, passing: 114, color: "#10b981", lastAudit: "2026-02-15", status: "Certified" },
    { name: "SOC 2 Type II", score: 98, controls: 64, passing: 63, color: "#06b6d4", lastAudit: "2026-01-28", status: "Compliant" },
    { name: "NIST CSF", score: 94, controls: 108, passing: 102, color: "#8b5cf6", lastAudit: "2026-03-01", status: "In Progress" },
    { name: "PCI DSS", score: 100, controls: 78, passing: 78, color: "#f59e0b", lastAudit: "2025-12-10", status: "Certified" },
    { name: "HIPAA", score: 95, controls: 54, passing: 51, color: "#ec4899", lastAudit: "2026-02-20", status: "Compliant" },
    { name: "GDPR", score: 97, controls: 42, passing: 41, color: "#3b82f6", lastAudit: "2026-03-10", status: "Compliant" },
  ]);

  console.log("[seed-aegis] Seeding Aegis vulnerabilities...");
  await db.insert(aegisVulnerabilitiesTable).values([
    { vulnId: "V-001", cve: "CVE-2026-1847", title: "Remote Code Execution in API Gateway", cvss: 9.8, severity: "critical", asset: "api-gw-prod-01", status: "patching", discovered: "2026-03-24", exploitable: true },
    { vulnId: "V-002", cve: "CVE-2026-1523", title: "SQL Injection via Parameter Tampering", cvss: 8.6, severity: "high", asset: "db-proxy-02", status: "mitigated", discovered: "2026-03-22", exploitable: true },
    { vulnId: "V-003", cve: "CVE-2026-0984", title: "Privilege Escalation in Auth Service", cvss: 8.1, severity: "high", asset: "auth-svc-01", status: "open", discovered: "2026-03-20", exploitable: false },
    { vulnId: "V-004", cve: "CVE-2026-0756", title: "XSS in Admin Dashboard", cvss: 6.4, severity: "medium", asset: "admin-portal", status: "patched", discovered: "2026-03-18", exploitable: false },
    { vulnId: "V-005", cve: "CVE-2025-9847", title: "Information Disclosure in Headers", cvss: 5.3, severity: "medium", asset: "cdn-edge-03", status: "patched", discovered: "2026-03-15", exploitable: false },
    { vulnId: "V-006", cve: "CVE-2026-2041", title: "Denial of Service in Load Balancer", cvss: 7.5, severity: "high", asset: "lb-prod-01", status: "open", discovered: "2026-03-25", exploitable: true },
    { vulnId: "V-007", cve: "CVE-2025-8934", title: "TLS Downgrade Attack Vector", cvss: 4.8, severity: "medium", asset: "tls-terminator", status: "patched", discovered: "2026-03-10", exploitable: false },
    { vulnId: "V-008", cve: "CVE-2026-1102", title: "Container Escape in K8s Cluster", cvss: 9.1, severity: "critical", asset: "k8s-node-05", status: "patching", discovered: "2026-03-23", exploitable: true },
    { vulnId: "V-009", cve: "CVE-2025-7654", title: "Outdated OpenSSL Version", cvss: 3.7, severity: "low", asset: "legacy-proxy", status: "accepted", discovered: "2026-02-28", exploitable: false },
    { vulnId: "V-010", cve: "CVE-2026-0321", title: "SSRF in Webhook Handler", cvss: 7.2, severity: "high", asset: "webhook-svc", status: "mitigated", discovered: "2026-03-19", exploitable: true },
  ]);

  console.log("[seed-aegis] Seeding Aegis MITRE techniques...");
  const mitreTechniques = [
    { tactic: "Reconnaissance", techniques: [
      { techniqueId: "T1595", name: "Active Scanning", coverage: 92 },
      { techniqueId: "T1592", name: "Gather Host Info", coverage: 78 },
      { techniqueId: "T1589", name: "Gather ID Info", coverage: 85 },
      { techniqueId: "T1590", name: "Gather Network Info", coverage: 88 },
    ]},
    { tactic: "Resource Dev", techniques: [
      { techniqueId: "T1583", name: "Acquire Infra", coverage: 45 },
      { techniqueId: "T1586", name: "Compromise Acct", coverage: 72 },
      { techniqueId: "T1584", name: "Compromise Infra", coverage: 38 },
    ]},
    { tactic: "Initial Access", techniques: [
      { techniqueId: "T1566", name: "Phishing", coverage: 95 },
      { techniqueId: "T1190", name: "Exploit Public App", coverage: 89 },
      { techniqueId: "T1078", name: "Valid Accounts", coverage: 91 },
      { techniqueId: "T1199", name: "Trusted Relationship", coverage: 67 },
    ]},
    { tactic: "Execution", techniques: [
      { techniqueId: "T1059", name: "Command/Script", coverage: 94 },
      { techniqueId: "T1203", name: "Exploit for Exec", coverage: 82 },
      { techniqueId: "T1204", name: "User Execution", coverage: 76 },
    ]},
    { tactic: "Persistence", techniques: [
      { techniqueId: "T1547", name: "Boot Autostart", coverage: 88 },
      { techniqueId: "T1053", name: "Scheduled Task", coverage: 91 },
      { techniqueId: "T1136", name: "Create Account", coverage: 96 },
      { techniqueId: "T1543", name: "System Services", coverage: 84 },
    ]},
    { tactic: "Priv Escalation", techniques: [
      { techniqueId: "T1548", name: "Abuse Elevation", coverage: 87 },
      { techniqueId: "T1134", name: "Token Manipulation", coverage: 73 },
      { techniqueId: "T1068", name: "Exploit for Priv", coverage: 69 },
    ]},
    { tactic: "Defense Evasion", techniques: [
      { techniqueId: "T1070", name: "Indicator Removal", coverage: 81 },
      { techniqueId: "T1036", name: "Masquerading", coverage: 74 },
      { techniqueId: "T1027", name: "Obfuscated Files", coverage: 68 },
      { techniqueId: "T1562", name: "Impair Defenses", coverage: 92 },
    ]},
    { tactic: "Credential Access", techniques: [
      { techniqueId: "T1110", name: "Brute Force", coverage: 97 },
      { techniqueId: "T1003", name: "OS Credential Dump", coverage: 85 },
      { techniqueId: "T1557", name: "Adversary-in-Middle", coverage: 79 },
    ]},
    { tactic: "Discovery", techniques: [
      { techniqueId: "T1087", name: "Account Discovery", coverage: 90 },
      { techniqueId: "T1046", name: "Network Scan", coverage: 93 },
      { techniqueId: "T1057", name: "Process Discovery", coverage: 71 },
    ]},
    { tactic: "Lateral Movement", techniques: [
      { techniqueId: "T1021", name: "Remote Services", coverage: 86 },
      { techniqueId: "T1570", name: "Lateral Tool Transfer", coverage: 62 },
      { techniqueId: "T1080", name: "Taint Shared Content", coverage: 55 },
    ]},
    { tactic: "Collection", techniques: [
      { techniqueId: "T1560", name: "Archive Data", coverage: 77 },
      { techniqueId: "T1005", name: "Data from Local", coverage: 83 },
      { techniqueId: "T1114", name: "Email Collection", coverage: 91 },
    ]},
    { tactic: "C2", techniques: [
      { techniqueId: "T1071", name: "App Layer Protocol", coverage: 88 },
      { techniqueId: "T1573", name: "Encrypted Channel", coverage: 72 },
      { techniqueId: "T1105", name: "Ingress Tool Transfer", coverage: 81 },
    ]},
    { tactic: "Exfiltration", techniques: [
      { techniqueId: "T1041", name: "Exfil Over C2", coverage: 86 },
      { techniqueId: "T1048", name: "Exfil Over Alt Protocol", coverage: 64 },
      { techniqueId: "T1567", name: "Exfil to Cloud", coverage: 58 },
    ]},
    { tactic: "Impact", techniques: [
      { techniqueId: "T1486", name: "Data Encrypted", coverage: 94 },
      { techniqueId: "T1489", name: "Service Stop", coverage: 89 },
      { techniqueId: "T1529", name: "System Shutdown", coverage: 91 },
    ]},
  ];

  const flatTechniques = mitreTechniques.flatMap(t =>
    t.techniques.map(tech => ({ ...tech, tactic: t.tactic }))
  );
  await db.insert(aegisMitreTechniquesTable).values(flatTechniques);

  console.log("[seed-aegis] Aegis seed data complete.");
}
