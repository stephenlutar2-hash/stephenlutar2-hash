import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, LogOut, Menu, X, BarChart3, TrendingUp,
  Eye, MousePointer, Share2, Clock, ArrowUpRight, ArrowDownRight,
  Layers, Target, Zap, Users
} from "lucide-react";

const engagementData = [
  { month: "Oct", views: 45000, shares: 2100, ctr: 3.2 },
  { month: "Nov", views: 52000, shares: 2800, ctr: 3.8 },
  { month: "Dec", views: 68000, shares: 4200, ctr: 4.1 },
  { month: "Jan", views: 72000, shares: 4800, ctr: 4.5 },
  { month: "Feb", views: 89000, shares: 5600, ctr: 4.9 },
  { month: "Mar", views: 125000, shares: 7200, ctr: 5.3 },
];

const abTestData = [
  {
    id: "ab1", name: "Hero CTA Color Test",
    variantA: { name: "Blue CTA", clicks: 2340, conversions: 187, rate: 7.99 },
    variantB: { name: "Purple CTA", clicks: 2890, conversions: 245, rate: 8.48 },
    winner: "B", status: "completed", confidence: 94.2,
  },
  {
    id: "ab2", name: "Email Subject Line",
    variantA: { name: "Direct Approach", clicks: 1560, conversions: 98, rate: 6.28 },
    variantB: { name: "Question Format", clicks: 1890, conversions: 142, rate: 7.51 },
    winner: "B", status: "completed", confidence: 88.7,
  },
  {
    id: "ab3", name: "Landing Page Layout",
    variantA: { name: "Single Column", clicks: 890, conversions: 0, rate: 0 },
    variantB: { name: "Two Column Grid", clicks: 920, conversions: 0, rate: 0 },
    winner: null, status: "running", confidence: 0,
  },
];

const kpiCards = [
  { label: "Total Views", value: "451K", trend: "+23%", up: true, icon: Eye, color: "from-violet-500 to-purple-600" },
  { label: "Click-through Rate", value: "5.3%", trend: "+0.4%", up: true, icon: MousePointer, color: "from-blue-500 to-cyan-500" },
  { label: "Social Shares", value: "26.7K", trend: "+18%", up: true, icon: Share2, color: "from-cyan-500 to-teal-500" },
  { label: "Avg. Session Time", value: "4m 32s", trend: "-12s", up: false, icon: Clock, color: "from-amber-500 to-orange-500" },
  { label: "Active Campaigns", value: "8", trend: "+2", up: true, icon: Target, color: "from-emerald-500 to-green-500" },
  { label: "Audience Growth", value: "+2.4K", trend: "+15%", up: true, icon: Users, color: "from-pink-500 to-rose-500" },
];

const maxViews = Math.max(...engagementData.map(d => d.views));

export default function CampaignAnalytics() {
  const [, setLocation] = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [chartMetric, setChartMetric] = useState<"views" | "shares" | "ctr">("views");

  function logout() {
    const token = localStorage.getItem("szl_token");
    if (token) fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  const chartMax = chartMetric === "views" ? maxViews : chartMetric === "shares" ? 8000 : 6;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center cursor-pointer" onClick={() => setLocation("/dashboard")}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-wider">DREAMERA</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Campaign Analytics</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Dashboard</Link>
            <Link href="/content-pipeline" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Pipeline</Link>
            <Link href="/campaign-analytics" className="px-3 py-2 rounded-lg text-sm bg-violet-500/10 text-violet-400 border border-violet-500/20">Analytics</Link>
            <Link href="/content-calendar" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Calendar</Link>
            <Link href="/story-intelligence" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Intelligence</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/5"
            >
              <div className="px-4 py-3 space-y-1">
                <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Dashboard</Link>
                <Link href="/content-pipeline" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Pipeline</Link>
                <Link href="/campaign-analytics" className="block px-3 py-2 rounded-lg text-sm bg-violet-500/10 text-violet-400 border border-violet-500/20">Analytics</Link>
                <Link href="/content-calendar" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Calendar</Link>
                <Link href="/story-intelligence" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Intelligence</Link>
                <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
            Campaign Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">Performance metrics, engagement trends, and A/B test results</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpiCards.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.12)" }}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/5 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center group-hover:shadow-lg transition-shadow`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`flex items-center gap-0.5 text-[10px] font-medium ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.trend}
                </span>
              </div>
              <p className="text-xl font-bold text-white">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white/[0.02] border border-white/5 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Engagement Trends</h3>
            </div>
            <div className="flex gap-1">
              {(["views", "shares", "ctr"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider border transition ${
                    chartMetric === m
                      ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {m === "ctr" ? "CTR %" : m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {engagementData.map((d, i) => {
              const val = d[chartMetric];
              const height = (val / chartMax) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-mono">
                    {chartMetric === "ctr" ? `${val}%` : val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val}
                  </span>
                  <motion.div
                    className="w-full rounded-t-lg bg-gradient-to-t from-violet-500/60 to-blue-500/40 relative group cursor-pointer"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: "easeOut" }}
                    whileHover={{ opacity: 0.9 }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded bg-white/10 backdrop-blur-sm text-[9px] text-white whitespace-nowrap">
                      {chartMetric === "ctr" ? `${val}%` : val.toLocaleString()}
                    </div>
                  </motion.div>
                  <span className="text-[10px] text-gray-600">{d.month}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">A/B Test Comparison</h3>
          </div>
          <div className="divide-y divide-white/5">
            {abTestData.map((test, idx) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + idx * 0.06 }}
                className="p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">{test.name}</h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border mt-1 inline-block ${
                      test.status === "completed" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-blue-400 bg-blue-500/10 border-blue-500/20"
                    }`}>
                      {test.status} {test.confidence > 0 && `· ${test.confidence}% confidence`}
                    </span>
                  </div>
                  {test.winner && (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-bold">Winner: Variant {test.winner}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[test.variantA, test.variantB].map((variant, vi) => {
                    const isWinner = test.winner === (vi === 0 ? "A" : "B");
                    return (
                      <div
                        key={vi}
                        className={`p-4 rounded-xl border transition-all ${
                          isWinner ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/[0.02] border-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-white">Variant {vi === 0 ? "A" : "B"}: {variant.name}</span>
                          {isWinner && <span className="text-[9px] text-emerald-400 font-bold uppercase">Winner</span>}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Clicks</p>
                            <p className="text-lg font-bold text-white">{variant.clicks.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Conversions</p>
                            <p className="text-lg font-bold text-white">{variant.conversions || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Conv. Rate</p>
                            <p className={`text-lg font-bold ${isWinner ? "text-emerald-400" : "text-white"}`}>
                              {variant.rate > 0 ? `${variant.rate}%` : "—"}
                            </p>
                          </div>
                        </div>
                        {variant.rate > 0 && (
                          <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${isWinner ? "bg-emerald-500" : "bg-violet-500/60"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${variant.rate * 10}%` }}
                              transition={{ duration: 0.8, delay: 0.4 }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
