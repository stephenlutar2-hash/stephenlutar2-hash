import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const carlotaJoTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "submit_inquiry",
      description: "Submit a consultation inquiry or lead from a qualified prospect. Use when a visitor wants to book a consultation, request information, or express interest in services.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The prospect's full name" },
          email: { type: "string", description: "The prospect's email address" },
          service: { type: "string", description: "The practice area or service they're interested in" },
          company: { type: "string", description: "The prospect's company name (if provided)" },
          message: { type: "string", description: "Summary of the prospect's needs and interest" },
        },
        required: ["name", "email", "service", "message"],
      },
    },
  },
];

export async function carlotaJoExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "submit_inquiry": {
        const baseUrl = process.env.REPLIT_DEV_DOMAIN
          ? `https://${process.env.REPLIT_DEV_DOMAIN}`
          : "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/carlota-jo/inquiries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: args.name,
            email: args.email,
            service: args.service || "General Inquiry",
            company: args.company,
            message: args.message,
            type: "agent_referral",
          }),
        });
        if (!res.ok) {
          return JSON.stringify({ error: "Failed to submit inquiry" });
        }
        const data = await res.json() as { id: string };
        return JSON.stringify({ success: true, inquiryId: data.id, message: "Inquiry submitted successfully. The Carlota Jo team will be in touch." });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message || "Tool execution failed" });
  }
}
