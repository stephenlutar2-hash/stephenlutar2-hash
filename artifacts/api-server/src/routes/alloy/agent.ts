import { openai } from "@workspace/integrations-openai-ai-server";
import { db } from "@workspace/db";
import { messages, conversations } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";
import type { Response } from "express";
import { alloyTools, executeTool } from "./tools";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const SYSTEM_PROMPT = `You are Alloy, the autonomous AI engine for SZL Holdings (AlloyScape). You manage and monitor all SZL platforms:

- **Rosie Security**: Cybersecurity threat detection, incident response, and security scanning
- **Beacon**: Decision intelligence dashboard with KPI metrics and project tracking
- **Nimbus**: Predictive AI platform with forecasting, confidence scoring, and alerts
- **Zeus**: Modular system core managing platform modules, uptime monitoring, and system logs
- **INCA AI**: Innovation engine for AI research projects and experiments
- **DreamEra**: Creative media platform for content creation and campaign management

You have tools to query, create, update, and delete data across all platforms. When users ask questions, use the appropriate tools to fetch real data before answering. Provide precise, data-driven responses. When taking actions (create/update/delete), confirm what you did.

Always be professional, concise, and proactive. If you notice issues in the data (e.g., critical unresolved threats, failing modules), mention them even if not directly asked.`;

const MAX_TOOL_ROUNDS = 10;

export async function runAgentLoop(
  conversationId: number,
  userMessage: string,
  res: Response,
): Promise<void> {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  await db.insert(messages).values({
    conversationId,
    role: "user",
    content: userMessage,
  });

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  const chatMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant" | "tool",
      content: m.content,
    })),
  ];

  let fullResponse = "";
  let rounds = 0;

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      tools: alloyTools,
      stream: true,
    });

    let currentToolCalls: Array<{
      id: string;
      name: string;
      arguments: string;
    }> = [];
    let hasToolCalls = false;
    let contentChunk = "";

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      if (delta?.content) {
        contentChunk += delta.content;
        fullResponse += delta.content;
        res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
      }

      if (delta?.tool_calls) {
        hasToolCalls = true;
        for (const tc of delta.tool_calls) {
          if (tc.index !== undefined) {
            if (!currentToolCalls[tc.index]) {
              currentToolCalls[tc.index] = {
                id: tc.id || "",
                name: tc.function?.name || "",
                arguments: "",
              };
            }
            if (tc.id) currentToolCalls[tc.index].id = tc.id;
            if (tc.function?.name)
              currentToolCalls[tc.index].name = tc.function.name;
            if (tc.function?.arguments)
              currentToolCalls[tc.index].arguments += tc.function.arguments;
          }
        }
      }
    }

    if (!hasToolCalls) {
      break;
    }

    const assistantMessage: ChatCompletionMessageParam = {
      role: "assistant",
      content: contentChunk || null,
      tool_calls: currentToolCalls.map((tc) => ({
        id: tc.id,
        type: "function" as const,
        function: { name: tc.name, arguments: tc.arguments },
      })),
    };
    chatMessages.push(assistantMessage);

    for (const tc of currentToolCalls) {
      let args: Record<string, any> = {};
      try {
        args = JSON.parse(tc.arguments);
      } catch {
        args = {};
      }

      res.write(
        `data: ${JSON.stringify({ tool_call: { name: tc.name, args } })}\n\n`,
      );

      const result = await executeTool(tc.name, args);

      chatMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }
  }

  if (fullResponse) {
    await db.insert(messages).values({
      conversationId,
      role: "assistant",
      content: fullResponse,
    });
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
}
