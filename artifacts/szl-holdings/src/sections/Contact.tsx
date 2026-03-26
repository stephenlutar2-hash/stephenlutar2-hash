import { trackEvent } from "@szl-holdings/platform";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, Linkedin, Github, Globe } from "lucide-react";
import NewsletterSignup from "../components/NewsletterSignup";

const inquiryTypes = [
  "General Inquiry",
  "Partnership Opportunity",
  "Investment Interest",
  "Technology Collaboration",
  "Consulting Engagement",
  "Media & Press",
];

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    inquiryType: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMailtoFallback, setShowMailtoFallback] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}../api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (res.ok) {
        setSubmitted(true);
        trackEvent("contact", "submit", formState.inquiryType);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Unable to send your message. You can reach us directly via email instead.");
        setShowMailtoFallback(true);
      }
    } catch {
      setError("Unable to connect to the server. You can reach us directly via email instead.");
      setShowMailtoFallback(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="relative py-32 lg:py-40">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-surface/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4 block">
            Contact
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6">
            <span className="text-foreground">Let&apos;s build </span>
            <span className="text-gradient-gold italic">together</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto font-light">
            Whether you&apos;re exploring a partnership, interested in our
            technology, or have a bold idea to discuss — we&apos;d like to hear
            from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-surface-elevated/50 p-8 lg:p-10">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <CheckCircle className="w-12 h-12 text-gold mx-auto mb-6" />
                    <h3 className="text-2xl font-serif font-medium text-foreground mb-3">
                      Thank you for reaching out
                    </h3>
                    <p className="text-muted max-w-md mx-auto">
                      We&apos;ve received your inquiry and will respond within 2
                      business days. We look forward to the conversation.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormState({ name: "", email: "", inquiryType: "", message: "" });
                      }}
                      className="mt-8 px-6 py-2.5 text-sm font-medium border border-gold/20 text-gold-light rounded-lg hover:bg-gold/10 transition-all duration-300"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-xs font-medium text-muted uppercase tracking-wider mb-2"
                        >
                          Full Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formState.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg bg-background/80 border border-white/[0.08] text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/20 transition-all"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-xs font-medium text-muted uppercase tracking-wider mb-2"
                        >
                          Email Address
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formState.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg bg-background/80 border border-white/[0.08] text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/20 transition-all"
                          placeholder="you@company.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="inquiryType"
                        className="block text-xs font-medium text-muted uppercase tracking-wider mb-2"
                      >
                        Inquiry Type
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        required
                        value={formState.inquiryType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-background/80 border border-white/[0.08] text-foreground text-sm focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/20 transition-all appearance-none"
                      >
                        <option value="" disabled>
                          Select an inquiry type
                        </option>
                        {inquiryTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-xs font-medium text-muted uppercase tracking-wider mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formState.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-background/80 border border-white/[0.08] text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/20 transition-all resize-none"
                        placeholder="Tell us about your project, partnership idea, or inquiry..."
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                        <p className="text-sm text-red-400">{error}</p>
                        {showMailtoFallback && (
                          <a
                            href={`mailto:contact@szlholdings.com?subject=${encodeURIComponent(`[SZL Holdings] ${formState.inquiryType}`)}&body=${encodeURIComponent(`Name: ${formState.name}\nEmail: ${formState.email}\nInquiry: ${formState.inquiryType}\n\n${formState.message}`)}`}
                            className="inline-block mt-3 text-sm font-medium text-gold-light hover:text-gold transition-colors underline"
                          >
                            Send via email instead
                          </a>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-gold to-gold-dark text-background font-semibold text-sm tracking-wide rounded-lg hover:shadow-lg hover:shadow-gold/20 transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Sending..." : "Send Message"}
                      <Send className="w-4 h-4" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-gold mb-4">
                Connect
              </h3>
              <div className="space-y-3">
                <a
                  href="https://www.linkedin.com/company/szl-holdings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-surface-elevated/50 hover:border-gold/15 transition-all duration-300 group"
                >
                  <Linkedin className="w-5 h-5 text-muted group-hover:text-gold transition-colors" />
                  <div>
                    <p className="text-sm font-medium text-foreground">LinkedIn</p>
                    <p className="text-xs text-muted">Professional network</p>
                  </div>
                </a>
                <a
                  href="https://github.com/szl-holdings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-surface-elevated/50 hover:border-gold/15 transition-all duration-300 group"
                >
                  <Github className="w-5 h-5 text-muted group-hover:text-gold transition-colors" />
                  <div>
                    <p className="text-sm font-medium text-foreground">GitHub</p>
                    <p className="text-xs text-muted">Open source projects</p>
                  </div>
                </a>
                <a
                  href="/apps-showcase/"
                  className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-surface-elevated/50 hover:border-gold/15 transition-all duration-300 group"
                >
                  <Globe className="w-5 h-5 text-muted group-hover:text-gold transition-colors" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      App Catalog
                    </p>
                    <p className="text-xs text-muted">
                      Browse all SZL platforms
                    </p>
                  </div>
                </a>
              </div>
            </div>

            <NewsletterSignup />

            <div className="p-6 rounded-2xl border border-gold/10 bg-gold/[0.03]">
              <h3 className="text-sm font-semibold text-gold-light mb-3">
                Partnership Inquiries
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                We actively seek strategic partnerships with organizations
                that share our commitment to excellence. Whether it&apos;s
                technology integration, co-development, or investment — let&apos;s
                explore what we can build together.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
