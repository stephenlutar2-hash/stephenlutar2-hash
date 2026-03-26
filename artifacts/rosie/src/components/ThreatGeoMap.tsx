import { useState } from "react";
import { motion } from "framer-motion";

interface ThreatOrigin {
  id: string;
  country: string;
  code: string;
  x: number;
  y: number;
  threats: number;
  severity: "critical" | "high" | "medium" | "low";
  topAttack: string;
}

const threatOrigins: ThreatOrigin[] = [
  { id: "ru", country: "Russia", code: "RU", x: 560, y: 110, threats: 1247, severity: "critical", topAttack: "APT29 Activity" },
  { id: "cn", country: "China", code: "CN", x: 650, y: 170, threats: 983, severity: "critical", topAttack: "Supply Chain" },
  { id: "kp", country: "North Korea", code: "KP", x: 690, y: 160, threats: 412, severity: "high", topAttack: "Ransomware" },
  { id: "ir", country: "Iran", code: "IR", x: 530, y: 180, threats: 367, severity: "high", topAttack: "Wiper Malware" },
  { id: "br", country: "Brazil", code: "BR", x: 280, y: 300, threats: 198, severity: "medium", topAttack: "Banking Trojan" },
  { id: "ng", country: "Nigeria", code: "NG", x: 420, y: 250, threats: 156, severity: "medium", topAttack: "BEC Fraud" },
  { id: "us", country: "United States", code: "US", x: 180, y: 160, threats: 89, severity: "low", topAttack: "Insider Threat" },
  { id: "de", country: "Germany", code: "DE", x: 460, y: 130, threats: 67, severity: "low", topAttack: "Credential Stuffing" },
];

const severityColors = {
  critical: { fill: "#ef4444", pulse: "rgba(239,68,68,0.4)", text: "text-red-400" },
  high: { fill: "#f97316", pulse: "rgba(249,115,22,0.4)", text: "text-orange-400" },
  medium: { fill: "#eab308", pulse: "rgba(234,179,8,0.3)", text: "text-yellow-400" },
  low: { fill: "#06b6d4", pulse: "rgba(6,182,212,0.3)", text: "text-cyan-400" },
};

const worldPath = "M 95,145 L 110,130 L 130,125 L 145,130 L 160,120 L 180,115 L 195,120 L 210,110 L 220,115 L 235,108 L 250,115 L 260,120 L 270,125 L 265,140 L 255,155 L 245,175 L 250,195 L 260,210 L 270,230 L 280,250 L 295,270 L 300,290 L 295,310 L 280,325 L 265,335 L 260,320 L 270,300 L 265,280 L 255,260 L 245,245 L 235,235 L 225,225 L 215,215 L 200,200 L 185,190 L 170,185 L 155,175 L 140,170 L 125,165 L 110,160 L 100,155 Z M 350,80 L 370,75 L 390,80 L 410,75 L 430,80 L 445,90 L 460,95 L 475,100 L 490,110 L 500,120 L 510,130 L 505,145 L 495,155 L 480,160 L 465,155 L 450,150 L 435,145 L 420,140 L 405,135 L 395,125 L 385,115 L 375,105 L 365,95 L 355,90 Z M 510,130 L 530,120 L 550,115 L 570,110 L 590,115 L 610,120 L 630,130 L 650,140 L 670,150 L 690,155 L 710,160 L 720,170 L 715,185 L 700,195 L 680,200 L 660,195 L 640,190 L 620,185 L 600,180 L 580,175 L 560,170 L 540,165 L 525,155 L 515,145 Z M 400,155 L 420,160 L 440,170 L 460,175 L 480,185 L 495,195 L 505,210 L 510,230 L 500,250 L 485,260 L 470,255 L 455,245 L 440,235 L 425,225 L 415,210 L 405,195 L 400,175 Z M 640,280 L 660,270 L 680,265 L 700,270 L 720,280 L 735,295 L 740,310 L 735,325 L 720,335 L 700,330 L 685,320 L 670,310 L 660,300 L 650,290 Z";

export default function ThreatGeoMap() {
  const [hovered, setHovered] = useState<ThreatOrigin | null>(null);
  const totalThreats = threatOrigins.reduce((a, b) => a + b.threats, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-violet-500/[0.02] pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-white tracking-wide uppercase">
              Global Threat Origins
            </h3>
            <p className="text-xs text-gray-500 mt-1">{totalThreats.toLocaleString()} threats tracked across {threatOrigins.length} origins</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[10px] font-mono text-red-400">TRACKING</span>
          </div>
        </div>

        <div className="relative w-full rounded-xl bg-[#060a10] border border-white/5 overflow-hidden" style={{ aspectRatio: "2.4" }}>
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(6,182,212,0.08) 1px, transparent 0)", backgroundSize: "20px 20px" }} />

          <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              {threatOrigins.map(t => (
                <radialGradient key={`grad-${t.id}`} id={`threat-${t.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={severityColors[t.severity].fill} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={severityColors[t.severity].fill} stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>

            <path d={worldPath} fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="1" />

            {threatOrigins.map((t, i) => {
              const size = Math.max(12, Math.min(30, t.threats / 50));
              return (
                <g key={t.id}
                  onMouseEnter={() => setHovered(t)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                >
                  <circle cx={t.x} cy={t.y} r={size} fill={`url(#threat-${t.id})`}>
                    <animate attributeName="r" values={`${size * 0.8};${size * 1.3};${size * 0.8}`} dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.4;0.8" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={t.x} cy={t.y} r="3" fill={severityColors[t.severity].fill} />
                  <text x={t.x} y={t.y - size - 4} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">
                    {t.code}
                  </text>
                  <text x={t.x} y={t.y + size + 10} textAnchor="middle" fill={severityColors[t.severity].fill} fontSize="7" fontFamily="monospace" opacity="0.8">
                    {t.threats}
                  </text>
                </g>
              );
            })}
          </svg>

          {hovered && (
            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-black/80 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${severityColors[hovered.severity].text}`}>{hovered.country}</span>
                  <span className="text-[10px] font-mono text-gray-500">{hovered.code}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white">{hovered.threats.toLocaleString()} threats</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${severityColors[hovered.severity].text} bg-white/5 border border-white/10`}>
                    {hovered.severity}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Top attack vector: {hovered.topAttack}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4 text-[10px] font-mono">
            {Object.entries(severityColors).map(([sev, c]) => (
              <span key={sev} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.fill }} />
                <span className="text-gray-500 capitalize">{sev}</span>
              </span>
            ))}
          </div>
          <span className="text-[10px] text-gray-500 font-mono">Updated 2 min ago</span>
        </div>
      </div>
    </motion.div>
  );
}
