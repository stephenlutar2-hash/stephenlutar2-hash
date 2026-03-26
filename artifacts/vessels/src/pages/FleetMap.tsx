import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Navigation, Anchor, Info, X, Wind, Compass } from "lucide-react";

const VESSELS_DATA = [
  { id: 1, name: "MV Atlantic Pioneer", lat: 40.7, lng: -30.2, status: "en-route", speed: 14.2, heading: 85, destination: "Rotterdam", cargo: "Container", imo: "9876543" },
  { id: 2, name: "MV Pacific Star", lat: 35.1, lng: -60.8, status: "en-route", speed: 12.8, heading: 45, destination: "New York", cargo: "Bulk", imo: "9876544" },
  { id: 3, name: "MV Nordic Spirit", lat: 55.9, lng: 5.2, status: "at-port", speed: 0, heading: 180, destination: "Hamburg", cargo: "Tanker", imo: "9876545" },
  { id: 4, name: "MV Southern Cross", lat: -33.8, lng: 18.4, status: "en-route", speed: 16.1, heading: 270, destination: "Cape Town", cargo: "Container", imo: "9876546" },
  { id: 5, name: "MV Eastern Wind", lat: 22.3, lng: 114.1, status: "at-port", speed: 0, heading: 90, destination: "Hong Kong", cargo: "RoRo", imo: "9876547" },
  { id: 6, name: "MV Gulf Trader", lat: 25.2, lng: 55.3, status: "anchored", speed: 0, heading: 0, destination: "Dubai", cargo: "Tanker", imo: "9876548" },
  { id: 7, name: "MV Arctic Explorer", lat: 64.1, lng: -21.9, status: "en-route", speed: 11.5, heading: 120, destination: "Reykjavik", cargo: "General", imo: "9876549" },
  { id: 8, name: "MV Mediterranean Sun", lat: 36.4, lng: 14.5, status: "en-route", speed: 13.4, heading: 200, destination: "Malta", cargo: "Container", imo: "9876550" },
];

const statusColors: Record<string, { dot: string; label: string; bg: string }> = {
  "en-route": { dot: "bg-emerald-400", label: "text-emerald-400", bg: "bg-emerald-500/10" },
  "at-port": { dot: "bg-cyan-400", label: "text-cyan-400", bg: "bg-cyan-500/10" },
  "anchored": { dot: "bg-amber-400", label: "text-amber-400", bg: "bg-amber-500/10" },
  "maintenance": { dot: "bg-red-400", label: "text-red-400", bg: "bg-red-500/10" },
};

function latToY(lat: number) { return ((90 - lat) / 180) * 50; }
function lngToX(lng: number) { return ((lng + 180) / 360) * 100; }

export default function FleetMap() {
  const [selectedVessel, setSelectedVessel] = useState<typeof VESSELS_DATA[0] | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? VESSELS_DATA : VESSELS_DATA.filter(v => v.status === filter);

  const stats = useMemo(() => ({
    total: VESSELS_DATA.length,
    enRoute: VESSELS_DATA.filter(v => v.status === "en-route").length,
    atPort: VESSELS_DATA.filter(v => v.status === "at-port").length,
    anchored: VESSELS_DATA.filter(v => v.status === "anchored").length,
  }), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
            <Map className="w-5 h-5 text-cyan-400" />
            Fleet Map
          </h2>
          <p className="text-sm text-gray-500 mt-1">Interactive vessel positions and route tracking</p>
        </div>
        <div className="flex gap-2">
          {["all", "en-route", "at-port", "anchored"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                filter === f ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-white/[0.03] text-gray-500 border-white/10 hover:bg-white/[0.06]"
              }`}
            >
              {f === "all" ? "ALL" : f.toUpperCase().replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Fleet", value: stats.total, color: "text-white" },
          { label: "En Route", value: stats.enRoute, color: "text-emerald-400" },
          { label: "At Port", value: stats.atPort, color: "text-cyan-400" },
          { label: "Anchored", value: stats.anchored, color: "text-amber-400" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
          >
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden border border-white/[0.06] relative"
        style={{ background: "linear-gradient(135deg, rgba(8,15,25,0.95) 0%, rgba(10,18,30,0.9) 100%)" }}
      >
        <div className="relative w-full" style={{ paddingBottom: "50%" }}>
          <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.05" />
              </pattern>
            </defs>
            <rect width="100" height="50" fill="url(#grid)" />
            <line x1="50" y1="0" x2="50" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.05" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.05" />

            {filtered.map(v => {
              const x = lngToX(v.lng);
              const y = latToY(v.lat);
              const sc = statusColors[v.status] || statusColors["en-route"];
              const fill = v.status === "en-route" ? "#10b981" : v.status === "at-port" ? "#06b6d4" : "#f59e0b";
              return (
                <g key={v.id} onClick={() => setSelectedVessel(v)} style={{ cursor: "pointer" }}>
                  <circle cx={x} cy={y} r={0.6} fill={fill} fillOpacity={0.3}>
                    <animate attributeName="r" values="0.6;1.2;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r={0.4} fill={fill} />
                  {v.status === "en-route" && (
                    <line
                      x1={x} y1={y}
                      x2={x + Math.cos(v.heading * Math.PI / 180) * 2}
                      y2={y - Math.sin(v.heading * Math.PI / 180) * 1}
                      stroke={fill} strokeWidth={0.1} strokeDasharray="0.3"
                    />
                  )}
                  <text x={x} y={y - 1} textAnchor="middle" fill="white" fontSize="0.6" fontWeight="600">{v.name.split(" ").pop()}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <AnimatePresence>
          {selectedVessel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 w-72 rounded-xl bg-[#0a0e17]/95 border border-cyan-500/20 backdrop-blur-md p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-display font-bold text-white">{selectedVessel.name}</h3>
                <button onClick={() => setSelectedVessel(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">IMO</span><span className="text-white font-mono">{selectedVessel.imo}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span>
                  <span className={`font-mono ${statusColors[selectedVessel.status]?.label}`}>{selectedVessel.status.toUpperCase()}</span>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">Speed</span><span className="text-white font-mono">{selectedVessel.speed} kn</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Heading</span><span className="text-white font-mono">{selectedVessel.heading}°</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Destination</span><span className="text-cyan-400 font-mono">{selectedVessel.destination}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Cargo Type</span><span className="text-white">{selectedVessel.cargo}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Position</span>
                  <span className="text-white font-mono text-[10px]">{selectedVessel.lat.toFixed(2)}°N, {selectedVessel.lng.toFixed(2)}°E</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((v, i) => {
          const sc = statusColors[v.status] || statusColors["en-route"];
          return (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedVessel(v)}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer backdrop-blur-md"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white truncate">{v.name}</span>
                <span className={`w-2 h-2 rounded-full ${sc.dot} ${v.status === "en-route" ? "animate-pulse" : ""}`} />
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><Navigation className="w-3 h-3" />{v.speed} kn</span>
                <span className="flex items-center gap-1"><Compass className="w-3 h-3" />{v.heading}°</span>
              </div>
              <p className="text-[10px] text-cyan-400 mt-1.5 font-mono">→ {v.destination}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
