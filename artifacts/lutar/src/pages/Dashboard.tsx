import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Briefcase, 
  Target, 
  ShieldCheck, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Activity,
  ArrowUpRight,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Badge } from "@/components/ui/badge";

const chartData = [
  { month: 'Jan', value: 2.1 },
  { month: 'Feb', value: 2.8 },
  { month: 'Mar', value: 3.2 },
  { month: 'Apr', value: 4.5 },
  { month: 'May', value: 5.1 },
  { month: 'Jun', value: 6.8 },
  { month: 'Jul', value: 7.2 },
  { month: 'Aug', value: 8.5 },
  { month: 'Sep', value: 10.1 },
  { month: 'Oct', value: 12.4 },
  { month: 'Nov', value: 15.2 },
  { month: 'Dec', value: 18.5 },
];

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }) + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="font-display font-bold text-black text-xl">L</span>
            </div>
            <span className="font-display font-bold text-xl tracking-[0.2em] text-white">LUTAR</span>
          </Link>
        </div>
        
        <div className="p-4 flex-1 space-y-1">
          <div className="px-2 mb-4 mt-2">
            <p className="text-[10px] font-sans tracking-[0.2em] text-muted-foreground uppercase">Main Menu</p>
          </div>
          
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors">
            <LayoutDashboard size={18} />
            <span className="font-sans text-sm font-medium">Command Center</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
            <Briefcase size={18} />
            <span className="font-sans text-sm font-medium">Holdings & Assets</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
            <Target size={18} />
            <span className="font-sans text-sm font-medium">Strategic Goals</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
            <ShieldCheck size={18} />
            <span className="font-sans text-sm font-medium">Security (AEGIS)</span>
          </a>
        </div>
        
        <div className="p-4 border-t border-border">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
            <Settings size={18} />
            <span className="font-sans text-sm font-medium">System Prefs</span>
          </a>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-1">
            <LogOut size={18} />
            <span className="font-sans text-sm font-medium">Disconnect</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-semibold text-white tracking-wide">Command Center</h1>
            <Badge variant="outline" className="hidden sm:inline-flex border-primary/30 text-primary bg-primary/5">
              EMPEROR ACCESS
            </Badge>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center text-xs font-mono text-muted-foreground bg-card px-3 py-1.5 rounded border border-border">
              <Activity className="w-3 h-3 text-primary mr-2" />
              {currentTime || "00:00:00 UTC"}
            </div>
            <button className="text-muted-foreground hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-9 h-9 rounded bg-secondary flex items-center justify-center border border-border">
              <span className="font-display font-bold text-black text-sm">S</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-8 space-y-8">
          
          {/* Welcome Row */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <p className="text-muted-foreground font-sans mb-1">Welcome back,</p>
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">slutar</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary font-mono bg-primary/10 border border-primary/20 px-4 py-2 rounded">
              <TrendingUp size={16} /> All systems operational. Net growth +340%
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Total Empire Value", value: "$18.5M", sub: "+$6.1M this year", highlight: true },
              { label: "Active Projects", value: "7", sub: "3 Deploying soon", highlight: false },
              { label: "Security Status", value: "Secure", sub: "0 Active Threats", highlight: false },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className={`p-6 rounded-xl border ${stat.highlight ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'}`}
              >
                <p className="text-sm font-sans tracking-wider text-muted-foreground uppercase mb-2">{stat.label}</p>
                <h3 className={`text-4xl font-display font-bold mb-2 ${stat.highlight ? 'text-primary text-glow' : 'text-white'}`}>
                  {stat.value}
                </h3>
                <p className="text-xs font-sans text-muted-foreground">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Chart & Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 p-6 rounded-xl border border-border bg-card flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-white tracking-wide uppercase">Empire Trajectory (12m)</h3>
                <Badge variant="outline" className="border-border">Valuation</Badge>
              </div>
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(158 84% 39%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(158 84% 39%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(160 15% 15%)" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(160 10% 40%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(160 10% 40%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}M`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(160 10% 6%)', borderColor: 'hsl(160 15% 15%)', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(158 84% 39%)' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="hsl(158 84% 39%)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Activity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 rounded-xl border border-border bg-card flex flex-col"
            >
              <h3 className="font-display font-bold text-white tracking-wide uppercase mb-6">Recent Operations</h3>
              <div className="space-y-6 flex-1">
                {[
                  { title: "ROSIE System Updated", time: "2 hours ago", type: "system" },
                  { title: "New Asset Acquired", time: "5 hours ago", type: "finance" },
                  { title: "Zeus Architecture Scaled", time: "1 day ago", type: "tech" },
                  { title: "Threat Blocked by AEGIS", time: "1 day ago", type: "security" },
                  { title: "Strategic Goal Reached", time: "3 days ago", type: "goal" },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-pointer">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                    <div className="flex-1 border-b border-border/50 pb-4">
                      <p className="text-sm font-sans text-white group-hover:text-primary transition-colors">{act.title}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-1">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-xs font-sans tracking-widest text-muted-foreground uppercase hover:text-white flex items-center justify-center gap-1">
                View All Logs <ChevronRight size={14} />
              </button>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
