import { logger } from "../lib/logger";

export class AlloyService {
  async runAgentLoop(
    conversationId: number,
    userMessage: string,
    onChunk: (data: string) => void,
    onEnd: () => void,
  ): Promise<void> {
    const { runAgentLoop: runLoop } = await import("../routes/alloy/agent");
    const fakeRes = {
      setHeader: () => {},
      write: (chunk: string) => {
        const match = chunk.match(/^data: (.+)\n\n$/);
        if (match) onChunk(match[1]);
      },
      end: () => onEnd(),
      headersSent: false,
    };
    await runLoop(conversationId, userMessage, fakeRes as any);
  }

  async runHealthSweep() {
    const { runHealthSweep } = await import("../routes/alloy/monitor");
    return runHealthSweep();
  }
}

export const alloyService = new AlloyService();
