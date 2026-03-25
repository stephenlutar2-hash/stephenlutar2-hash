import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Flame, Shield, Eye, FileText, LayoutDashboard, Target, LogOut,
  Download, BarChart3, Clock, TrendingUp, CheckCircle2, Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchReports, downloadExport } from "@/lib/api";

interface Report {
  id: string; title: string; date: string; status: string;
  scenariosRun: number; detectionRate: number; avgResponseTime: string;
  missedDetections: number; responseReadiness: number;
}

interface Summary {
  totalScenarios: number; runningScenarios: number; completedScenarios: number;
  totalEvents: number; avgDetectionRate: number; avgResponseTime: string; overallReadiness: number;
}

const navItems = [
  { icon: LayoutDashboard, label: "Command Center", path: "/dashboard" },
  { icon: Target, label: "Scenario Catalog", path: "/scenarios" },
  { icon: Eye, label: "Detection Validation", path: "/detections" },
  { icon: Shield, label: "Response Trainer", path: "/response-trainer" },
  { icon: FileText, label: "Reports", path: "/reports" },
];

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchReports().then((data) => {
      setReports(data.reports);
      setSummary(data.summary);
    });
  }, []);

  function handleLogout() {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  return (
    <div className="min-h-screen flex bg-[#0c0a08] text-white">
      <aside className="w-64 border-r border-orange-500/10 bg-[#0a0908] flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-orange-500/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-[0.2em]">FIRESTORM</span>
          </Link>
        </div>
        <div className="p-4 flex-1 space-y-1">
          <div className="px-2 mb-4 mt-2"><p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">Simulation Lab</p></div>
          {navItems.map((item) => (
            <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${item.path === "/reports" ? "bg-orange-500/10 text-orange-500" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}>
              <item.icon size={18} /><span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-orange-500/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} /><span className="text-sm font-medium">Disconnect</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 border-b border-orange-500/10 bg-[#0a0908]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-semibold tracking-wide">Simulation Reports</h1>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">LAB MODE</Badge>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => downloadExport("json")} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs font-medium hover:bg-white/10 transition flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> JSON
            </button>
            <button onClick={() => downloadExport("csv")} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs font-medium hover:bg-white/10 transition flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6 flex-1">
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Overall Readiness", value: `${summary.overallReadiness}%`, icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                { label: "Avg Detection Rate", value: `${summary.avgDetectionRate}%`, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
                { label: "Avg Response Time", value: summary.avgResponseTime, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                { label: "Total Events", value: String(summary.totalEvents), icon: BarChart3, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`p-5 rounded-xl border ${stat.border} ${stat.bg}`}>
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs tracking-wider text-gray-500 uppercase">{stat.label}</p>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <h3 className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</h3>
                </motion.div>
              ))}
            </div>
          )}

          <div>
            <h3 className="font-display font-bold text-white tracking-wide uppercase text-sm mb-4">Simulation Reports</h3>
            <div className="space-y-4">
              {reports.map((report, i) => (
                <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-display font-bold text-white">{report.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{report.status}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(report.date).toLocaleDateString()}</span>
                        <span>{report.scenariosRun} scenarios run</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Detection Rate", value: `${report.detectionRate}%`, color: report.detectionRate >= 90 ? "text-emerald-400" : "text-amber-400" },
                        { label: "Response Time", value: report.avgResponseTime, color: "text-cyan-400" },
                        { label: "Missed", value: String(report.missedDetections), color: report.missedDetections <= 2 ? "text-emerald-400" : "text-red-400" },
                        { label: "Readiness", value: `${report.responseReadiness}%`, color: report.responseReadiness >= 85 ? "text-emerald-400" : "text-amber-400" },
                      ].map((m, j) => (
                        <div key={j} className="text-center">
                          <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-1">{m.label}</p>
                          <p className={`text-lg font-display font-bold ${m.color}`}>{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {summary && (
            <div className="p-6 rounded-xl border border-orange-500/20 bg-orange-500/5">
              <h3 className="font-display font-bold text-white tracking-wide uppercase text-sm mb-4">Platform Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-1">Total Scenarios</p>
                  <p className="text-2xl font-display font-bold text-white">{summary.totalScenarios}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-1">Currently Running</p>
                  <p className="text-2xl font-display font-bold text-orange-400">{summary.runningScenarios}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-1">Completed</p>
                  <p className="text-2xl font-display font-bold text-emerald-400">{summary.completedScenarios}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-1">Total Events</p>
                  <p className="text-2xl font-display font-bold text-cyan-400">{summary.totalEvents}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
