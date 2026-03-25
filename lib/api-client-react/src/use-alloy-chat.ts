import { useState, useCallback, useRef, useEffect } from "react";

export interface AlloyContentChunk {
  type: "content";
  content: string;
}

export interface AlloyToolCallChunk {
  type: "tool_call";
  tool_call: { name: string; args: Record<string, unknown> };
}

export interface AlloyDoneChunk {
  type: "done";
}

export type AlloyChunk = AlloyContentChunk | AlloyToolCallChunk | AlloyDoneChunk;

export interface AlloyMessage {
  role: "user" | "assistant";
  content: string;
  toolCalls?: Array<{ name: string; args: Record<string, unknown> }>;
}

export interface UseAlloyChatOptions {
  getToken: () => string | null;
}

export interface UseAlloyChatReturn {
  messages: AlloyMessage[];
  isStreaming: boolean;
  error: string | null;
  conversationId: number | null;
  conversations: Array<{ id: number; title: string; createdAt: string }>;
  sendMessage: (content: string, explicitConversationId?: number) => Promise<void>;
  createConversation: (title?: string) => Promise<number | null>;
  loadConversation: (id: number) => Promise<void>;
  loadConversations: () => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  clearError: () => void;
}

function authHeaders(token: string | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export function useAlloyChat(options: UseAlloyChatOptions): UseAlloyChatReturn {
  const { getToken } = options;
  const [messages, setMessages] = useState<AlloyMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<
    Array<{ id: number; title: string; createdAt: string }>
  >([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/alloy/conversations", {
        headers: authHeaders(getToken()),
      });
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      setConversations(data);
    } catch (e: any) {
      setError(e.message);
    }
  }, [getToken]);

  const createConversation = useCallback(
    async (title?: string): Promise<number | null> => {
      try {
        const res = await fetch("/api/alloy/conversations", {
          method: "POST",
          headers: authHeaders(getToken()),
          body: JSON.stringify({ title: title || "New Conversation" }),
        });
        if (!res.ok) throw new Error("Failed to create conversation");
        const data = await res.json();
        setConversationId(data.id);
        setMessages([]);
        setError(null);
        await loadConversations();
        return data.id;
      } catch (e: any) {
        setError(e.message);
        return null;
      }
    },
    [getToken, loadConversations],
  );

  const loadConversation = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/alloy/conversations/${id}`, {
          headers: authHeaders(getToken()),
        });
        if (!res.ok) throw new Error("Failed to load conversation");
        const data = await res.json();
        setConversationId(id);
        setMessages(
          (data.messages || [])
            .filter((m: any) => m.role === "user" || m.role === "assistant")
            .map((m: any) => ({
              role: m.role as "user" | "assistant",
              content: m.content || "",
            })),
        );
        setError(null);
      } catch (e: any) {
        setError(e.message);
      }
    },
    [getToken],
  );

  const deleteConversation = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/alloy/conversations/${id}`, {
          method: "DELETE",
          headers: authHeaders(getToken()),
        });
        if (!res.ok) throw new Error("Failed to delete conversation");
        if (conversationId === id) {
          setConversationId(null);
          setMessages([]);
        }
        await loadConversations();
      } catch (e: any) {
        setError(e.message);
      }
    },
    [getToken, conversationId, loadConversations],
  );

  const sendMessage = useCallback(
    async (content: string, explicitConversationId?: number) => {
      const targetId = explicitConversationId ?? conversationId;
      if (!targetId) {
        setError("No active conversation");
        return;
      }
      if (isStreaming) return;

      setError(null);
      setIsStreaming(true);

      setMessages((prev) => [...prev, { role: "user", content }]);

      const assistantIdx = { current: -1 };
      setMessages((prev) => {
        assistantIdx.current = prev.length;
        return [...prev, { role: "assistant", content: "", toolCalls: [] }];
      });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `/api/alloy/conversations/${targetId}/messages`,
          {
            method: "POST",
            headers: authHeaders(getToken()),
            body: JSON.stringify({ content }),
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.error || `Request failed with status ${res.status}`,
          );
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No readable stream available");

        const decoder = new TextDecoder();
        let buffer = "";
        let streamComplete = false;

        while (!streamComplete) {
          const { done: readerDone, value } = await reader.read();
          if (readerDone) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            let parsed: Record<string, unknown>;
            try {
              parsed = JSON.parse(trimmed.slice(6));
            } catch {
              continue;
            }

            if (parsed.done === true) {
              streamComplete = true;
              reader.cancel();
              break;
            }

            if (typeof parsed.content === "string" && parsed.content) {
              const text = parsed.content;
              setMessages((prev) => {
                const updated = [...prev];
                const msg = updated[assistantIdx.current];
                if (msg) {
                  updated[assistantIdx.current] = {
                    ...msg,
                    content: msg.content + text,
                  };
                }
                return updated;
              });
            } else if (parsed.tool_call && typeof parsed.tool_call === "object") {
              const tc = parsed.tool_call as { name: string; args: Record<string, unknown> };
              setMessages((prev) => {
                const updated = [...prev];
                const msg = updated[assistantIdx.current];
                if (msg) {
                  updated[assistantIdx.current] = {
                    ...msg,
                    toolCalls: [...(msg.toolCalls || []), tc],
                  };
                }
                return updated;
              });
            }
          }
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e.message);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [conversationId, isStreaming, getToken],
  );

  return {
    messages,
    isStreaming,
    error,
    conversationId,
    conversations,
    sendMessage,
    createConversation,
    loadConversation,
    loadConversations,
    deleteConversation,
    clearError,
  };
}
