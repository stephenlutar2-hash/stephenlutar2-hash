import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { trackEvent } from "@szl-holdings/platform";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}../api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thank you for subscribing!");
        setEmail("");
        trackEvent("newsletter", "subscribe", "szl-holdings");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Unable to connect. Please try again.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-gold/10 bg-gold/[0.03] p-6 lg:p-8"
    >
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-semibold text-gold-light uppercase tracking-wider">Stay Updated</h3>
      </div>
      <p className="text-sm text-muted mb-4 leading-relaxed">
        Get insights on our latest platform launches, technology updates, and strategic moves.
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="flex-1 px-4 py-2.5 rounded-lg bg-background/80 border border-white/[0.08] text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/20 transition-all"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-4 py-2.5 bg-gradient-to-r from-gold to-gold-dark text-background font-semibold text-sm rounded-lg hover:shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-60 inline-flex items-center gap-1.5"
          >
            {status === "loading" ? "..." : <><span className="hidden sm:inline">Subscribe</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-xs text-red-400 mt-2">{message}</p>
      )}
    </motion.div>
  );
}
