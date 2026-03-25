import { useLocation } from "wouter";
import { Hexagon, ArrowRight, Shield, GitBranch, Activity, Boxes } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const token = localStorage.getItem("szl_token");

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(6,182,212,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.05) 0%, transparent 60%)" }}>
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Hexagon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white">ALLOYSCAPE</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">SZL Holdings</p>
          </div>
        </div>
        <button
          onClick={() => setLocation(token ? "/dashboard" : "/login")}
          className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors flex items-center gap-2"
        >
          {token ? "Dashboard" : "Login"} <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/10 mb-8">
            <Hexagon className="w-10 h-10 text-cyan-400/60" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">AlloyScape</h2>
          <p className="text-xs text-cyan-400/60 font-mono tracking-widest uppercase mb-4">Infrastructure Operations Platform</p>
          <p className="text-gray-400 text-base max-w-lg mx-auto mb-10">
            The management interface for the Alloy AI engine. Monitor orchestration, system modules, workflows, and service health across the entire SZL Holdings portfolio.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto mb-10">
            {[
              { icon: Shield, label: "Security", color: "from-red-500/20 to-orange-500/20" },
              { icon: GitBranch, label: "Orchestration", color: "from-violet-500/20 to-purple-500/20" },
              { icon: Activity, label: "Monitoring", color: "from-emerald-500/20 to-green-500/20" },
              { icon: Boxes, label: "Modules", color: "from-cyan-500/20 to-blue-500/20" },
            ].map(item => (
              <div key={item.label} className={`p-4 rounded-xl bg-gradient-to-br ${item.color} border border-white/5`}>
                <item.icon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setLocation(token ? "/dashboard" : "/login")}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
          >
            {token ? "Enter Dashboard" : "Authenticate"}
          </button>
        </div>
      </main>

      <footer className="p-6 text-center">
        <p className="text-xs text-gray-600">SZL Holdings &middot; AlloyScape Operations Platform &middot; Powered by Alloy Engine</p>
      </footer>
    </div>
  );
}
