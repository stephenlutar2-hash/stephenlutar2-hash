import { db } from "@szl-holdings/db";
import {
  beaconMetricsTable, beaconProjectsTable,
  nimbusPredictionsTable, nimbusAlertsTable,
  zeusModulesTable, zeusLogsTable,
  incaProjectsTable, incaExperimentsTable,
  dreameraContentTable, dreameraCampaignsTable,
  alloyscapeModulesTable, alloyscapeWorkflowsTable, alloyscapeExecutionLogsTable,
  alloyscapeConnectorsTable, alloyscapeServicesTable,
  dreamscapeWorldsTable, dreamscapeProjectsTable, dreamscapeArtifactsTable,
  dreamscapeGenerationHistoryTable, dreamscapePipelineItemsTable,
  lutarResearchItemsTable, lutarSustainabilityMetricsTable,
  lutarFinancialDataTable, lutarDivisionDataTable, lutarInsightsTable,
} from "@szl-holdings/db/schema";
import { seedAegis } from "./seed-aegis";

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

  await seedAegis();

  // ALLOYSCAPE MODULES
  await db.insert(alloyscapeModulesTable).values([
    { moduleId: "mod-001", name: "ROSIE", description: "Security Intelligence & Threat Analysis Engine", version: "4.2.1", status: "running", uptime: "99.97%", lastHealthCheck: "12s ago", cpu: 34, memory: 62, instances: 3 },
    { moduleId: "mod-002", name: "Beacon", description: "Strategic KPI & Project Management Platform", version: "3.8.0", status: "running", uptime: "99.95%", lastHealthCheck: "8s ago", cpu: 22, memory: 48, instances: 2 },
    { moduleId: "mod-003", name: "Nimbus", description: "AI Predictive Analytics & Forecasting", version: "2.5.3", status: "running", uptime: "99.92%", lastHealthCheck: "15s ago", cpu: 67, memory: 78, instances: 4 },
    { moduleId: "mod-004", name: "Aegis", description: "Identity & Access Management Gateway", version: "5.1.0", status: "running", uptime: "99.99%", lastHealthCheck: "3s ago", cpu: 18, memory: 35, instances: 2 },
    { moduleId: "mod-005", name: "Firestorm", description: "Competitive Intelligence & Market Analysis", version: "1.9.7", status: "degraded", uptime: "98.45%", lastHealthCheck: "45s ago", cpu: 89, memory: 91, instances: 2 },
    { moduleId: "mod-006", name: "DreamEra", description: "AI Content Generation & Storytelling", version: "2.1.4", status: "running", uptime: "99.88%", lastHealthCheck: "20s ago", cpu: 45, memory: 56, instances: 2 },
    { moduleId: "mod-007", name: "Lutar", description: "Financial Operations & Payment Processing", version: "3.3.2", status: "running", uptime: "99.99%", lastHealthCheck: "5s ago", cpu: 28, memory: 42, instances: 3 },
    { moduleId: "mod-008", name: "Zeus", description: "Infrastructure Monitoring & Observability", version: "2.0.8", status: "maintenance", uptime: "97.20%", lastHealthCheck: "2m ago", cpu: 0, memory: 0, instances: 0 },
    { moduleId: "mod-009", name: "Alloy Core", description: "Neural AI Engine & Orchestration Runtime", version: "1.4.0", status: "running", uptime: "99.94%", lastHealthCheck: "7s ago", cpu: 52, memory: 68, instances: 5 },
  ]).onConflictDoNothing();

  // ALLOYSCAPE WORKFLOWS
  await db.insert(alloyscapeWorkflowsTable).values([
    { workflowId: "wf-001", name: "Daily Threat Assessment", status: "running", pipeline: "Security Pipeline", startedAt: "2026-03-25T08:00:00Z", duration: "12m 34s", progress: 78, triggeredBy: "scheduler" },
    { workflowId: "wf-002", name: "KPI Data Aggregation", status: "completed", pipeline: "Analytics Pipeline", startedAt: "2026-03-25T07:30:00Z", duration: "8m 12s", progress: 100, triggeredBy: "scheduler" },
    { workflowId: "wf-003", name: "Model Retraining — Nimbus v3", status: "running", pipeline: "ML Pipeline", startedAt: "2026-03-25T06:00:00Z", duration: "2h 15m", progress: 45, triggeredBy: "admin" },
    { workflowId: "wf-004", name: "Market Data Sync", status: "queued", pipeline: "Data Pipeline", startedAt: "", duration: "—", progress: 0, triggeredBy: "api" },
    { workflowId: "wf-005", name: "User Session Cleanup", status: "completed", pipeline: "Maintenance Pipeline", startedAt: "2026-03-25T05:00:00Z", duration: "3m 48s", progress: 100, triggeredBy: "scheduler" },
    { workflowId: "wf-006", name: "Content Generation Batch", status: "failed", pipeline: "Content Pipeline", startedAt: "2026-03-25T07:45:00Z", duration: "5m 22s", progress: 62, triggeredBy: "api" },
    { workflowId: "wf-007", name: "Financial Reconciliation", status: "running", pipeline: "Finance Pipeline", startedAt: "2026-03-25T08:15:00Z", duration: "4m 10s", progress: 33, triggeredBy: "scheduler" },
    { workflowId: "wf-008", name: "Infrastructure Health Scan", status: "paused", pipeline: "DevOps Pipeline", startedAt: "2026-03-25T07:00:00Z", duration: "15m 00s", progress: 50, triggeredBy: "system" },
  ]).onConflictDoNothing();

  // ALLOYSCAPE EXECUTION LOGS
  await db.insert(alloyscapeExecutionLogsTable).values([
    { logId: "log-001", timestamp: "2026-03-25T08:32:15.234Z", level: "info", service: "alloy-core", message: "Orchestration cycle completed — 8 workflows processed, 0 failures", traceId: "abc-123" },
    { logId: "log-002", timestamp: "2026-03-25T08:31:58.102Z", level: "warn", service: "firestorm", message: "High CPU utilization detected (89%) — scaling up instances", traceId: "def-456" },
    { logId: "log-003", timestamp: "2026-03-25T08:31:45.891Z", level: "error", service: "dreamera", message: "Content generation failed: Rate limit exceeded for GPT-4 endpoint", traceId: "ghi-789" },
    { logId: "log-004", timestamp: "2026-03-25T08:31:30.445Z", level: "info", service: "rosie", message: "Threat scan completed — 0 critical, 2 medium, 5 low severity findings", traceId: "jkl-012" },
    { logId: "log-005", timestamp: "2026-03-25T08:31:12.667Z", level: "debug", service: "beacon", message: "KPI cache refreshed — 24 metrics updated across 6 projects" },
    { logId: "log-006", timestamp: "2026-03-25T08:30:58.123Z", level: "info", service: "aegis", message: "Authentication token rotated for service account [nimbus-ml-worker]", traceId: "mno-345" },
    { logId: "log-007", timestamp: "2026-03-25T08:30:45.890Z", level: "warn", service: "zeus", message: "Maintenance window active — health check endpoints returning 503" },
    { logId: "log-008", timestamp: "2026-03-25T08:30:30.112Z", level: "info", service: "nimbus", message: "Prediction batch v3.2 completed — 1,247 forecasts generated (avg confidence: 87.3%)", traceId: "pqr-678" },
    { logId: "log-009", timestamp: "2026-03-25T08:30:15.334Z", level: "error", service: "alloy-core", message: "Workflow [wf-006] failed at step 4/7: Content generation service unavailable", traceId: "stu-901" },
    { logId: "log-010", timestamp: "2026-03-25T08:30:00.556Z", level: "info", service: "lutar", message: "Daily reconciliation completed — 342 transactions verified, $1.2M processed" },
    { logId: "log-011", timestamp: "2026-03-25T08:29:45.778Z", level: "debug", service: "alloy-core", message: "Queue depth: security=2, analytics=5, ml=1, data=3, content=0" },
    { logId: "log-012", timestamp: "2026-03-25T08:29:30.991Z", level: "info", service: "rosie", message: "Anomaly detection model updated — new baseline established from 72h window" },
  ]).onConflictDoNothing();

  // ALLOYSCAPE CONNECTORS
  await db.insert(alloyscapeConnectorsTable).values([
    { connectorId: "conn-001", name: "ROSIE → Alloy Events", type: "Event Stream", source: "ROSIE", target: "Alloy Core", status: "active", lastSync: "12s ago", eventsProcessed: 48291 },
    { connectorId: "conn-002", name: "Beacon → Data Lake", type: "ETL", source: "Beacon", target: "PostgreSQL", status: "active", lastSync: "5m ago", eventsProcessed: 12045 },
    { connectorId: "conn-003", name: "Nimbus Model Registry", type: "API Bridge", source: "Nimbus", target: "Alloy Core", status: "active", lastSync: "2m ago", eventsProcessed: 8934 },
    { connectorId: "conn-004", name: "Aegis SSO Federation", type: "SAML/OIDC", source: "Aegis", target: "All Services", status: "active", lastSync: "30s ago", eventsProcessed: 156782 },
    { connectorId: "conn-005", name: "Firestorm Market Feed", type: "WebSocket", source: "External APIs", target: "Firestorm", status: "error", lastSync: "45m ago", eventsProcessed: 2341 },
    { connectorId: "conn-006", name: "DreamEra Content Bus", type: "Message Queue", source: "DreamEra", target: "Alloy Core", status: "active", lastSync: "1m ago", eventsProcessed: 5621 },
    { connectorId: "conn-007", name: "Lutar Payment Webhook", type: "Webhook", source: "Stripe", target: "Lutar", status: "active", lastSync: "3m ago", eventsProcessed: 89234 },
    { connectorId: "conn-008", name: "Zeus Telemetry", type: "Metrics Stream", source: "All Services", target: "Zeus", status: "inactive", lastSync: "2h ago", eventsProcessed: 234891 },
  ]).onConflictDoNothing();

  // ALLOYSCAPE SERVICES
  await db.insert(alloyscapeServicesTable).values([
    { serviceId: "svc-001", name: "ROSIE API", type: "REST API", status: "healthy", responseTime: 45, uptime: "99.97", lastIncident: "14 days ago", endpoint: "/api/rosie" },
    { serviceId: "svc-002", name: "Beacon Dashboard", type: "Web App", status: "healthy", responseTime: 120, uptime: "99.95", lastIncident: "7 days ago", endpoint: "/beacon" },
    { serviceId: "svc-003", name: "Nimbus ML Engine", type: "gRPC Service", status: "warning", responseTime: 890, uptime: "99.92", lastIncident: "2 hours ago", endpoint: "grpc://nimbus:50051" },
    { serviceId: "svc-004", name: "Aegis Auth Gateway", type: "Auth Service", status: "healthy", responseTime: 12, uptime: "99.99", lastIncident: "30 days ago", endpoint: "/api/auth" },
    { serviceId: "svc-005", name: "Firestorm Intel", type: "REST API", status: "critical", responseTime: 2400, uptime: "98.45", lastIncident: "45 minutes ago", endpoint: "/api/firestorm" },
    { serviceId: "svc-006", name: "DreamEra Engine", type: "REST API", status: "healthy", responseTime: 340, uptime: "99.88", lastIncident: "3 days ago", endpoint: "/api/dreamera" },
    { serviceId: "svc-007", name: "Lutar Payments", type: "REST API", status: "healthy", responseTime: 28, uptime: "99.99", lastIncident: "60 days ago", endpoint: "/api/lutar" },
    { serviceId: "svc-008", name: "Zeus Monitor", type: "Agent", status: "critical", responseTime: 0, uptime: "97.20", lastIncident: "Active", endpoint: "/api/zeus" },
    { serviceId: "svc-009", name: "PostgreSQL Primary", type: "Database", status: "healthy", responseTime: 5, uptime: "99.99", lastIncident: "90 days ago", endpoint: "pg://primary:5432" },
    { serviceId: "svc-010", name: "Redis Cache", type: "Cache", status: "healthy", responseTime: 2, uptime: "99.98", lastIncident: "21 days ago", endpoint: "redis://cache:6379" },
    { serviceId: "svc-011", name: "Alloy Orchestrator", type: "Core Engine", status: "healthy", responseTime: 18, uptime: "99.94", lastIncident: "5 days ago", endpoint: "/api/alloy" },
    { serviceId: "svc-012", name: "Blob Storage", type: "Object Store", status: "healthy", responseTime: 65, uptime: "99.96", lastIncident: "45 days ago", endpoint: "https://storage.szl.io" },
  ]).onConflictDoNothing();

  // DREAMSCAPE WORLDS
  await db.insert(dreamscapeWorldsTable).values([
    { worldId: "w1", name: "Celestial Forge", description: "A cosmic smithy where stars are hammered into existence. Swirling nebulae of molten gold and sapphire surround ancient forges that shape reality itself.", thumbnail: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=400&fit=crop", color: "from-cyan-500 to-blue-600", projectCount: 4, artifactCount: 28, tags: JSON.stringify(["cosmic", "creation", "fantasy"]) },
    { worldId: "w2", name: "Neon Abyss", description: "A sunken cyberpunk metropolis beneath miles of dark ocean, where bioluminescent creatures swim through flooded server rooms.", thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop", color: "from-violet-500 to-purple-600", projectCount: 3, artifactCount: 19, tags: JSON.stringify(["cyberpunk", "underwater", "sci-fi"]) },
    { worldId: "w3", name: "Verdant Mechanism", description: "An overgrown clockwork garden where botanical and mechanical life have fused into a self-perpetuating ecosystem.", thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=400&fit=crop", color: "from-emerald-500 to-teal-600", projectCount: 2, artifactCount: 14, tags: JSON.stringify(["steampunk", "nature", "mechanical"]) },
    { worldId: "w4", name: "Ember Sanctum", description: "A volcanic cathedral carved from obsidian and fire. Ancient rituals of light and shadow play across its crystalline walls.", thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop", color: "from-amber-500 to-orange-600", projectCount: 3, artifactCount: 22, tags: JSON.stringify(["volcanic", "sacred", "dark-fantasy"]) },
    { worldId: "w5", name: "Prism Drift", description: "Floating crystal islands refract light into impossible spectrums, creating rainbow storms and prismatic auroras.", thumbnail: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&h=400&fit=crop", color: "from-rose-500 to-pink-600", projectCount: 2, artifactCount: 11, tags: JSON.stringify(["crystal", "ethereal", "surreal"]) },
    { worldId: "w6", name: "Void Archive", description: "An infinite library suspended in the spaces between dimensions, where every book contains a universe.", thumbnail: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=600&h=400&fit=crop", color: "from-indigo-500 to-blue-700", projectCount: 3, artifactCount: 17, tags: JSON.stringify(["cosmic", "knowledge", "dimensional"]) },
  ]).onConflictDoNothing();

  // DREAMSCAPE PROJECTS
  await db.insert(dreamscapeProjectsTable).values([
    { projectId: "p1", worldId: "w1", name: "Stellar Anvil Series", description: "Forging new constellations from raw cosmic material", status: "active", artifactCount: 12 },
    { projectId: "p2", worldId: "w1", name: "Nebula Portraits", description: "Character studies of the cosmic blacksmiths", status: "active", artifactCount: 8 },
    { projectId: "p3", worldId: "w1", name: "Forge Blueprints", description: "Technical drawings of celestial forging apparatus", status: "draft", artifactCount: 5 },
    { projectId: "p4", worldId: "w1", name: "Star Birth Sequences", description: "Animated sequences of stellar creation events", status: "active", artifactCount: 3 },
    { projectId: "p5", worldId: "w2", name: "Deep Circuit Exploration", description: "Mapping the submerged server farms of the old world", status: "active", artifactCount: 9 },
    { projectId: "p6", worldId: "w2", name: "Biolume Creatures", description: "A bestiary of the bioluminescent fauna", status: "active", artifactCount: 6 },
    { projectId: "p7", worldId: "w2", name: "Pressure Zone Anthems", description: "Soundscapes from the deepest pressure levels", status: "archived", artifactCount: 4 },
    { projectId: "p8", worldId: "w3", name: "Gear Bloom Catalog", description: "Documenting hybrid botanical-mechanical species", status: "active", artifactCount: 10 },
    { projectId: "p9", worldId: "w3", name: "Clockwork Seasons", description: "Time-lapse studies of the mechanism's seasonal cycles", status: "draft", artifactCount: 4 },
    { projectId: "p10", worldId: "w4", name: "Obsidian Rituals", description: "Capturing the fire ceremonies of the Ember Sanctum", status: "active", artifactCount: 11 },
    { projectId: "p11", worldId: "w4", name: "Crystal Resonance", description: "Sonic exploration of the sanctum's singing walls", status: "active", artifactCount: 7 },
    { projectId: "p12", worldId: "w4", name: "Shadow Calligraphy", description: "Light-and-shadow patterns traced by ancient fire dances", status: "draft", artifactCount: 4 },
    { projectId: "p13", worldId: "w5", name: "Spectrum Storms", description: "Capturing the rainbow tempests between crystal islands", status: "active", artifactCount: 7 },
    { projectId: "p14", worldId: "w5", name: "Prism Architecture", description: "Building designs inspired by natural refraction", status: "draft", artifactCount: 4 },
    { projectId: "p15", worldId: "w6", name: "Infinite Stacks", description: "Visual explorations of the endless bookshelves", status: "active", artifactCount: 8 },
    { projectId: "p16", worldId: "w6", name: "Dimensional Portals", description: "Gateway illustrations between library sections", status: "active", artifactCount: 5 },
    { projectId: "p17", worldId: "w6", name: "Lost Manuscripts", description: "Recreating pages from books that never existed", status: "active", artifactCount: 4 },
  ]).onConflictDoNothing();

  // DREAMSCAPE ARTIFACTS
  await db.insert(dreamscapeArtifactsTable).values([
    { artifactId: "a1", projectId: "p1", worldId: "w1", title: "The First Anvil", description: "The primordial forge where the first star was shaped", type: "image", thumbnail: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=400&fit=crop", prompt: "A cosmic anvil floating in deep space, surrounded by swirling nebula gases in gold and sapphire", tags: JSON.stringify(["hero", "cosmic"]), resolution: "2048x2048", likes: 142 },
    { artifactId: "a2", projectId: "p1", worldId: "w1", title: "Molten Constellation", description: "A newly forged constellation cooling in the void", type: "image", thumbnail: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop", prompt: "A constellation being formed from molten starlight, dripping with golden fire", tags: JSON.stringify(["stars", "creation"]), resolution: "1920x1080", likes: 98 },
    { artifactId: "a3", projectId: "p2", worldId: "w1", title: "The Star Smith", description: "Portrait of the master cosmic blacksmith", type: "image", thumbnail: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&h=400&fit=crop", prompt: "Portrait of a celestial being made of starlight, wielding a cosmic hammer", tags: JSON.stringify(["character", "portrait"]), resolution: "1024x1024", likes: 231 },
    { artifactId: "a4", projectId: "p5", worldId: "w2", title: "Sunken Server Hall", description: "Bioluminescent jellyfish illuminate drowned data centers", type: "image", thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop", prompt: "Underwater data center with glowing jellyfish swimming between server racks", tags: JSON.stringify(["environment", "cyberpunk"]), resolution: "2560x1440", likes: 187 },
    { artifactId: "a5", projectId: "p5", worldId: "w2", title: "Circuit Reef", description: "Where silicon meets coral in a symbiotic dance", type: "image", thumbnail: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&h=400&fit=crop", prompt: "A coral reef made of circuit boards and fiber optic cables, bioluminescent", tags: JSON.stringify(["hybrid", "underwater"]), resolution: "1920x1080", likes: 156 },
    { artifactId: "a6", projectId: "p6", worldId: "w2", title: "Abyssal Data Leviathan", description: "A massive creature that feeds on corrupted data streams", type: "image", thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=400&fit=crop", prompt: "A gigantic bioluminescent sea creature with circuit-pattern skin, swimming through data streams", tags: JSON.stringify(["creature", "monster"]), resolution: "2048x2048", likes: 312 },
    { artifactId: "a7", projectId: "p8", worldId: "w3", title: "Gear Blossom", description: "A flower that blooms with the precision of clockwork", type: "image", thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=400&fit=crop", prompt: "A mechanical flower with brass petals and emerald crystalline centers, steampunk botanical", tags: JSON.stringify(["botanical", "steampunk"]), resolution: "1024x1024", likes: 204 },
    { artifactId: "a8", projectId: "p8", worldId: "w3", title: "Root Network", description: "Underground root systems made of copper tubing and gears", type: "image", thumbnail: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&h=400&fit=crop", prompt: "Cross-section view of underground root system made of copper pipes and tiny gears", tags: JSON.stringify(["mechanical", "nature"]), resolution: "1920x1080", likes: 89 },
    { artifactId: "a9", projectId: "p10", worldId: "w4", title: "Obsidian Cathedral", description: "The grand entrance to the Ember Sanctum", type: "image", thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop", prompt: "A massive cathedral carved from obsidian, with rivers of lava flowing through its walls", tags: JSON.stringify(["architecture", "volcanic"]), resolution: "2560x1440", likes: 267 },
    { artifactId: "a10", projectId: "p10", worldId: "w4", title: "Fire Dance Ritual", description: "Ancient beings perform the ceremony of eternal flame", type: "image", thumbnail: "https://images.unsplash.com/photo-1475274047050-1d0c55b7e72a?w=600&h=400&fit=crop", prompt: "Ethereal fire spirits performing a ceremonial dance around an obsidian altar", tags: JSON.stringify(["ritual", "fire"]), resolution: "2048x2048", likes: 178 },
    { artifactId: "a11", projectId: "p13", worldId: "w5", title: "Rainbow Storm", description: "A chromatic tempest tears through the crystal islands", type: "image", thumbnail: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&h=400&fit=crop", prompt: "A violent storm made of pure rainbow light crashing against floating crystal islands", tags: JSON.stringify(["storm", "prismatic"]), resolution: "2560x1440", likes: 145 },
    { artifactId: "a12", projectId: "p15", worldId: "w6", title: "The Infinite Shelf", description: "Looking down an endless corridor of dimensional bookshelves", type: "image", thumbnail: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=600&h=400&fit=crop", prompt: "An infinitely long library corridor stretching into a vanishing point, with glowing portals between shelves", tags: JSON.stringify(["library", "infinite"]), resolution: "1920x1080", likes: 198 },
  ]).onConflictDoNothing();

  // DREAMSCAPE GENERATION HISTORY
  await db.insert(dreamscapeGenerationHistoryTable).values([
    { genId: "g1", prompt: "A cosmic anvil floating in deep space, surrounded by swirling nebula gases", type: "image", status: "completed", result: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=400&fit=crop", artifactId: "a1", worldName: "Celestial Forge", projectName: "Stellar Anvil Series", duration: 12 },
    { genId: "g2", prompt: "A constellation being formed from molten starlight, dripping with golden fire", type: "image", status: "completed", result: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop", artifactId: "a2", worldName: "Celestial Forge", projectName: "Stellar Anvil Series", duration: 18 },
    { genId: "g3", prompt: "Underwater data center with glowing jellyfish swimming between server racks", type: "image", status: "completed", result: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop", artifactId: "a4", worldName: "Neon Abyss", projectName: "Deep Circuit Exploration", duration: 15 },
    { genId: "g4", prompt: "A massive cathedral carved from obsidian with rivers of lava flowing through its walls", type: "image", status: "completed", result: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop", artifactId: "a9", worldName: "Ember Sanctum", projectName: "Obsidian Rituals", duration: 22 },
    { genId: "g5", prompt: "A mechanical forest with trees made of brass gears and emerald crystal leaves", type: "image", status: "completed", result: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=400&fit=crop", worldName: "Verdant Mechanism", projectName: "Gear Bloom Catalog", duration: 14 },
    { genId: "g6", prompt: "An infinitely long library corridor stretching into a vanishing point", type: "image", status: "completed", result: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=600&h=400&fit=crop", artifactId: "a12", worldName: "Void Archive", projectName: "Infinite Stacks", duration: 16 },
    { genId: "g7", prompt: "Crystal islands floating in a sea of rainbow light with prismatic auroras", type: "image", status: "completed", result: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&h=400&fit=crop", artifactId: "a11", worldName: "Prism Drift", projectName: "Spectrum Storms", duration: 20 },
    { genId: "g8", prompt: "A sentient nebula cloud forming into the shape of a cosmic dragon", type: "image", status: "processing", worldName: "Celestial Forge", projectName: "Star Birth Sequences" },
    { genId: "g9", prompt: "Deep ocean trench with bioluminescent circuit patterns on the walls", type: "image", status: "failed", worldName: "Neon Abyss", projectName: "Deep Circuit Exploration" },
    { genId: "g10", prompt: "A clockwork butterfly emerging from a brass chrysalis surrounded by gear-flowers", type: "image", status: "completed", result: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&h=400&fit=crop", worldName: "Verdant Mechanism", projectName: "Gear Bloom Catalog", duration: 11 },
  ]).onConflictDoNothing();

  // DREAMSCAPE PIPELINE ITEMS
  await db.insert(dreamscapePipelineItemsTable).values([
    { name: "Crystal Caverns — Environmental Set", type: "Environment", stage: "published", description: "Underground crystal cave system with bioluminescent flora. Used for Chapter 7 of 'Beneath the Copper Sky' world.", prompts: 12, variations: 48, selectedFinal: 3, quality: 94, timeToComplete: "2h 14m", tags: JSON.stringify(["fantasy", "underground", "bioluminescent"]) },
    { name: "Dr. Chen Portrait Series", type: "Character", stage: "review", description: "Character portrait series for Dr. Sarah Chen from 'The Last Algorithm'. Multiple expressions and lighting conditions.", prompts: 8, variations: 32, selectedFinal: 2, quality: 89, timeToComplete: "1h 45m", tags: JSON.stringify(["sci-fi", "portrait", "character-design"]) },
    { name: "Floating Market — Concept Art", type: "Environment", stage: "refinement", description: "Aerial marketplace on suspended copper platforms. Key location for Act 2 of 'Beneath the Copper Sky'.", prompts: 15, variations: 60, selectedFinal: 0, quality: 86, timeToComplete: "3h 20m (in progress)", tags: JSON.stringify(["fantasy", "architecture", "aerial"]) },
    { name: "ARIA Interface — UI Mockups", type: "UI/UX", stage: "generation", description: "Holographic user interface design for the ARIA artificial intelligence system. Sci-fi HUD aesthetic.", prompts: 6, variations: 24, selectedFinal: 0, quality: 0, timeToComplete: "In progress", tags: JSON.stringify(["sci-fi", "interface", "holographic"]) },
    { name: "Storm Sequence — Storyboard", type: "Storyboard", stage: "concept", description: "Storyboard frames for the climactic storm sequence in Chapter 12. Dynamic action panels.", prompts: 3, variations: 0, selectedFinal: 0, quality: 0, timeToComplete: "Not started", tags: JSON.stringify(["action", "weather", "climax"]) },
  ]).onConflictDoNothing();

  // LUTAR RESEARCH ITEMS
  await db.insert(lutarResearchItemsTable).values([
    { entity: "Vessels Maritime", revenue: "$4.8M", margin: "78%", growth: "+42%", risk: "Low", valuation: "$48M", status: "Star" },
    { entity: "Beacon Analytics", revenue: "$2.9M", margin: "84%", growth: "+28%", risk: "Low", valuation: "$32M", status: "Cash Cow" },
    { entity: "INCA Intelligence", revenue: "$2.1M", margin: "72%", growth: "+56%", risk: "Medium", valuation: "$28M", status: "Rising Star" },
    { entity: "Rosie Security", revenue: "$1.8M", margin: "81%", growth: "+31%", risk: "Low", valuation: "$22M", status: "Performer" },
    { entity: "AlloyScape AI", revenue: "$1.4M", margin: "68%", growth: "+67%", risk: "Medium", valuation: "$24M", status: "Rising Star" },
    { entity: "Nimbus Weather", revenue: "$1.2M", margin: "76%", growth: "+23%", risk: "Low", valuation: "$14M", status: "Maturing" },
  ]).onConflictDoNothing();

  // LUTAR FINANCIAL DATA
  await db.insert(lutarFinancialDataTable).values([
    { month: "Jan", revenue: "2.1", expenses: "1.4", profit: "0.7", category: "monthly" },
    { month: "Feb", revenue: "2.8", expenses: "1.6", profit: "1.2", category: "monthly" },
    { month: "Mar", revenue: "3.2", expenses: "1.8", profit: "1.4", category: "monthly" },
    { month: "Apr", revenue: "4.5", expenses: "2.1", profit: "2.4", category: "monthly" },
    { month: "May", revenue: "5.1", expenses: "2.3", profit: "2.8", category: "monthly" },
    { month: "Jun", revenue: "6.8", expenses: "2.8", profit: "4.0", category: "monthly" },
    { month: "Jul", revenue: "7.2", expenses: "3.0", profit: "4.2", category: "monthly" },
    { month: "Aug", revenue: "8.5", expenses: "3.2", profit: "5.3", category: "monthly" },
    { month: "Sep", revenue: "10.1", expenses: "3.5", profit: "6.6", category: "monthly" },
    { month: "Oct", revenue: "12.4", expenses: "3.8", profit: "8.6", category: "monthly" },
    { month: "Nov", revenue: "15.2", expenses: "4.1", profit: "11.1", category: "monthly" },
    { month: "Dec", revenue: "18.5", expenses: "4.5", profit: "14.0", category: "monthly" },
  ]).onConflictDoNothing();

  // LUTAR DIVISION DATA
  await db.insert(lutarDivisionDataTable).values([
    { name: "Security", revenue: "7.8", target: "8.5", growth: 34, allocation: 42, color: "#10b981" },
    { name: "Technology", revenue: "5.2", target: "6.0", growth: 28, allocation: 28, color: "#3b82f6" },
    { name: "Media & Creative", revenue: "3.3", target: "4.0", growth: 45, allocation: 18, color: "#f59e0b" },
    { name: "Operations", revenue: "2.2", target: "2.5", growth: 22, allocation: 12, color: "#8b5cf6" },
  ]).onConflictDoNothing();

  // LUTAR INSIGHTS
  await db.insert(lutarInsightsTable).values([
    { type: "opportunity", title: "Maritime SaaS consolidation wave accelerating", detail: "Three maritime tech companies acquired in Q1 2026 at 12-18x ARR multiples. Vessels positioning aligns with acquirer criteria — recommend exploring strategic partnership discussions." },
    { type: "risk", title: "GPU compute costs rising 22% YoY", detail: "Cloud GPU pricing pressures impacting INCA and Nimbus ML pipeline margins. Recommend evaluating reserved capacity commitments for 12-month term to lock current rates." },
    { type: "opportunity", title: "Cross-sell revenue acceleration", detail: "Clients using 3+ SZL platforms show 4.2x higher lifetime value than single-platform users. Recommend bundled pricing strategy for Q2 go-to-market." },
  ]).onConflictDoNothing();

  // LUTAR SUSTAINABILITY METRICS
  await db.insert(lutarSustainabilityMetricsTable).values([
    { name: "Total ARR", value: "$14.2M", unit: "$", change: "+34%", category: "Financial" },
    { name: "Blended Margin", value: "79.8%", unit: "%", change: "+2.4pp", category: "Financial" },
    { name: "Portfolio Valuation", value: "$168M", unit: "$", change: "+28%", category: "Financial" },
    { name: "Burn Multiple", value: "0.8x", unit: "x", change: "-0.3x", category: "Financial" },
  ]).onConflictDoNothing();

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch(e => {
  console.error("Seed failed:", e);
  process.exit(1);
});
