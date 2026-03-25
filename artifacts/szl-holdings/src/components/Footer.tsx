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

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                <span className="text-background font-bold text-lg">S</span>
              </div>
              <span className="font-semibold tracking-[0.2em] text-sm uppercase">
                SZL Holdings
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              A premium innovation and venture platform building transformative
              technology across security, AI, maritime intelligence, and
              creative industries.
            </p>
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

        <div className="mt-16 pt-8 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} SZL Holdings. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted/60">
              Engineered with precision
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
