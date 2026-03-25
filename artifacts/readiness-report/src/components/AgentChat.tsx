import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Loader2, MessageSquare, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Which platforms have the lowest readiness?",
  "Give me an infrastructure health summary",
  "What needs to happen before PSEM can deploy?",
  "Compare uptime across all platforms",
];

export default function AgentChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: content.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          context: "readiness",
          history: [...messages, userMsg].slice(-10),
        }),
      });

      if (!res.ok) throw new Error("Failed to connect to agent");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: last.content + data.content };
                }
                return updated;
              });
            }
            if (data.error) throw new Error(data.error);
          } catch {}
        }
      }
    } catch (err: any) {
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant" && !last.content) {
          updated[updated.length - 1] = { ...last, content: "Sorry, I couldn't process that request. Please try again." };
        }
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-5 w-[380px] max-h-[520px] rounded-2xl bg-[#0c1117] border border-[#1e2a3a] shadow-2xl shadow-black/50 flex flex-col z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a3a] bg-[#0e1420]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Atlas</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Readiness Agent</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={() => setMessages([])} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[300px] max-h-[380px]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                    <Bot className="w-6 h-6 text-blue-400/60" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">Atlas Readiness Agent</p>
                  <p className="text-xs text-gray-500 mb-4 max-w-[260px]">Ask me about project readiness, deployment status, or infrastructure health.</p>
                  <div className="space-y-1.5 w-full">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-xs text-gray-400 transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-500/15 border border-blue-500/20 text-white"
                        : "bg-white/[0.04] border border-white/5 text-gray-300"
                    }`}>
                      <div className="whitespace-pre-wrap break-words">
                        {msg.content || (
                          <span className="inline-flex gap-1 text-gray-500">
                            <span className="animate-pulse">●</span>
                            <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
                            <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-3 py-3 border-t border-[#1e2a3a] bg-[#0e1420]">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder="Ask Atlas..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-blue-500/40 transition"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || streaming}
                  className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-5 right-5 w-12 h-12 rounded-full shadow-lg shadow-blue-500/25 flex items-center justify-center z-50 transition-all ${
          open ? "bg-white/10 border border-white/20" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {open ? <X className="w-5 h-5 text-white" /> : <MessageSquare className="w-5 h-5 text-white" />}
      </button>
    </>
  );
}
