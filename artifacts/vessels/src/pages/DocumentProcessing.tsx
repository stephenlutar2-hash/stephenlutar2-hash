import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, CheckCircle2, Clock, Ship, Calendar,
  AlertTriangle, Anchor, ClipboardList, ChevronDown, ChevronUp
} from "lucide-react";

interface ProcessedDocument {
  id: number;
  type: "bol" | "charter" | "psc";
  fileName: string;
  processedAt: string;
  status: "completed" | "processing";
  vesselName: string;
  extracted: Record<string, string>;
  complianceItems: string[];
  keyDates: { label: string; date: string }[];
}

const typeConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  bol: { label: "Bill of Lading", color: "text-cyan-400", icon: FileText },
  charter: { label: "Charter Party", color: "text-emerald-400", icon: ClipboardList },
  psc: { label: "Port State Control", color: "text-amber-400", icon: Anchor },
};

const documents: ProcessedDocument[] = [
  {
    id: 1, type: "bol", fileName: "BOL-MSCPAC-2026-0342.pdf", processedAt: "2026-03-24T10:30:00Z", status: "completed", vesselName: "MV Pacific Horizon",
    extracted: { "Shipper": "Shandong Steel Corp.", "Consignee": "ArcelorMittal Rotterdam", "Cargo": "Hot Rolled Coil Steel — 42,500 MT", "Loading Port": "Qingdao, China", "Discharge Port": "Rotterdam, Netherlands", "B/L Number": "MSCQD2026034281" },
    complianceItems: ["Cargo declaration verified against manifest", "Dangerous goods: None declared", "Weight verification certificate attached"],
    keyDates: [{ label: "Loading Date", date: "2026-03-20" }, { label: "ETA Discharge", date: "2026-04-18" }, { label: "B/L Issue Date", date: "2026-03-21" }],
  },
  {
    id: 2, type: "charter", fileName: "CP-TIMECHARTER-JADV-2026.pdf", processedAt: "2026-03-23T14:15:00Z", status: "completed", vesselName: "MV Jade Venture",
    extracted: { "Charterer": "Cargill Ocean Transportation", "Owner": "SZL Maritime Holdings", "Charter Type": "Time Charter — 12 months", "Daily Rate": "$18,500/day", "Delivery Port": "Singapore", "Redelivery Range": "Japan/Korea range" },
    complianceItems: ["BIMCO standard clauses incorporated", "Sanctions compliance clause §14.2 verified", "Environmental compliance addendum attached", "CII performance clause included — Rating C minimum"],
    keyDates: [{ label: "Charter Start", date: "2026-04-01" }, { label: "Charter End", date: "2027-03-31" }, { label: "First Hire Payment", date: "2026-04-15" }],
  },
  {
    id: 3, type: "psc", fileName: "PSC-INSPECTION-CS-YOKO-2026.pdf", processedAt: "2026-03-22T09:00:00Z", status: "completed", vesselName: "MV Coral Seas",
    extracted: { "Inspection Port": "Yokohama, Japan", "Inspector": "Tokyo MOU — Inspector Tanaka", "Overall Result": "No Detentions", "Deficiencies Found": "2 (non-detainable)", "Next Inspection Due": "2026-09-22", "Ship Risk Profile": "Low Risk" },
    complianceItems: ["Fire safety equipment — 1 extinguisher due for service (14 days to rectify)", "Navigation lights — port side light intensity below minimum (7 days to rectify)", "ISM Code compliance verified", "ISPS Code compliance verified"],
    keyDates: [{ label: "Inspection Date", date: "2026-03-22" }, { label: "Deficiency Deadline", date: "2026-04-05" }, { label: "Next Inspection", date: "2026-09-22" }],
  },
];

export default function DocumentProcessing() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Shipping Document Intelligence</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Document Processing</h2>
        </div>
        <span className="text-xs font-mono text-gray-500">{documents.length} documents processed</span>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging ? "border-cyan-400 bg-cyan-500/5" : "border-white/10 hover:border-cyan-500/30"}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); }}
      >
        <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? "text-cyan-400" : "text-gray-600"}`} />
        <h3 className="text-sm font-semibold text-white mb-1">Upload Shipping Documents</h3>
        <p className="text-xs text-gray-500">Bills of Lading, Charter Party agreements, Port State Control reports</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <span key={key} className={`text-[10px] font-mono ${cfg.color} bg-white/[0.03] px-2 py-1 rounded`}>{cfg.label}</span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {documents.map((doc, idx) => {
          const cfg = typeConfig[doc.type];
          const Icon = cfg.icon;
          const isExpanded = expandedId === doc.id;
          return (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
              <div className="p-5 cursor-pointer hover:bg-white/[0.01] transition-colors" onClick={() => setExpandedId(isExpanded ? null : doc.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{doc.fileName}</h4>
                      <p className="text-xs text-gray-500">
                        <Ship className="w-3 h-3 inline mr-1" />{doc.vesselName} · {cfg.label} · {new Date(doc.processedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> EXTRACTED
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5">
                    <div className="p-5 space-y-5">
                      <div>
                        <h5 className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Extracted Fields</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(doc.extracted).map(([k, v]) => (
                            <div key={k} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                              <p className="text-[10px] text-gray-500 uppercase mb-1">{k}</p>
                              <p className="text-sm text-white font-medium">{v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <h5 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" /> Compliance Items
                          </h5>
                          <ul className="space-y-1.5">
                            {doc.complianceItems.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-cyan-400" /> Key Dates
                          </h5>
                          <div className="space-y-2">
                            {doc.keyDates.map((d, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded bg-white/[0.02]">
                                <span className="text-xs text-gray-400">{d.label}</span>
                                <span className="text-xs font-mono text-white">{d.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
