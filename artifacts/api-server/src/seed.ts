import { db } from "@szl-holdings/db";
import {
  beaconMetricsTable, beaconProjectsTable,
  nimbusPredictionsTable, nimbusAlertsTable,
  zeusModulesTable, zeusLogsTable,
  incaProjectsTable, incaExperimentsTable,
  dreameraContentTable, dreameraCampaignsTable
} from "@szl-holdings/db/schema";

async function seed() {
  console.log("Seeding database...");

  // BEACON METRICS
  await db.insert(beaconMetricsTable).values([
    { name: "Total Revenue", value: "4820000", unit: "$", change: "23.4", category: "Financial" },
    { name: "Active Projects", value: "7", unit: "projects", change: "16.7", category: "Operations" },
    { name: "Empire Growth", value: "340", unit: "%", change: "12.1", category: "Growth" },
    { name: "Team Size", value: "24", unit: "people", change: "33.3", category: "HR" },
    { name: "Monthly Recurring Revenue", value: "182000", unit: "$", change: "8.5", category: "Financial" },
    { name: "Client Satisfaction", value: "97.4", unit: "%", change: "2.1", category: "Quality" },
  ]).onConflictDoNothing();

  // BEACON PROJECTS
  await db.insert(beaconProjectsTable).values([
    { name: "ROSIE", description: "AI-powered security monitoring platform for real-time threat detection", status: "active", progress: 95, platform: "Security" },
    { name: "AEGIS", description: "Enterprise-grade security fortress with zero-trust architecture", status: "active", progress: 88, platform: "Security" },
    { name: "NIMBUS", description: "Predictive AI analytics and forecasting engine", status: "building", progress: 72, platform: "AI" },
    { name: "ZEUS", description: "Modular infrastructure core powering all SZL platforms", status: "building", progress: 65, platform: "Infrastructure" },
    { name: "INCA AI", description: "Advanced AI research and innovation laboratory", status: "planning", progress: 40, platform: "AI" },
    { name: "DREAM ERA", description: "Premium media and content production platform", status: "planning", progress: 30, platform: "Media" },
    { name: "LUTAR", description: "Personal empire management and command center", status: "active", progress: 82, platform: "Management" },
  ]).onConflictDoNothing();

  // NIMBUS PREDICTIONS
  await db.insert(nimbusPredictionsTable).values([
    { title: "Revenue will exceed $10M by Q4 2026", description: "Based on current growth trajectory and pipeline analysis, revenue is projected to surpass $10M", confidence: "87.3", category: "Financial", outcome: "Revenue > $10M", timeframe: "Q4 2026", status: "pending" },
    { title: "AI market dominance in security sector", description: "ROSIE and AEGIS combined will capture 12% market share in the enterprise security AI segment", confidence: "73.5", category: "Market", outcome: "12% market share", timeframe: "2027", status: "pending" },
    { title: "Platform scalability threshold reached", description: "Current infrastructure will require a major scaling event within 8 months as user base triples", confidence: "91.2", category: "Technical", outcome: "Infrastructure upgrade required", timeframe: "8 months", status: "confirmed" },
    { title: "Strategic partnership acquisition", description: "High probability of landing Fortune 500 security partnership through AEGIS positioning", confidence: "64.8", category: "Business", outcome: "F500 partnership", timeframe: "6 months", status: "pending" },
    { title: "Team expansion to 50+ members", description: "Growth velocity indicates team will double within 18 months to support platform expansion", confidence: "78.9", category: "HR", outcome: "50+ team members", timeframe: "18 months", status: "pending" },
  ]).onConflictDoNothing();

  // NIMBUS ALERTS
  await db.insert(nimbusAlertsTable).values([
    { title: "Anomaly Detected: Revenue spike", message: "Unusual revenue spike detected in ROSIE subscriptions. 340% above baseline. Investigate source.", severity: "high", category: "Financial", isRead: false },
    { title: "Model Drift Alert", message: "NIMBUS prediction model showing 4.2% drift from baseline. Retraining recommended.", severity: "medium", category: "Technical", isRead: false },
    { title: "Critical: Infrastructure load at 87%", message: "ZEUS core infrastructure approaching capacity threshold. Scale-up event recommended within 72 hours.", severity: "critical", category: "Infrastructure", isRead: false },
    { title: "Opportunity: New market entrant", message: "Competing security AI startup entered market. Analyze positioning and update AEGIS roadmap.", severity: "low", category: "Market", isRead: true },
    { title: "Prediction Confirmed: Security spending up", message: "Q2 enterprise security budget increases confirmed across 94% of monitored enterprises.", severity: "low", category: "Market", isRead: true },
  ]).onConflictDoNothing();

  // ZEUS MODULES
  await db.insert(zeusModulesTable).values([
    { name: "Auth Gateway", description: "Centralized authentication and authorization for all SZL platforms", version: "3.2.1", status: "active", category: "Security", uptime: "99.98" },
    { name: "Data Pipeline", description: "Real-time data ingestion and transformation engine", version: "2.8.0", status: "active", category: "Data", uptime: "99.95" },
    { name: "API Orchestrator", description: "Unified API gateway with rate limiting and load balancing", version: "4.1.2", status: "active", category: "Infrastructure", uptime: "99.99" },
    { name: "ML Runtime", description: "Machine learning model serving and inference engine", version: "1.9.4", status: "updating", category: "AI", uptime: "98.72" },
    { name: "Event Bus", description: "Distributed event streaming and message queue system", version: "2.3.0", status: "active", category: "Infrastructure", uptime: "99.97" },
    { name: "Cache Layer", description: "Distributed caching with Redis cluster for high-performance data access", version: "3.0.1", status: "active", category: "Performance", uptime: "99.89" },
    { name: "Monitoring Core", description: "System-wide observability, metrics collection, and alerting", version: "2.1.5", status: "active", category: "Operations", uptime: "100.0" },
    { name: "Storage Engine", description: "Distributed object storage and file management system", version: "1.7.2", status: "error", category: "Storage", uptime: "94.31" },
  ]).onConflictDoNothing();

  // ZEUS LOGS
  await db.insert(zeusLogsTable).values([
    { level: "info", message: "Auth Gateway successfully rotated SSL certificates", module: "Auth Gateway" },
    { level: "warn", message: "Data Pipeline processing latency above SLA threshold (142ms > 100ms target)", module: "Data Pipeline" },
    { level: "error", message: "Storage Engine replica sync failure on node szl-stor-03. Attempting recovery.", module: "Storage Engine" },
    { level: "info", message: "ML Runtime model v2.1 deployed successfully to production cluster", module: "ML Runtime" },
    { level: "info", message: "API Orchestrator rate limit threshold increased to 50k req/min", module: "API Orchestrator" },
    { level: "debug", message: "Cache Layer eviction policy triggered - freed 2.4GB across cluster", module: "Cache Layer" },
    { level: "warn", message: "Event Bus consumer lag detected on topic szl-security-events (offset: 2847)", module: "Event Bus" },
    { level: "info", message: "Monitoring Core: All health checks passed. 47/47 services nominal.", module: "Monitoring Core" },
  ]).onConflictDoNothing();

  // INCA PROJECTS
  await db.insert(incaProjectsTable).values([
    { name: "ThreatMind-7", description: "Advanced neural network for zero-day threat prediction and autonomous countermeasures", status: "development", aiModel: "Custom Transformer v3", accuracy: "94.2" },
    { name: "BehaviorNet", description: "Behavioral analysis AI that identifies insider threats and anomalous user patterns", status: "testing", aiModel: "LSTM + GRU Hybrid", accuracy: "89.7" },
    { name: "MarketProphet", description: "Financial market prediction engine trained on alternative data sources and sentiment analysis", status: "research", aiModel: "GPT-4 Fine-tuned", accuracy: "72.3" },
    { name: "ContentForge", description: "AI content generation engine for Dream Era media platform with brand voice preservation", status: "development", aiModel: "Custom LLM v1", accuracy: "87.5" },
    { name: "QuantumShield", description: "Post-quantum cryptography implementation research for future-proof security systems", status: "research", aiModel: "Classical + Quantum Hybrid", accuracy: "61.8" },
  ]).onConflictDoNothing();

  // INCA EXPERIMENTS
  await db.insert(incaExperimentsTable).values([
    { projectId: 1, name: "Zero-Day Pattern Recognition v4", hypothesis: "Increasing training data diversity will improve zero-day detection rate by 15%", result: "Detection rate improved by 18.3% across 94 novel threat vectors", status: "completed", accuracy: "96.1" },
    { projectId: 1, name: "Adversarial Attack Resistance", hypothesis: "Adversarial training will reduce model manipulation success rate to below 5%", result: "Currently running - 3 days remaining", status: "running", accuracy: "91.4" },
    { projectId: 2, name: "Temporal Behavior Baseline", hypothesis: "7-day rolling baseline outperforms 30-day baseline for insider threat detection", result: "7-day baseline reduced false positives by 34% with 2.1% accuracy improvement", status: "completed", accuracy: "91.2" },
    { projectId: 3, name: "Alternative Data Signal Testing", hypothesis: "Social media sentiment combined with options flow predicts market moves 72hrs ahead", result: "Experiment failed - insufficient signal-to-noise ratio. Redesigning data pipeline.", status: "failed", accuracy: "48.3" },
    { projectId: 4, name: "Brand Voice Fine-tuning Round 3", hypothesis: "LoRA fine-tuning on brand content corpus achieves 90%+ brand voice consistency", result: "Achieved 88.7% consistency. Second round of fine-tuning initiated.", status: "completed", accuracy: "88.7" },
  ]).onConflictDoNothing();

  // DREAM ERA CONTENT
  await db.insert(dreameraContentTable).values([
    { title: "The Empire Builder's Manifesto", body: "A deep dive into building a technology empire from the ground up — lessons from SZL Holdings", type: "article", status: "published", views: 24800, engagement: "8.7" },
    { title: "Inside the AI Security Revolution", body: "How ROSIE and AEGIS are redefining enterprise security in the age of AI", type: "video", status: "published", views: 187400, engagement: "12.3" },
    { title: "Building in Silence: The SZL Story", body: "The story behind SZL Holdings and why moving in silence is the ultimate power move", type: "podcast", status: "published", views: 43200, engagement: "15.6" },
    { title: "INCA AI: The Innovation Engine", body: "A first look at INCA AI's research pipeline and what it means for the future of machine intelligence", type: "article", status: "review", views: 0, engagement: "0" },
    { title: "Empire OS: Life Inside LUTAR", body: "How SZL Holdings uses LUTAR as the personal command center for managing a multi-platform empire", type: "social", status: "draft", views: 0, engagement: "0" },
    { title: "Q1 2026 Empire Report", body: "SZL Holdings Q1 performance review: 340% growth, 7 active platforms, and what comes next", type: "campaign", status: "published", views: 9700, engagement: "21.4" },
  ]).onConflictDoNothing();

  // DREAM ERA CAMPAIGNS
  await db.insert(dreameraCampaignsTable).values([
    { name: "Empire Launch 2026", description: "Full-scale brand launch campaign for SZL Holdings across all digital channels", status: "active", budget: "250000", reach: 2800000, startDate: "2026-01-01", endDate: "2026-06-30" },
    { name: "ROSIE Security Awareness", description: "Thought leadership campaign positioning ROSIE as the definitive AI security platform", status: "active", budget: "85000", reach: 940000, startDate: "2026-02-01", endDate: "2026-05-31" },
    { name: "AI Revolution Content Series", description: "12-part content series on the AI security revolution featuring SZL research", status: "planning", budget: "45000", reach: 500000, startDate: "2026-04-01", endDate: "2026-09-30" },
    { name: "Empire Builder Podcast Tour", description: "Guest appearances and sponsored placements on top 50 tech and business podcasts", status: "completed", budget: "32000", reach: 1200000, startDate: "2025-10-01", endDate: "2025-12-31" },
  ]).onConflictDoNothing();

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch(e => {
  console.error("Seed failed:", e);
  process.exit(1);
});
