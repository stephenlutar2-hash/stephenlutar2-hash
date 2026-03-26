import { openai } from "@szl-holdings/integrations-openai-ai-server";
import { db } from "@szl-holdings/db";
import { messages, conversations } from "@szl-holdings/db/schema";
import { eq, asc } from "drizzle-orm";
import type { Response } from "express";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { AGENT_CONFIGS, getAgentConfigWithMcp, type AgentType } from "./configs";
import { getModelConfig } from "../../lib/model-registry";

const MAX_TOOL_ROUNDS = 10;

export async function runDomainAgentLoop(
  agentType: AgentType,
  conversationId: number,
  userMessage: string,
  res: Response,
): Promise<void> {
  const config = getAgentConfigWithMcp(agentType);

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
    { role: "system", content: config.systemPrompt },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant" | "tool",
      content: m.content,
    })),
  ];

  const hasTools = config.tools.length > 0;

  const modelConfig = getModelConfig(agentType);

  if (!hasTools) {
    let fullResponse = "";
    const stream = await openai.chat.completions.create({
      model: modelConfig.model,
      max_completion_tokens: modelConfig.maxCompletionTokens,
      temperature: modelConfig.temperature,
      top_p: modelConfig.topP,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
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
    return;
  }

  let fullResponse = "";
  let rounds = 0;

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    const stream = await openai.chat.completions.create({
      model: modelConfig.model,
      max_completion_tokens: modelConfig.maxCompletionTokens,
      temperature: modelConfig.temperature,
      top_p: modelConfig.topP,
      messages: chatMessages,
      tools: config.tools,
      tool_choice: rounds === 1 && config.requiresToolCall ? "required" : "auto",
      stream: true,
    });

    let currentToolCalls: Array<{
      id: string;
      name: string;
      arguments: string;
    }> = [];
    let hasToolCalls = false;
    let contentChunk = "";
    let bufferedContent: string[] = [];

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

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

      if (delta?.content) {
        contentChunk += delta.content;
        if (hasToolCalls) {
          bufferedContent.push(delta.content);
        } else {
          fullResponse += delta.content;
          res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
        }
      }
    }

    if (!hasToolCalls) {
      if (bufferedContent.length > 0) {
        for (const c of bufferedContent) {
          fullResponse += c;
          res.write(`data: ${JSON.stringify({ content: c })}\n\n`);
        }
      }
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

      const result = await config.executeTool(tc.name, args);

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
