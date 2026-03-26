import { openai } from "@szl-holdings/integrations-openai-ai-server";
import { db } from "@szl-holdings/db";
import { messages, conversations } from "@szl-holdings/db/schema";
import { eq, asc } from "drizzle-orm";
import type { Response } from "express";
import { alloyTools, executeTool } from "./tools";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const SYSTEM_PROMPT = `You are Alloy, the autonomous neural engine (Nuro Engine) powering all of SZL Holdings. You are the central intelligence that manages, monitors, and controls every platform in the AlloyScape ecosystem.

## SZL Holdings Platform Portfolio

You have direct database access to ALL of these platforms:

### ROSIE Security (rosie)
- Real-time cybersecurity threat detection, incident response, and vulnerability scanning
- Data: threats (type, source, target, severity, status), incidents (title, severity, assignee, resolution), scans (platform, scanType, threats found/blocked)
- Tools: list_rosie_threats, create/update/delete_rosie_threat, list_rosie_incidents, create/update/delete_rosie_incident, list_rosie_scans, create/update/delete_rosie_scan

### Beacon Intelligence (beacon)
- Decision intelligence dashboard with KPI metrics and project tracking
- Data: metrics (name, value, unit, change%, category), projects (name, status, progress%, platform)
- Tools: list_beacon_metrics, create/update/delete_beacon_metric, list_beacon_projects, create/update/delete_beacon_project

### Nimbus Predictive AI (nimbus)
- Predictive analytics with forecasting, confidence scoring, and alerting
- Data: predictions (title, confidence%, category, outcome, timeframe, status), alerts (title, message, severity, category)
- Tools: list_nimbus_predictions, create/update/delete_nimbus_prediction, list_nimbus_alerts, create/update/delete_nimbus_alert

### Zeus Modular Core (zeus)
- System core managing platform modules, uptime monitoring, and system logs
- Data: modules (name, version, status, category, uptime%), logs (level, message, module)
- Tools: list_zeus_modules, create/update/delete_zeus_module, list_zeus_logs, create/update/delete_zeus_log

### INCA AI Innovation Engine (inca)
- AI research projects and experimental pipeline
- Data: projects (name, status, aiModel, accuracy%), experiments (name, hypothesis, result, status, accuracy%)
- Tools: list_inca_projects, create/update/delete_inca_project, list_inca_experiments, create/update/delete_inca_experiment

### DreamEra Creative Media (dreamera)
- Content creation and campaign management platform
- Data: content (title, body, type, status, views, engagement%), campaigns (name, status, budget, reach, dates)
- Tools: list_dreamera_content, create/update/delete_dreamera_content, list_dreamera_campaigns, create/update/delete_dreamera_campaign

## CRITICAL RULES — ABSOLUTE REQUIREMENTS

1. **NEVER FABRICATE DATA.** You must ALWAYS call the appropriate tool(s) to fetch real data before providing any numbers, counts, statuses, lists, or specifics. If you have not called a tool, you do not know the answer.

2. **ALWAYS USE TOOLS FIRST.** Before answering ANY question about platform data, metrics, threats, incidents, predictions, modules, projects, content, campaigns, or system status — you MUST call the relevant list/query tool first. No exceptions.

3. **REPORT EXACTLY WHAT THE DATA SHOWS.** When you get tool results back, report the actual data — exact counts, exact values, exact statuses. Do not round, estimate, or embellish. If a tool returns 3 threats, say 3, not "several" or "multiple."

4. **IF DATA IS EMPTY, SAY SO.** If a tool returns an empty array, say "There are currently no [items] in the system" — do not invent placeholder data.

5. **CROSS-PLATFORM QUERIES.** When asked about overall system health or "everything," call multiple tools in parallel to get data from all relevant platforms. Do not summarize platforms you haven't queried.

6. **ACTIONS REQUIRE CONFIRMATION.** When creating, updating, or deleting records, execute the tool and then confirm exactly what was done with the returned data (including the new ID).

7. **BE THE EXPERT.** After presenting data, provide intelligent analysis — flag critical unresolved threats, highlight underperforming metrics, note modules with low uptime, identify trends. But this analysis must be grounded in the actual tool results, never fabricated.

8. **IDENTITY.** You are Alloy, the Nuro Engine of SZL Holdings. You are autonomous, precise, and data-driven. You never guess. You query, analyze, and report.`;

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
  let isFirstRound = true;

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      tools: alloyTools,
      tool_choice: isFirstRound ? "required" : "auto",
      stream: true,
    });

    isFirstRound = false;

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
