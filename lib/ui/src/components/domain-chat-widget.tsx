import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MessageSquare, X, Send, Loader2, Trash2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface DomainChatWidgetProps {
  agentType: string;
  agentName: string;
  accentColor: string;
  accentHover: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  inputBg: string;
  messageBgUser: string;
  messageBgAssistant: string;
  placeholderText?: string;
  getToken?: () => string | null;
}

function getSessionId(): string {
  let sid = localStorage.getItem("domain_chat_session_id");
  if (!sid) {
    sid = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("domain_chat_session_id", sid);
  }
  return sid;
}

function authHeaders(token: string | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  const sessionId = typeof window !== "undefined" ? getSessionId() : "unknown";
  h["X-Session-Id"] = sessionId;
  return h;
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:3px;font-size:0.85em">$1</code>');
  html = html.replace(/^### (.+)$/gm, '<div style="font-weight:600;font-size:0.95em;margin-top:0.5em">$1</div>');
  html = html.replace(/^## (.+)$/gm, '<div style="font-weight:700;font-size:1em;margin-top:0.5em">$1</div>');
  html = html.replace(/^# (.+)$/gm, '<div style="font-weight:700;font-size:1.1em;margin-top:0.5em">$1</div>');
  html = html.replace(/^[-*] (.+)$/gm, '<div style="padding-left:1em">• $1</div>');
  html = html.replace(/^\d+\. (.+)$/gm, (match, p1, offset) => {
    const num = match.match(/^(\d+)\./)?.[1] || "1";
    return `<div style="padding-left:1em">${num}. ${p1}</div>`;
  });
  html = html.replace(/\n/g, "<br/>");

  return html;
}

export function DomainChatWidget({
  agentType,
  agentName,
  accentColor,
  accentHover,
  bgColor,
  textColor,
  borderColor,
  inputBg,
  messageBgUser,
  messageBgAssistant,
  placeholderText = "Ask me anything...",
  getToken,
}: DomainChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const basePath = `/api/domain-agents/${agentType}`;

  const token = useMemo(() => (getToken ? getToken() : null), [getToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const createConversation = useCallback(async (): Promise<number | null> => {
    try {
      const res = await fetch(`${basePath}/conversations`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ title: "New Conversation" }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      setConversationId(data.id);
      return data.id;
    } catch {
      return null;
    }
  }, [basePath, token]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || isStreaming) return;

    let targetId = conversationId;
    if (!targetId) {
      targetId = await createConversation();
      if (!targetId) return;
    }

    setInput("");
    setIsStreaming(true);
    setMessages(prev => [...prev, { role: "user", content }]);

    const assistantIdx = { current: -1 };
    setMessages(prev => {
      assistantIdx.current = prev.length;
      return [...prev, { role: "assistant", content: "" }];
    });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${basePath}/conversations/${targetId}/messages`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ content }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          let parsed: Record<string, unknown>;
          try { parsed = JSON.parse(trimmed.slice(6)); } catch { continue; }

          if (parsed.done === true) {
            reader.cancel();
            break;
          }

          if (typeof parsed.content === "string" && parsed.content) {
            setMessages(prev => {
              const updated = [...prev];
              const msg = updated[assistantIdx.current];
              if (msg) {
                updated[assistantIdx.current] = { ...msg, content: msg.content + (parsed.content as string) };
              }
              return updated;
            });
          }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setMessages(prev => {
          const updated = [...prev];
          const msg = updated[assistantIdx.current];
          if (msg) {
            updated[assistantIdx.current] = { ...msg, content: "Sorry, something went wrong. Please try again." };
          }
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, conversationId, basePath, token, createConversation]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer"
          style={{ backgroundColor: accentColor }}
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
          style={{
            width: "400px",
            height: "560px",
            backgroundColor: bgColor,
            borderColor: borderColor,
            color: textColor,
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-white" />
              <span className="font-semibold text-white text-sm">{agentName}</span>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full opacity-50 text-sm text-center px-6">
                <p>{placeholderText}</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed"
                  style={{
                    backgroundColor: msg.role === "user" ? messageBgUser : messageBgAssistant,
                    color: msg.role === "user" ? "white" : textColor,
                  }}
                >
                  {msg.content ? (
                    msg.role === "assistant" ? (
                      <div
                        className="prose-sm [&_strong]:font-semibold [&_code]:text-xs"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )
                  ) : (isStreaming && i === messages.length - 1 ? (
                    <span className="flex items-center gap-2 opacity-60">
                      <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
                    </span>
                  ) : "")}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 shrink-0" style={{ borderTop: `1px solid ${borderColor}` }}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={isStreaming}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none border transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: inputBg,
                  borderColor: borderColor,
                  color: textColor,
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                className="rounded-xl p-2.5 transition-all duration-200 disabled:opacity-30 cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Send className="h-4 w-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
