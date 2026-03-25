import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Target,
  ShieldCheck,
  Settings,
  LogOut,
  Bell,
  Activity,
  ChevronRight,
  TrendingUp,
  Shield,
  Flame,
  Zap,
  BarChart,
  Globe,
  Cpu,
  Cloud,
  ExternalLink,
  CheckCircle2,
  Clock,
  DollarSign,
  CreditCard,
  Landmark,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building2,
  RefreshCw,
  LinkIcon
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Badge } from "@workspace/ui";
import { Progress } from "@workspace/ui";

const INITIAL_REVENUE_DATA = [
  { month: "Jan", revenue: 2.1, expenses: 1.4 },
  { month: "Feb", revenue: 2.8, expenses: 1.6 },
  { month: "Mar", revenue: 3.2, expenses: 1.8 },
  { month: "Apr", revenue: 4.5, expenses: 2.1 },
  { month: "May", revenue: 5.1, expenses: 2.3 },
  { month: "Jun", revenue: 6.8, expenses: 2.8 },
  { month: "Jul", revenue: 7.2, expenses: 3.0 },
  { month: "Aug", revenue: 8.5, expenses: 3.2 },
  { month: "Sep", revenue: 10.1, expenses: 3.5 },
  { month: "Oct", revenue: 12.4, expenses: 3.8 },
  { month: "Nov", revenue: 15.2, expenses: 4.1 },
  { month: "Dec", revenue: 18.5, expenses: 4.5 },
];

const INITIAL_DIVISION_DATA = [
  { name: "Security", value: 42 },
  { name: "Technology", value: 28 },
  { name: "Media", value: 18 },
  { name: "Operations", value: 12 },
];
const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];

interface ProjectItem {
  name: string;
  desc: string;
  status: string;
  progress: number;
  icon: React.ComponentType<any>;
  url: string;
  color: string;
  borderColor: string;
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    name: "ROSIE",
    desc: "Autonomous AI Security Platform",
    status: "Active",
    progress: 100,
    icon: Shield,
    url: "/",
    color: "text-violet-400",
    borderColor: "border-violet-500/20",
  },
  {
    name: "AEGIS",
    desc: "Enterprise Shield System",
    status: "Active",
    progress: 100,
    icon: ShieldCheck,
    url: "/aegis/",
    color: "text-amber-500",
    borderColor: "border-amber-500/20",
  },
  {
    name: "Firestorm",
    desc: "Offensive Security Operations",
    status: "Active",
    progress: 100,
    icon: Flame,
    url: "/firestorm/",
    color: "text-orange-500",
    borderColor: "border-orange-500/20",
  },
  {
    name: "Beacon",
    desc: "Decision & Analytics Dashboard",
    status: "Active",
    progress: 95,
    icon: BarChart,
    url: "/beacon/",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/20",
  },
  {
    name: "Nimbus",
    desc: "Predictive AI Framework",
    status: "Building",
    progress: 88,
    icon: Cloud,
    url: "/nimbus/",
    color: "text-indigo-400",
    borderColor: "border-indigo-500/20",
  },
  {
    name: "Zeus",
    desc: "Modular Core Architecture",
    status: "Building",
    progress: 68,
    icon: Zap,
    url: "#",
    color: "text-yellow-400",
    borderColor: "border-yellow-500/20",
  },
];

function PlaidLinkFlow({ onAccountLinked }: { onAccountLinked: () => void }) {
  const [linkStatus, setLinkStatus] = useState<"idle" | "creating" | "linking" | "exchanging" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function startPlaidLink() {
    setLinkStatus("creating");
    setErrorMsg("");
    try {
      const token = localStorage.getItem("szl_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create link token");
      }

      const linkToken = data.linkToken;
      setLinkStatus("linking");

      if (typeof window !== "undefined" && (window as any).Plaid) {
        const handler = (window as any).Plaid.create({
          token: linkToken,
          onSuccess: async (publicToken: string) => {
            setLinkStatus("exchanging");
            try {
              const exchangeRes = await fetch("/api/plaid/exchange-token", {
                method: "POST",
                headers,
                body: JSON.stringify({ publicToken }),
              });
              const exchangeData = await exchangeRes.json();
              if (!exchangeRes.ok) {
                throw new Error(exchangeData.error || "Failed to exchange token");
              }
              setLinkStatus("done");
              onAccountLinked();
            } catch (err: any) {
              setErrorMsg(err.message);
              setLinkStatus("error");
            }
          },
          onExit: () => {
            setLinkStatus("idle");
          },
        });
        handler.open();
      } else {
        setLinkStatus("error");
        setErrorMsg("Plaid Link SDK failed to load. Please refresh the page and try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setLinkStatus("error");
    }
  }

  return (
    <div className="text-center py-8">
      <Landmark className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-30" />
      <p className="text-sm text-muted-foreground mb-3">No bank accounts linked</p>
      {linkStatus === "error" && (
        <div className="mb-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 max-w-sm mx-auto">
          {errorMsg}
        </div>
      )}
      {linkStatus === "done" && errorMsg && (
        <div className="mb-3 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 max-w-sm mx-auto">
          {errorMsg}
        </div>
      )}
      <button
        onClick={startPlaidLink}
        disabled={linkStatus === "creating" || linkStatus === "linking" || linkStatus === "exchanging"}
        className="px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 text-sm font-semibold hover:bg-primary/30 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
      >
        <LinkIcon className="w-4 h-4" />
        {linkStatus === "creating" ? "Creating Link..." :
         linkStatus === "linking" ? "Connecting..." :
         linkStatus === "exchanging" ? "Verifying..." :
         "Connect Bank Account"}
      </button>
    </div>
  );
}

interface StripeTxn {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  customer: string;
  created: string;
}

interface PlaidAccount {
  id: string;
  name: string;
  type: string;
  subtype: string;
  balanceCurrent: number | null;
  balanceAvailable: number | null;
  currency: string;
  mask: string;
}

function FinancialIntegrationsSection() {
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [plaidConfigured, setPlaidConfigured] = useState(false);
  const [stripeTxns, setStripeTxns] = useState<StripeTxn[]>([]);
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stripe" | "plaid">("stripe");

  useEffect(() => {
    const token = localStorage.getItem("szl_token");
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    Promise.all([
      fetch("/api/stripe/status").then(r => r.json()),
      fetch("/api/stripe/transactions?limit=15", { headers }).then(r => r.json()),
      fetch("/api/plaid/status", { headers }).then(r => r.json()),
      fetch("/api/plaid/accounts", { headers }).then(r => r.json()),
    ])
      .then(([stripeStatus, txns, plaidStatus, accounts]) => {
        setStripeConfigured(stripeStatus.configured);
        setStripeTxns(txns.transactions || []);
        setPlaidConfigured(plaidStatus.configured);
        setPlaidAccounts(accounts.accounts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
        className="p-6 rounded-xl border border-border bg-card animate-pulse">
        <div className="h-5 bg-white/5 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded" />)}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
      className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-white tracking-wide uppercase">
          Financial Integrations
        </h3>
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          <button onClick={() => setActiveTab("stripe")}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "stripe" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-white"
            }`}>
            <CreditCard className="w-3 h-3 inline mr-1.5" />Stripe
          </button>
          <button onClick={() => setActiveTab("plaid")}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "plaid" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-white"
            }`}>
            <Landmark className="w-3 h-3 inline mr-1.5" />Plaid
          </button>
        </div>
      </div>

      {activeTab === "stripe" && (
        <div>
          {!stripeConfigured ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
              <div>
                <p className="text-sm text-yellow-400 font-semibold">Stripe Not Connected</p>
                <p className="text-xs text-yellow-400/60 mt-0.5">Set STRIPE_SECRET_KEY to enable payment tracking and transaction history.</p>
              </div>
            </div>
          ) : stripeTxns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {stripeTxns.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      t.status === "succeeded" ? "bg-emerald-500/10" : "bg-yellow-500/10"
                    }`}>
                      {t.status === "succeeded" ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{t.description || t.customer}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.created).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-mono text-emerald-400">${t.amount.toFixed(2)}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">{t.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "plaid" && (
        <div>
          {!plaidConfigured ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
              <div>
                <p className="text-sm text-yellow-400 font-semibold">Plaid Not Connected</p>
                <p className="text-xs text-yellow-400/60 mt-0.5">Set PLAID_CLIENT_ID, PLAID_SECRET, and PLAID_ENV to enable bank account linking.</p>
              </div>
            </div>
          ) : plaidAccounts.length === 0 ? (
            <PlaidLinkFlow onAccountLinked={() => {
              const token = localStorage.getItem("szl_token");
              const headers: Record<string, string> = {};
              if (token) headers.Authorization = `Bearer ${token}`;
              fetch("/api/plaid/accounts", { headers })
                .then(r => r.json())
                .then(data => setPlaidAccounts(data.accounts || []))
                .catch(() => {});
            }} />
          ) : (
            <div className="space-y-3">
              {plaidAccounts.map(a => (
                <div key={a.id} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-white">{a.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{a.type} · {a.subtype} · ****{a.mask}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono text-emerald-400">${(a.balanceCurrent || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{a.currency} balance</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [, setLocation] = useLocation();
  const [revenueData, setRevenueData] = useState(INITIAL_REVENUE_DATA);
  const [divisionData, setDivisionData] = useState(INITIAL_DIVISION_DATA);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editProgress, setEditProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour12: false }) + " UTC"
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleLogout() {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  function openEditProject(index: number) {
    setEditingProject(index);
    setEditStatus(projects[index].status);
    setEditProgress(projects[index].progress);
  }

  function saveProjectEdit() {
    if (editingProject === null) return;
    setProjects((prev) =>
      prev.map((p, i) =>
        i === editingProject
          ? { ...p, status: editStatus, progress: editProgress }
          : p
      )
    );
    setEditingProject(null);
  }

  const username = localStorage.getItem("szl_user") || "Commander";

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      <aside className="w-64 border-r border-border bg-card flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="font-display font-bold text-black text-xl">
                L
              </span>
            </div>
            <span className="font-display font-bold text-xl tracking-[0.2em] text-white">
              LUTAR
            </span>
          </Link>
        </div>

        <div className="p-4 flex-1 space-y-1">
          <div className="px-2 mb-4 mt-2">
            <p className="text-[10px] font-sans tracking-[0.2em] text-muted-foreground uppercase">
              Main Menu
            </p>
          </div>

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors"
          >
            <LayoutDashboard size={18} />
            <span className="font-sans text-sm font-medium">
              Command Center
            </span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
          >
            <Briefcase size={18} />
            <span className="font-sans text-sm font-medium">
              Holdings & Assets
            </span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
          >
            <Target size={18} />
            <span className="font-sans text-sm font-medium">
              Strategic Goals
            </span>
          </button>
          <a
            href="/aegis/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
          >
            <ShieldCheck size={18} />
            <span className="font-sans text-sm font-medium">
              Security (AEGIS)
            </span>
          </a>
        </div>

        <div className="p-4 border-t border-border">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
          >
            <Settings size={18} />
            <span className="font-sans text-sm font-medium">System Prefs</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-1"
          >
            <LogOut size={18} />
            <span className="font-sans text-sm font-medium">Disconnect</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-semibold text-white tracking-wide">
              Command Center
            </h1>
            <Badge
              variant="outline"
              className="hidden sm:inline-flex border-primary/30 text-primary bg-primary/5"
            >
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
              <span className="font-display font-bold text-black text-sm">
                {username[0]?.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <p className="text-muted-foreground font-sans mb-1">
                Welcome back,
              </p>
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">
                {username}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary font-mono bg-primary/10 border border-primary/20 px-4 py-2 rounded">
              <TrendingUp size={16} /> All systems operational — Net growth +340%
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Empire Valuation",
                value: "$18.5M",
                sub: "+$6.1M this year",
                icon: DollarSign,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
              },
              {
                label: "Active Projects",
                value: "6",
                sub: "4 Active, 2 Building",
                icon: Briefcase,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20",
              },
              {
                label: "Security Status",
                value: "Secure",
                sub: "0 Active Threats",
                icon: ShieldCheck,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
              },
              {
                label: "Uptime",
                value: "99.99%",
                sub: "All services healthy",
                icon: Activity,
                color: "text-primary",
                bg: "bg-primary/10",
                border: "border-primary/20",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className={`p-6 rounded-xl border ${stat.border} ${stat.bg}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs tracking-wider text-muted-foreground uppercase">
                    {stat.label}
                  </p>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <h3
                  className={`text-3xl font-display font-bold mb-1 ${stat.color}`}
                >
                  {stat.value}
                </h3>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 p-6 rounded-xl border border-border bg-card flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-white tracking-wide uppercase">
                  Empire Trajectory (12m)
                </h3>
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground"
                >
                  Revenue vs Expenses
                </Badge>
              </div>
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorExpenses"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(160 15% 15%)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(160 10% 40%)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(160 10% 40%)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${v}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(160 10% 6%)",
                        borderColor: "hsl(160 15% 15%)",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#10b981" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorExpenses)"
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 rounded-xl border border-border bg-card flex flex-col"
            >
              <h3 className="font-display font-bold text-white tracking-wide uppercase mb-6">
                Division Allocation
              </h3>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={divisionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {divisionData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(160 10% 6%)",
                        borderColor: "hsl(160 15% 15%)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {divisionData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i] }}
                    />
                    <span className="text-muted-foreground">
                      {item.name}: {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-white tracking-wide uppercase">
                Empire Projects
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {projects.filter((p) => p.status === "Active").length} Active
                / {projects.length} Total
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project, i) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                  className={`p-5 rounded-xl border ${project.borderColor} bg-card hover:bg-card/80 transition-colors group`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${project.color} group-hover:scale-110 transition-transform`}
                      >
                        <project.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-white text-sm">
                          {project.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {project.desc}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        project.status === "Active" ? "default" : "secondary"
                      }
                      className="text-[10px] cursor-pointer"
                      onClick={() => openEditProject(i)}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Completion</span>
                      <span
                        className={
                          project.progress === 100
                            ? "text-emerald-400"
                            : "text-muted-foreground"
                        }
                      >
                        {project.progress}%
                      </span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    {project.url !== "#" && (
                      <a
                        href={project.url}
                        className="flex items-center gap-1 text-xs text-primary hover:text-emerald-400 transition-colors"
                      >
                        Open <ExternalLink size={10} />
                      </a>
                    )}
                    <button
                      onClick={() => openEditProject(i)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors ml-auto"
                    >
                      <Settings size={10} /> Edit
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <FinancialIntegrationsSection />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <h3 className="font-display font-bold text-white tracking-wide uppercase mb-6">
                Strategic Objectives
              </h3>
              <div className="space-y-5">
                {[
                  { name: "Empire Infrastructure", value: 90 },
                  { name: "Launch 6 Platforms", value: 85 },
                  { name: "Build AI Security Suite", value: 72 },
                  { name: "Global Media Presence", value: 45 },
                  { name: "Revenue Target $10M", value: 35 },
                ].map((goal, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm font-sans mb-2">
                      <span className="text-muted-foreground">{goal.name}</span>
                      <span className="text-primary font-mono">
                        {goal.value}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.value}%` }}
                        transition={{ delay: 0.9 + i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="p-6 rounded-xl border border-border bg-card flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-white tracking-wide uppercase">
                  Recent Operations
                </h3>
                <button className="text-xs tracking-widest text-muted-foreground uppercase hover:text-white flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </button>
              </div>
              <div className="space-y-4 flex-1">
                {[
                  {
                    title: "ROSIE Nuro Engine Updated",
                    time: "2 hours ago",
                    icon: Cpu,
                    iconColor: "text-violet-400",
                  },
                  {
                    title: "Aegis Dashboard Deployed",
                    time: "4 hours ago",
                    icon: ShieldCheck,
                    iconColor: "text-amber-500",
                  },
                  {
                    title: "Firestorm Ops Dashboard Live",
                    time: "4 hours ago",
                    icon: Flame,
                    iconColor: "text-orange-500",
                  },
                  {
                    title: "Zeus Architecture Scaled",
                    time: "1 day ago",
                    icon: Zap,
                    iconColor: "text-yellow-400",
                  },
                  {
                    title: "Nimbus ML Pipeline Deployed",
                    time: "2 days ago",
                    icon: Cloud,
                    iconColor: "text-indigo-400",
                  },
                  {
                    title: "Strategic Goal Reached",
                    time: "3 days ago",
                    icon: CheckCircle2,
                    iconColor: "text-emerald-400",
                  },
                ].map((act, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start group cursor-pointer p-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <act.icon
                      className={`w-4 h-4 mt-0.5 ${act.iconColor}`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-sans text-white group-hover:text-primary transition-colors">
                        {act.title}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        {act.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                label: "Global Reach",
                value: "12 Regions",
                status: "All Connected",
                statusColor: "text-emerald-400",
              },
              {
                icon: Clock,
                label: "System Uptime",
                value: "127 days",
                status: "Since last restart",
                statusColor: "text-muted-foreground",
              },
              {
                icon: Cpu,
                label: "Infrastructure Load",
                value: "28%",
                status: "Optimal capacity",
                statusColor: "text-emerald-400",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="p-5 rounded-xl border border-border bg-card flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-xl font-display font-bold text-white">
                    {item.value}
                  </p>
                  <p className={`text-xs ${item.statusColor}`}>
                    {item.status}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {editingProject !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <h3 className="font-display font-bold text-white text-lg mb-4">
              Edit {projects[editingProject].name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Building">Building</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Progress: {editProgress}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingProject(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProjectEdit}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
