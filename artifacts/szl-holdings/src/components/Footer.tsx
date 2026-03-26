import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Linkedin, Github, Twitter, Mail } from "lucide-react";

const footerLinks = [
  {
    title: "Portfolio",
    links: [
      { label: "ROSIE", href: "/" },
      { label: "Aegis", href: "/aegis/" },
      { label: "Beacon", href: "/beacon/" },
      { label: "Nimbus", href: "/nimbus/" },
      { label: "Vessels", href: "/vessels/" },
    ],
  },
  {
    title: "Platforms",
    links: [
      { label: "Zeus", href: "/zeus/" },
      { label: "Firestorm", href: "/firestorm/" },
      { label: "DreamEra", href: "/dreamera/" },
      { label: "Dreamscape", href: "/dreamscape/" },
      { label: "Alloyscape", href: "/alloyscape/" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Carlota Jo Consulting", href: "/carlota-jo/" },
      { label: "Readiness Report", href: "/readiness-report/" },
      { label: "Career", href: "/career/" },
      { label: "App Catalog", href: "/apps-showcase/" },
    ],
  },
];

const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com/company/szlholdings", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/szlholdings", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/szlholdings", label: "Twitter" },
  { icon: Mail, href: "mailto:contact@szlholdings.com", label: "Email" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="border-t border-surface-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="py-16 lg:py-20 border-b border-surface-border">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                  <span className="text-background font-bold text-lg">S</span>
                </div>
                <span className="font-semibold tracking-[0.2em] text-sm uppercase">
                  SZL Holdings
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed max-w-sm mb-8">
                A premium innovation and venture platform building transformative
                technology across security, AI, maritime intelligence, and
                creative industries.
              </p>

              <div className="mb-8">
                <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-gold mb-4">
                  Stay Informed
                </h4>
                {subscribed ? (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-emerald-400"
                  >
                    Thank you for subscribing.
                  </motion.p>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="flex-1 px-4 py-2.5 text-sm bg-background/80 border border-surface-border rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:border-gold/30 transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-gold/15 border border-gold/25 text-gold-light rounded-lg hover:bg-gold/25 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>

              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg border border-surface-border flex items-center justify-center text-muted hover:text-gold-light hover:border-gold/20 transition-all duration-300"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-gold mb-5">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted hover:text-foreground transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} SZL Holdings. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted/60">
            <a href="#" className="hover:text-muted transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-muted transition-colors">Terms of Service</a>
            <span>Engineered with precision</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
