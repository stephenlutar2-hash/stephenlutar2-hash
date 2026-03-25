import { Router } from "express";
import { requireAuth } from "./auth";

const router = Router();

interface Inquiry {
  id: string;
  name: string;
  email: string;
  service: string;
  budget?: string;
  timeline?: string;
  message?: string;
  company?: string;
  datePreference?: string;
  description?: string;
  type?: string;
  createdAt: string;
}

const inquiries: Inquiry[] = [];

router.post("/carlota-jo/inquiries", (req, res) => {
  const { name, email, service, budget, timeline, message, company, datePreference, description, type } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: "Name and email are required" });
    return;
  }

  const inquiry: Inquiry = {
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    service: service || "",
    budget,
    timeline,
    message,
    company,
    datePreference,
    description,
    type: type || "general_inquiry",
    createdAt: new Date().toISOString(),
  };

  inquiries.push(inquiry);

  res.json({ success: true, id: inquiry.id, message: "Inquiry received successfully" });
});

router.get("/carlota-jo/inquiries", requireAuth, (req, res) => {
  res.json({ inquiries, total: inquiries.length });
});

router.get("/stripe/status", (_req, res) => {
  const configured = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
  res.json({ configured });
});

export default router;
