import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Crosshair, FileText, ChevronRight, Shield } from "lucide-react";

const stages = [
  { id: "triage", label: "Triage", icon: Shield, color: "#ef4444", description: "Classify severity and identify affected systems" },
  { id: "investigate", label: "Investigate", icon: Search, color: "#f59e0b", description: "Gather evidence and determine root cause" },
  { id: "contain", label: "Contain", icon: Crosshair, color: "#8b5cf6", description: "Isolate threats and prevent lateral movement" },
  { id: "report", label: "Report", icon: FileText, color: "#10b981", description: "Document findings and close the loop" },
];

export default function SocWorkflow({ activeStage, onStageChange }: { activeStage?: string; onStageChange?: (stage: string) => void }) {
  const [current, setCurrent] = useState(activeStage || "triage");

  function handleClick(id: string) {
    setCurrent(id);
    onStageChange?.(id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
    >
      <div className="flex items-center gap-1">
        {stages.map((stage, i) => {
          const active = current === stage.id;
          const Icon = stage.icon;
          return (
            <div key={stage.id} className="flex items-center flex-1">
              <button
                onClick={() => handleClick(stage.id)}
                className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  active ? "bg-white/[0.05] border border-white/10" : "hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: active ? `${stage.color}20` : "rgba(255,255,255,0.05)",
                    borderColor: active ? `${stage.color}40` : "transparent",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: active ? stage.color : "#6b7280" }} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${active ? "text-white" : "text-gray-500"}`}>
                  {stage.label}
                </span>
                {active && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-[9px] text-gray-500 text-center"
                  >
                    {stage.description}
                  </motion.p>
                )}
              </button>
              {i < stages.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0 mx-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
