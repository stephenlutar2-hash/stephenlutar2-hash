import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Loader2,
  LogOut,
  Shield,
  Wrench,
  ChevronLeft,
  AlertCircle,
  X,
} from "lucide-react";
import { useAlloyChat } from "@workspace/api-client-react";

function getToken() {
  return localStorage.getItem("szl_token");
}

function ToolCallBadge({ name, args }: { name: string; args: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="my-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono hover:bg-amber-500/15 transition-colors"
      >
        <Wrench className="w-3 h-3" />
        {name}
        <span className="text-amber-400/50">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <pre className="mt-1 ml-4 p-2 rounded bg-black/40 text-xs text-gray-400 font-mono overflow-x-auto max-w-md">
          {JSON.stringify(args, null, 2)}
        </pre>
      )}
    </div>
  );
}

function formatContent(content: string) {
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function AlloyChat() {
  const [, setLocation] = useLocation();
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
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
  } = useAlloyChat({ getToken });

  useEffect(() => {
    if (!getToken()) {
      setLocation("/login");
      return;
    }
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || isStreaming) return;

    setInput("");

    if (!conversationId) {
      const id = await createConversation(content.slice(0, 50));
      if (!id) return;
      await sendMessage(content, id);
      return;
    }

    await sendMessage(content);
  }, [input, isStreaming, conversationId, createConversation, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function logout() {
    const token = getToken();
    if (token) fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  const user = localStorage.getItem("szl_user");

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex overflow-hidden">
      {sidebarOpen && (
        <div className="w-72 border-r border-white/5 bg-[#0d0d14] flex flex-col shrink-0">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-wider">ALLOY</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Nuro Engine</p>
              </div>
            </div>
            <button
              onClick={() => { createConversation(); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Conversation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {conversations.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  conversationId === c.id
                    ? "bg-cyan-500/10 border border-cyan-500/20"
                    : "hover:bg-white/5"
                }`}
              >
                <button
                  onClick={() => loadConversation(c.id)}
                  className="flex-1 flex items-center gap-2 min-w-0 text-left"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-300 truncate">{c.title}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-8">No conversations yet</p>
            )}
          </div>

          <div className="p-3 border-t border-white/5 space-y-2">
            <button
              onClick={() => setLocation("/dashboard")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 text-sm transition-colors"
            >
              <Shield className="w-4 h-4" />
              Command Center
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{user || "Logout"}</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-white/5 flex items-center px-4 gap-3 shrink-0 bg-[#0d0d14]/50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
          </button>
          <Bot className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold tracking-wider">ALLOY NURO ENGINE</h2>
          {isStreaming && (
            <div className="flex items-center gap-1.5 ml-auto">
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span className="text-xs text-cyan-400 font-mono">PROCESSING</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={clearError} className="p-0.5 hover:bg-red-500/20 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-white/5 flex items-center justify-center mb-6"
              >
                <Bot className="w-10 h-10 text-cyan-400/60" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold mb-1"
              >
                Alloy Nuro Engine
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-cyan-400/60 font-mono tracking-widest mb-2"
              >
                SZL HOLDINGS NEURAL CORE
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500 text-sm max-w-md mb-8"
              >
                Your autonomous neural engine with direct database access to every SZL platform. All answers are grounded in real-time data — never fabricated.
              </motion.p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {[
                  "Show me all active ROSIE security threats right now",
                  "Give me a full system health report across every platform",
                  "What are the current Beacon KPI metrics and project statuses?",
                  "How many Nimbus predictions are pending and what's their confidence?",
                ].map((prompt, i) => (
                  <motion.button
                    key={prompt}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                    className="text-left px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 text-sm text-gray-400 transition-colors"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-cyan-500/20">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-cyan-500/15 border border-cyan-500/20 text-white rounded-br-md"
                        : "bg-white/[0.03] border border-white/5 text-gray-300 rounded-bl-md"
                    }`}
                  >
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mb-2">
                        {msg.toolCalls.map((tc, j) => (
                          <ToolCallBadge key={j} name={tc.name} args={tc.args} />
                        ))}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap break-words">
                      {formatContent(msg.content)}
                      {msg.role === "assistant" && isStreaming && i === messages.length - 1 && !msg.content && (
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#0d0d14]/50">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Query the Nuro Engine..."
                rows={1}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 resize-none text-sm transition-colors"
                style={{ minHeight: "44px", maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "44px";
                  target.style.height = Math.min(target.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                {isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-600 mt-2 text-center">
              Alloy Nuro Engine queries live platform data. Every response is grounded in real-time database records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
