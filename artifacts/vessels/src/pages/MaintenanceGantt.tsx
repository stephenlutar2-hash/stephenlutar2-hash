import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const MAINTENANCE_EVENTS = [
  { id: 1, vessel: "MV Atlantic Pioneer", task: "Hull Inspection", scheduled: "2026-01-15", actual: "2026-01-18", duration: 5, status: "completed", category: "hull" },
  { id: 2, vessel: "MV Atlantic Pioneer", task: "Engine Overhaul", scheduled: "2026-03-01", actual: null, duration: 14, status: "scheduled", category: "engine" },
  { id: 3, vessel: "MV Pacific Star", task: "Propeller Service", scheduled: "2026-02-10", actual: "2026-02-10", duration: 3, status: "completed", category: "propulsion" },
  { id: 4, vessel: "MV Pacific Star", task: "Safety Equipment Check", scheduled: "2026-04-05", actual: null, duration: 2, status: "scheduled", category: "safety" },
  { id: 5, vessel: "MV Nordic Spirit", task: "Ballast System Maintenance", scheduled: "2026-01-20", actual: "2026-01-22", duration: 4, status: "completed", category: "systems" },
  { id: 6, vessel: "MV Nordic Spirit", task: "Navigation System Update", scheduled: "2026-03-15", actual: null, duration: 1, status: "in-progress", category: "electronics" },
  { id: 7, vessel: "MV Southern Cross", task: "Dry Docking", scheduled: "2026-05-01", actual: null, duration: 21, status: "scheduled", category: "hull" },
  { id: 8, vessel: "MV Southern Cross", task: "Cargo Hold Cleaning", scheduled: "2026-02-28", actual: "2026-02-28", duration: 2, status: "completed", category: "cargo" },
  { id: 9, vessel: "MV Eastern Wind", task: "Engine Oil Change", scheduled: "2026-03-20", actual: null, duration: 1, status: "overdue", category: "engine" },
  { id: 10, vessel: "MV Gulf Trader", task: "Coating Inspection", scheduled: "2026-04-10", actual: null, duration: 3, status: "scheduled", category: "hull" },
];

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  completed: { color: "text-emerald-400", bg: "bg-emerald-500", border: "border-emerald-500/20" },
  "in-progress": { color: "text-amber-400", bg: "bg-amber-500", border: "border-amber-500/20" },
  scheduled: { color: "text-cyan-400", bg: "bg-cyan-500", border: "border-cyan-500/20" },
  overdue: { color: "text-red-400", bg: "bg-red-500", border: "border-red-500/20" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const TIMELINE_START = new Date("2026-01-01").getTime();
const TIMELINE_END = new Date("2026-07-01").getTime();
const TIMELINE_RANGE = TIMELINE_END - TIMELINE_START;

function dateToPercent(dateStr: string) {
  const d = new Date(dateStr).getTime();
  return Math.max(0, Math.min(100, ((d - TIMELINE_START) / TIMELINE_RANGE) * 100));
}

export default function MaintenanceGantt() {
  const vessels = [...new Set(MAINTENANCE_EVENTS.map(e => e.vessel))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
          <Wrench className="w-5 h-5 text-amber-400" />
          Maintenance Planner
        </h2>
        <p className="text-sm text-gray-500 mt-1">Gantt-style timeline for scheduled vs actual maintenance</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Completed", value: MAINTENANCE_EVENTS.filter(e => e.status === "completed").length, icon: CheckCircle, color: "text-emerald-400" },
          { label: "In Progress", value: MAINTENANCE_EVENTS.filter(e => e.status === "in-progress").length, icon: Clock, color: "text-amber-400" },
          { label: "Scheduled", value: MAINTENANCE_EVENTS.filter(e => e.status === "scheduled").length, icon: Calendar, color: "text-cyan-400" },
          { label: "Overdue", value: MAINTENANCE_EVENTS.filter(e => e.status === "overdue").length, icon: AlertTriangle, color: "text-red-400" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl border border-white/[0.06] backdrop-blur-md"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
          >
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/[0.06] overflow-hidden backdrop-blur-md"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
      >
        <div className="p-4 border-b border-white/5">
          <h3 className="font-display font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" /> Timeline View
          </h3>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="flex border-b border-white/5">
              <div className="w-48 shrink-0 p-3 text-xs text-gray-500 uppercase">Vessel</div>
              <div className="flex-1 flex">
                {MONTHS.map(m => (
                  <div key={m} className="flex-1 p-3 text-xs text-gray-500 text-center border-l border-white/5">{m} 2026</div>
                ))}
              </div>
            </div>

            {vessels.map((vessel, vi) => {
              const events = MAINTENANCE_EVENTS.filter(e => e.vessel === vessel);
              return (
                <div key={vessel} className="flex border-b border-white/5 hover:bg-white/[0.02]">
                  <div className="w-48 shrink-0 p-3 text-sm text-white truncate flex items-center">{vessel.replace("MV ", "")}</div>
                  <div className="flex-1 relative" style={{ minHeight: 48 }}>
                    {MONTHS.map((_, mi) => (
                      <div key={mi} className="absolute top-0 bottom-0 border-l border-white/5" style={{ left: `${(mi / MONTHS.length) * 100}%` }} />
                    ))}
                    {events.map((event, ei) => {
                      const left = dateToPercent(event.scheduled);
                      const width = Math.max(2, (event.duration / 182) * 100);
                      const sc = statusConfig[event.status];
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: 1, opacity: 1 }}
                          transition={{ delay: vi * 0.05 + ei * 0.03, duration: 0.5 }}
                          className={`absolute h-6 rounded ${sc.bg} cursor-pointer group`}
                          style={{ left: `${left}%`, width: `${width}%`, top: `${8 + ei * 14}px`, opacity: 0.7, transformOrigin: "left" }}
                          title={`${event.task} (${event.status})`}
                        >
                          <div className="absolute -top-8 left-0 hidden group-hover:block z-20 px-3 py-1.5 rounded-lg bg-[#0a0e17]/95 border border-white/10 text-[10px] text-white whitespace-nowrap shadow-xl">
                            <span className="font-bold">{event.task}</span> · {event.duration}d · {event.status}
                          </div>
                        </motion.div>
                      );
                    })}
                    {events.filter(e => e.actual).map((event, ei) => {
                      const left = dateToPercent(event.actual!);
                      const width = Math.max(2, (event.duration / 182) * 100);
                      return (
                        <motion.div
                          key={`actual-${event.id}`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: vi * 0.05 + ei * 0.03 + 0.2, duration: 0.5 }}
                          className="absolute h-6 rounded border-2 border-dashed border-white/30"
                          style={{ left: `${left}%`, width: `${width}%`, top: `${8 + events.indexOf(event) * 14}px`, transformOrigin: "left" }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-3 border-t border-white/5 flex items-center gap-6 text-[10px]">
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-emerald-500" /> Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-amber-500" /> In Progress</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-cyan-500" /> Scheduled</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-red-500" /> Overdue</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded border-2 border-dashed border-white/30" /> Actual</span>
        </div>
      </motion.div>
    </div>
  );
}
