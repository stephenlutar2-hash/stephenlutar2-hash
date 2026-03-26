import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const router = Router();

const profile = {
  name: "Stephen Lutar",
  title: "Founder & CEO",
  company: "SZL Holdings",
  location: "United States",
  email: "stephen@szlholdings.com",
  linkedin: "https://linkedin.com/in/stephenlutar",
  github: "https://github.com/stephenlutar",
  summary: "Building the future of enterprise observability, AI infrastructure, and intelligent systems. Architecting a portfolio of 15+ platforms protecting and powering digital operations at enterprise scale.",
  availability: "Available for Consulting",
  labels: ["Technology Leader", "Enterprise Architect", "Founder"],
  stats: [
    { label: "Years Experience", value: "10+" },
    { label: "Platforms Built", value: "15+" },
    { label: "Team Members Led", value: "30+" },
    { label: "Events Processed Daily", value: "50M+" },
    { label: "Enterprise Clients", value: "200+" },
  ],
  vision: {
    title: "Business Observability for the Modern Enterprise",
    subtitle: "A System of Intelligence — not just monitoring",
    description: "SZL Holdings is pioneering a new category of enterprise software: Business Observability. We're building integrated platforms that don't just monitor systems — they understand business context, predict operational risks, and enable proactive decision-making across security, logistics, AI, and creative operations.",
  },
};

const skills = [
  { category: "Languages", items: ["TypeScript", "JavaScript", "Python", "Go", "SQL", "HTML/CSS"] },
  { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "Vite", "Redux"] },
  { category: "Backend", items: ["Node.js", "Express", "PostgreSQL", "Redis", "GraphQL", "REST"] },
  { category: "Infrastructure", items: ["AWS", "Azure", "Docker", "Kubernetes", "CI/CD", "Terraform"] },
  { category: "Security", items: ["Zero-Trust", "OAuth/OIDC", "Encryption", "Pen Testing", "SIEM", "Threat Modeling"] },
  { category: "Leadership", items: ["Team Management", "Architecture Design", "Product Strategy", "Agile", "Mentoring", "Investor Relations"] },
];

const skillsRadar = [
  { subject: "Frontend", current: 92, target: 95 },
  { subject: "Backend", current: 88, target: 90 },
  { subject: "DevOps", current: 75, target: 85 },
  { subject: "Security", current: 70, target: 80 },
  { subject: "AI/ML", current: 82, target: 90 },
  { subject: "Leadership", current: 85, target: 90 },
  { subject: "Architecture", current: 78, target: 85 },
  { subject: "Communication", current: 90, target: 92 },
];

const growthAreas = [
  { skill: "Kubernetes & Container Orchestration", gap: 15, priority: "High", recommendation: "Complete CKA certification track — estimated 40 hours", resources: ["KodeKloud CKA Course", "Kubernetes the Hard Way", "Practice Labs"] },
  { skill: "Zero-Trust Security Architecture", gap: 12, priority: "High", recommendation: "Deep dive into NIST Zero Trust framework and implement proof-of-concept with Aegis", resources: ["NIST SP 800-207", "Zero Trust Architecture (O'Reilly)", "Aegis codebase study"] },
  { skill: "MLOps & Model Deployment", gap: 10, priority: "Medium", recommendation: "Build end-to-end ML pipeline with INCA experiment platform", resources: ["MLOps Zoomcamp", "Weights & Biases tutorials", "INCA ML pipeline docs"] },
  { skill: "System Design at Scale", gap: 8, priority: "Medium", recommendation: "Study Zeus architecture patterns and contribute to capacity planning", resources: ["Designing Data-Intensive Apps", "Zeus architecture docs", "System Design Interview prep"] },
];

const certifications = [
  { name: "AWS Solutions Architect Professional", status: "completed", date: "2025-11-15", progress: 100 },
  { name: "Certified Kubernetes Administrator", status: "in-progress", date: null, progress: 65 },
  { name: "CISSP (Security)", status: "planned", date: "2026-Q3", progress: 0 },
  { name: "Google Cloud ML Engineer", status: "planned", date: "2026-Q4", progress: 0 },
];

const timeline = [
  {
    year: "2023",
    role: "Founder & CEO",
    company: "SZL Holdings",
    period: "2023 — Present",
    description: "Built a vertically integrated technology holding company from the ground up. Architected and shipped a portfolio of 15+ enterprise platforms spanning cybersecurity, AI analytics, maritime logistics, creative tools, and financial advisory — all within a unified full-stack monorepo.",
    achievements: ["15+ platforms shipped", "Full-stack TypeScript architecture", "AI-powered threat detection engine", "Zero-trust security framework"],
    impact: "Created an enterprise-grade multi-platform ecosystem processing real-time data across security, analytics, and logistics domains.",
  },
  {
    year: "2020",
    role: "Senior Software Architect",
    company: "Enterprise Security Division",
    period: "2020 — 2023",
    description: "Designed and implemented zero-trust security architectures for Fortune 500 clients. Led a cross-functional team of 12 engineers building real-time threat monitoring systems that processed 50M+ security events daily with sub-second response times.",
    achievements: ["Zero-trust architecture for Fortune 500", "50M+ daily events processed", "Led team of 12 engineers", "99.99% system uptime"],
    impact: "Reduced client security incident response time by 73% and eliminated 94% of false positive alerts through ML-based classification.",
  },
  {
    year: "2017",
    role: "Lead Full-Stack Engineer",
    company: "Cloud Infrastructure Corp",
    period: "2017 — 2020",
    description: "Architected a microservices platform handling 100k+ concurrent users. Designed automated deployment pipelines that cut release cycles by 80%, and built real-time analytics dashboards adopted by 200+ enterprise clients.",
    achievements: ["100k+ concurrent users", "80% faster deployments", "200+ enterprise clients", "Microservices migration"],
    impact: "Platform generated $12M ARR within 18 months of launch. Migration from monolith to microservices reduced infrastructure costs by 40%.",
  },
  {
    year: "2015",
    role: "Software Engineer",
    company: "Digital Innovation Labs",
    period: "2015 — 2017",
    description: "Full-stack development for fintech and healthcare startups. Implemented PCI-compliant payment processing, HIPAA-compliant data pipelines, and responsive web applications serving 50k+ monthly active users.",
    achievements: ["PCI-compliant payment systems", "HIPAA-compliant pipelines", "50k+ MAU", "React & Node.js"],
    impact: "Payment platform processed $2.3M in transactions within first quarter. Healthcare data pipeline reduced report generation time from hours to minutes.",
  },
];

const caseStudies = [
  {
    id: "enterprise-security",
    title: "Enterprise Security Monitoring Platform",
    role: "Architect & Lead Engineer",
    client: "Fortune 500 Financial Services",
    icon: "Shield",
    color: "from-cyan-500 to-blue-600",
    metrics: [
      { label: "Threat Detection", value: "73%", suffix: "faster" },
      { label: "False Positives", value: "94%", suffix: "reduced" },
      { label: "Daily Events", value: "50M+", suffix: "" },
      { label: "Uptime", value: "99.99%", suffix: "" },
    ],
    description: "Designed and built a real-time security monitoring platform processing 50M+ events daily. Implemented ML-based threat classification that reduced false positive alerts by 94% and improved incident response time by 73%.",
    technologies: ["TypeScript", "React", "Node.js", "PostgreSQL", "Redis", "TensorFlow"],
  },
  {
    id: "predictive-analytics",
    title: "AI-Powered Predictive Analytics Engine",
    role: "Technical Lead",
    client: "Enterprise SaaS Company",
    icon: "Brain",
    color: "from-violet-500 to-purple-600",
    metrics: [
      { label: "Prediction Accuracy", value: "91%", suffix: "" },
      { label: "Revenue Impact", value: "$8.2M", suffix: "saved" },
      { label: "Processing Speed", value: "3x", suffix: "faster" },
      { label: "Model Training", value: "Auto", suffix: "" },
    ],
    description: "Built a predictive analytics platform that uses machine learning to forecast system anomalies, resource utilization, and business KPIs. Automated model retraining pipeline maintains 91% prediction accuracy across 40+ signal types.",
    technologies: ["Python", "TypeScript", "React", "OpenAI", "PostgreSQL", "Redis"],
  },
  {
    id: "microservices-migration",
    title: "Multi-Platform Microservices Migration",
    role: "Principal Architect",
    client: "Cloud Infrastructure Corp",
    icon: "Server",
    color: "from-emerald-500 to-teal-600",
    metrics: [
      { label: "Infra Costs", value: "40%", suffix: "reduced" },
      { label: "Concurrent Users", value: "100k+", suffix: "" },
      { label: "Deploy Frequency", value: "5x", suffix: "increase" },
      { label: "Revenue", value: "$12M", suffix: "ARR" },
    ],
    description: "Led the migration of a monolithic platform to a microservices architecture serving 100k+ concurrent users. Designed event-driven communication patterns and automated deployment pipelines that increased release velocity by 5x.",
    technologies: ["Node.js", "Kubernetes", "Docker", "Terraform", "AWS", "RabbitMQ"],
  },
  {
    id: "maritime-intelligence",
    title: "Maritime Fleet Intelligence System",
    role: "Founder & Architect",
    client: "SZL Holdings — Vessels",
    icon: "Globe",
    color: "from-blue-500 to-cyan-600",
    metrics: [
      { label: "Fleet Tracking", value: "Real-time", suffix: "" },
      { label: "Route Optimization", value: "18%", suffix: "fuel saved" },
      { label: "Compliance", value: "100%", suffix: "automated" },
      { label: "Data Sources", value: "12+", suffix: "integrated" },
    ],
    description: "Architected a maritime intelligence platform providing real-time fleet tracking, route optimization, and regulatory compliance automation. Integrated 12+ data sources including AIS feeds, weather APIs, and port databases.",
    technologies: ["TypeScript", "React", "Express", "PostgreSQL", "WebSocket", "Mapbox"],
  },
];

const selectedWork = [
  { name: "ROSIE", description: "AI-powered security monitoring with real-time threat detection, incident response, and the Alloy AI chat assistant.", tags: ["React", "TypeScript", "AI", "Security"], icon: "Shield", color: "from-cyan-500 to-violet-600" },
  { name: "Aegis", description: "Enterprise defensive security platform with threat assessment, vulnerability scanning, and compliance monitoring.", tags: ["Security", "Zero-Trust", "React"], icon: "Shield", color: "from-amber-500 to-yellow-600" },
  { name: "Beacon", description: "Centralized telemetry and analytics dashboard with KPI tracking, project management, and cross-platform insights.", tags: ["Analytics", "Dashboard", "Charts"], icon: "BarChart3", color: "from-cyan-400 to-blue-600" },
  { name: "Zeus", description: "Modular core architecture engine powering the entire SZL ecosystem with adaptive scaling and health monitoring.", tags: ["Infrastructure", "Modules", "TypeScript"], icon: "Zap", color: "from-yellow-500 to-amber-600" },
  { name: "Nimbus", description: "Predictive intelligence platform with confidence-scored AI forecasting, anomaly detection, and system alerts.", tags: ["AI", "Predictions", "Analytics"], icon: "Brain", color: "from-cyan-500 to-violet-600" },
  { name: "Vessels", description: "Maritime fleet intelligence with real-time tracking, route optimization, compliance automation, and risk analysis.", tags: ["Logistics", "Maps", "Real-time"], icon: "Globe", color: "from-blue-500 to-emerald-600" },
];

router.get("/career/health", (_req: Request, res: Response) => {
  res.json({ ok: true, group: "career", timestamp: new Date().toISOString() });
});

router.get("/career/profile", (_req: Request, res: Response) => {
  logger.info("Career profile requested");
  res.json(profile);
});

router.get("/career/skills", (_req: Request, res: Response) => {
  logger.info("Career skills requested");
  res.json({ categories: skills, radar: skillsRadar, growthAreas, overallScore: Math.round(skillsRadar.reduce((s, d) => s + d.current, 0) / skillsRadar.length) });
});

router.get("/career/certifications", (_req: Request, res: Response) => {
  logger.info("Career certifications requested");
  res.json({ certifications });
});

router.get("/career/timeline", (_req: Request, res: Response) => {
  logger.info("Career timeline requested");
  res.json({ timeline });
});

router.get("/career/case-studies", (_req: Request, res: Response) => {
  logger.info("Career case studies requested");
  res.json({ caseStudies });
});

router.get("/career/selected-work", (_req: Request, res: Response) => {
  logger.info("Career selected work requested");
  res.json({ selectedWork });
});

router.get("/career/all", (_req: Request, res: Response) => {
  logger.info("Career all data requested");
  res.json({
    profile,
    skills: { categories: skills, radar: skillsRadar, growthAreas, overallScore: Math.round(skillsRadar.reduce((s, d) => s + d.current, 0) / skillsRadar.length) },
    certifications,
    timeline,
    caseStudies,
    selectedWork,
  });
});

export default router;
