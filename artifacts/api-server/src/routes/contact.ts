import { Router, type Request, type Response } from "express";

const router = Router();

interface ContactPayload {
  name: string;
  email: string;
  inquiryType: string;
  message: string;
}

router.post("/contact", async (req: Request, res: Response) => {
  const { name, email, inquiryType, message } = req.body as ContactPayload;

  if (!name || !email || !inquiryType || !message) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email address." });
    return;
  }

  console.log("[Contact Inquiry]", {
    timestamp: new Date().toISOString(),
    name,
    email,
    inquiryType,
    messageLength: message.length,
  });

  res.status(200).json({
    success: true,
    message: "Thank you for your inquiry. We will respond within 2 business days.",
  });
});

export default router;
