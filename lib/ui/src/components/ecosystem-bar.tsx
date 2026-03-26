import { useState, useEffect, useRef } from "react";

const ECOSYSTEM_APPS = [
  { name: "SZL Holdings", path: "/szl-holdings/", color: "#d4a84b", category: "hub" },
  { name: "ROSIE", path: "/rosie/", color: "#06b6d4", category: "security" },
  { name: "Aegis", path: "/aegis/", color: "#f59e0b", category: "security" },
  { name: "Firestorm", path: "/firestorm/", color: "#ef4444", category: "security" },
  { name: "Beacon", path: "/beacon/", color: "#3b82f6", category: "analytics" },
  { name: "Nimbus", path: "/nimbus/", color: "#8b5cf6", category: "ai" },
  { name: "INCA", path: "/inca/", color: "#6366f1", category: "ai" },
  { name: "Lyte", path: "/lyte/", color: "#10b981", category: "operations" },
  { name: "Zeus", path: "/zeus/", color: "#f97316", category: "architecture" },
  { name: "Lutar", path: "/lutar/", color: "#ec4899", category: "operations" },
  { name: "AlloyScape", path: "/alloyscape/", color: "#14b8a6", category: "operations" },
  { name: "Vessels", path: "/vessels/", color: "#0ea5e9", category: "maritime" },
  { name: "DreamEra", path: "/dreamera/", color: "#a855f7", category: "creative" },
  { name: "Dreamscape", path: "/dreamscape/", color: "#d946ef", category: "creative" },
  { name: "Career", path: "/career/", color: "#22c55e", category: "business" },
  { name: "Carlota Jo", path: "/carlota-jo/", color: "#7c3aed", category: "business" },
  { name: "Readiness", path: "/readiness-report/", color: "#64748b", category: "business" },
  { name: "Showcase", path: "/apps-showcase/", color: "#d4a84b", category: "hub" },
];

export interface EcosystemBarProps {
  currentApp?: string;
  position?: "top" | "bottom";
  variant?: "full" | "compact";
}

export function EcosystemBar({ currentApp, position = "top", variant = "compact" }: EcosystemBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (position !== "top") return;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 200 && currentY > lastScrollY.current) {
        setIsVisible(false);
        setIsExpanded(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [position]);

  useEffect(() => {
    if (!isExpanded) return;
    const handleClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isExpanded]);

  const currentBasePath = typeof window !== "undefined" ? window.location.pathname.split("/").filter(Boolean)[0] : "";

  return (
    <div
      ref={barRef}
      style={{
        position: "fixed",
        [position]: 0,
        left: 0,
        right: 0,
        zIndex: 9990,
        transform: isVisible ? "translateY(0)" : (position === "top" ? "translateY(-100%)" : "translateY(100%)"),
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, rgba(10,10,15,0.97) 0%, rgba(15,12,25,0.97) 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: position === "top" ? "1px solid rgba(212,168,75,0.15)" : "none",
          borderTop: position === "bottom" ? "1px solid rgba(212,168,75,0.15)" : "none",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: "32px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}>
          <button
            onClick={() => { window.location.href = "/szl-holdings/"; }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#d4a84b",
              textTransform: "uppercase" as const,
            }}>SZL</span>
            <span style={{
              fontSize: "10px",
              fontWeight: 400,
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase" as const,
            }}>Ecosystem</span>
          </button>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            overflow: "hidden",
          }}>
            {ECOSYSTEM_APPS.slice(0, variant === "compact" ? 8 : 18).map((app) => {
              const isActive = currentApp === app.name || currentBasePath === app.path.replace(/\//g, "");
              return (
                <a
                  key={app.name}
                  href={app.path}
                  title={app.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: isActive ? app.color : "rgba(255,255,255,0.15)",
                    border: isActive ? `1px solid ${app.color}` : "1px solid transparent",
                    boxShadow: isActive ? `0 0 8px ${app.color}40` : "none",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = app.color;
                    (e.target as HTMLElement).style.transform = "scale(1.8)";
                    (e.target as HTMLElement).style.boxShadow = `0 0 12px ${app.color}60`;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.target as HTMLElement).style.background = "rgba(255,255,255,0.15)";
                      (e.target as HTMLElement).style.boxShadow = "none";
                    }
                    (e.target as HTMLElement).style.transform = "scale(1)";
                  }}
                />
              );
            })}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "4px",
              padding: "2px 8px",
              cursor: "pointer",
              fontSize: "9px",
              fontWeight: 500,
              letterSpacing: "0.05em",
              color: "rgba(255,255,255,0.5)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderColor = "rgba(212,168,75,0.4)";
              (e.target as HTMLElement).style.color = "#d4a84b";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
              (e.target as HTMLElement).style.color = "rgba(255,255,255,0.5)";
            }}
          >
            {isExpanded ? "Close" : "All Apps"}
          </button>
        </div>

        {isExpanded && (
          <div style={{
            borderTop: "1px solid rgba(212,168,75,0.1)",
            padding: "16px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "8px",
            }}>
              {ECOSYSTEM_APPS.map((app) => {
                const isActive = currentApp === app.name || currentBasePath === app.path.replace(/\//g, "");
                return (
                  <a
                    key={app.name}
                    href={app.path}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: isActive ? `${app.color}15` : "rgba(255,255,255,0.03)",
                      border: isActive ? `1px solid ${app.color}40` : "1px solid rgba(255,255,255,0.06)",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = `${app.color}10`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${app.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                      }
                    }}
                  >
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: app.color,
                      flexShrink: 0,
                      boxShadow: `0 0 8px ${app.color}40`,
                    }} />
                    <div>
                      <div style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: isActive ? app.color : "rgba(255,255,255,0.85)",
                        lineHeight: 1.2,
                      }}>{app.name}</div>
                    </div>
                  </a>
                );
              })}
            </div>
            <div style={{
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "center",
              gap: "24px",
            }}>
              <a href="/apps-showcase/" style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                letterSpacing: "0.05em",
              }}>Full Catalog</a>
              <a href="/szl-holdings/#contact" style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                letterSpacing: "0.05em",
              }}>Contact</a>
              <a href="/szl-holdings/press" style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                letterSpacing: "0.05em",
              }}>Press Kit</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
