import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, Calendar,
  Briefcase, BarChart3, Crown, CreditCard
} from "lucide-react";

function useStripeConfigured() {
  const [configured, setConfigured] = useState(false);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}../api/stripe/status`)
      .then(r => r.json())
      .then(d => setConfigured(d?.configured === true))
      .catch(() => setConfigured(false));
  }, []);
  return configured;
}

const sessionTypes = [
  {
    id: "strategy",
    icon: Briefcase,
    name: "Strategy Session",
    duration: "90 minutes",
    price: "$2,500",
    description: "A focused strategy session with a senior advisor to address a specific challenge, explore an opportunity, or validate a strategic direction. Includes a pre-session briefing questionnaire and a written summary of recommendations.",
    includes: [
      "90-minute virtual or in-person session",
      "Pre-session briefing questionnaire",
      "Written executive summary of recommendations",
      "One follow-up email for clarification",
    ],
    popular: false,
  },
  {
    id: "portfolio",
    icon: BarChart3,
    name: "Portfolio Review",
    duration: "Half Day (4 hours)",
    price: "$8,500",
    description: "A comprehensive review of your portfolio, asset allocation, and investment strategy. Our team prepares a detailed analysis in advance and walks you through findings, risk exposure, and optimization recommendations.",
    includes: [
      "Pre-engagement portfolio data collection",
      "Detailed analysis and diagnostic report",
      "4-hour working session with senior advisor",
      "Written report with prioritized recommendations",
      "30-day follow-up call included",
    ],
    popular: true,
  },
  {
    id: "retainer",
    icon: Crown,
    name: "Advisory Retainer",
    duration: "Monthly",
    price: "$25,000",
    priceNote: "/month",
    description: "Ongoing strategic advisory on a retainer basis. Includes dedicated access to a senior advisor, monthly strategy sessions, quarterly reviews, and priority response for ad-hoc advisory needs.",
    includes: [
      "Dedicated senior advisor assignment",
      "Monthly 2-hour strategy sessions",
      "Quarterly portfolio & strategy review",
      "Priority access for ad-hoc advisory",
      "Bi-weekly check-in calls",
      "All deliverables from Strategy & Portfolio sessions",
    ],
    popular: false,
  },
];

export default function Consultation() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "details" | "confirmed">("select");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    datePreference: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${import.meta.env.BASE_URL}../api/carlota-jo/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          service: `Consultation: ${selectedSession}`,
          type: "consultation_booking",
        }),
      });
    } catch {
      setLoading(false);
      return;
    }
    setLoading(false);
    setStep("confirmed");
  };

  const stripeConfigured = useStripeConfigured();
  const selected = sessionTypes.find((s) => s.id === selectedSession);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground font-serif">CJ</span>
            </div>
            <span className="font-serif text-lg font-semibold tracking-wide text-foreground">Carlota Jo</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-24 max-w-6xl mx-auto px-6">
        {step === "select" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="text-center mb-16">
              <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">Book a Consultation</span>
              <h1 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-6">Choose Your Engagement</h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg font-light">
                Select the session type that best fits your needs. All engagements include access to our senior advisory team.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {sessionTypes.map((session) => {
                const Icon = session.icon;
                const isSelected = selectedSession === session.id;
                return (
                  <motion.div
                    key={session.id}
                    whileHover={{ y: -4 }}
                    className={`relative p-8 rounded-lg cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "ring-2 ring-primary bg-card luxury-border"
                        : "luxury-border luxury-border-hover bg-card"
                    }`}
                    onClick={() => setSelectedSession(session.id)}
                  >
                    {session.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-medium tracking-wider uppercase rounded-full">
                        Most Popular
                      </span>
                    )}

                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    <h3 className="text-xl font-serif font-semibold mb-2">{session.name}</h3>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-serif font-bold gold-gradient">{session.price}</span>
                      {session.priceNote && <span className="text-sm text-muted-foreground">{session.priceNote}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
                      <Clock className="w-3.5 h-3.5" />
                      {session.duration}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{session.description}</p>

                    <ul className="space-y-2">
                      {session.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    {isSelected && (
                      <motion.div
                        layoutId="selected-indicator"
                        className="absolute inset-0 rounded-lg ring-2 ring-primary pointer-events-none"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <button
                disabled={!selectedSession}
                onClick={() => setStep("details")}
                className="px-10 py-4 bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                Continue to Booking
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "details" && selected && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <button
              onClick={() => setStep("select")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to session selection
            </button>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-serif font-bold mb-2">{selected.name}</h2>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-serif font-bold gold-gradient">{selected.price}</span>
                  {selected.priceNote && <span className="text-sm text-muted-foreground">{selected.priceNote}</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{selected.duration}</p>
                <p className="text-muted-foreground leading-relaxed mb-8">{selected.description}</p>

                <div className="p-6 rounded-lg luxury-border bg-card">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h4 className="font-medium text-sm">Payment</h4>
                  </div>
                  {stripeConfigured ? (
                    <>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Secure payment processing powered by Stripe. You can pay immediately after submitting your booking request.
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`${import.meta.env.BASE_URL}../api/stripe/checkout`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ session: selectedSession, price: selected?.price }),
                            });
                            const data = await res.json();
                            if (data.url) window.location.href = data.url;
                          } catch {}
                        }}
                        className="mt-4 w-full py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay with Stripe
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Payment will be arranged after your consultation request is confirmed by our team.
                        We accept wire transfer, ACH, and major credit cards. Invoicing available for retainer engagements.
                      </p>
                      <a href="mailto:inquiries@carlotajo.com?subject=Payment%20Inquiry%20-%20Consultation%20Booking" className="mt-4 w-full py-3 border border-primary/20 text-primary text-sm font-medium rounded-sm hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        Contact to Book
                      </a>
                    </>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-8 rounded-lg luxury-border bg-card">
                <h3 className="text-lg font-serif font-semibold mb-2">Your Details</h3>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Email</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Company / Organization</label>
                  <input
                    type="text"
                    autoComplete="organization"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    Preferred Date Range
                  </label>
                  <input
                    type="text"
                    value={form.datePreference}
                    onChange={(e) => setForm((f) => ({ ...f, datePreference: e.target.value }))}
                    className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g., Week of March 15, or Q2 2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Brief Description</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="Tell us about your objectives and what you'd like to accomplish in this session..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Submitting..." : "Request Consultation"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {step === "confirmed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-lg mx-auto"
          >
            <div className="p-12 rounded-lg luxury-border bg-card">
              <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-serif font-bold mb-4">Consultation Requested</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Thank you for your interest in working with Carlota Jo Consulting.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                A member of our advisory team will review your request and reach out within one business day
                to confirm scheduling and next steps.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-3 border border-primary/20 text-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-primary/5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Home
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function Mail({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}
