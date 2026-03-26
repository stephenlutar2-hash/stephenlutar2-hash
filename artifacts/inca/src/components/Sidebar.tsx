import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Brain, LayoutDashboard, FolderKanban, FlaskConical, Lightbulb, Activity } from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/projects", label: "Projects", icon: FolderKanban },
  { path: "/experiments", label: "Experiments", icon: FlaskConical },
  { path: "/insights", label: "Insights", icon: Lightbulb },
  { path: "/models", label: "Models", icon: Activity },
];

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar-bg border-r border-sidebar-border flex flex-col z-50">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-violet flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Brain className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-display font-bold text-white tracking-wide group-hover:text-glow-cyan transition-all">INCA</h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em]">INTELLIGENCE PLATFORM</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              href={path}
              className="relative block"
            >
              <motion.div
                className={`sidebar-link relative overflow-hidden ${active ? "sidebar-link-active" : "sidebar-link-inactive"}`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 bg-cyan/10 rounded-lg border border-cyan/20"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {active && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan rounded-r-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="relative flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <motion.div
          className="glass-panel rounded-lg p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-xs font-mono text-muted-foreground">SYSTEM STATUS</span>
          </div>
          <p className="text-xs text-emerald font-medium">All systems operational</p>
          <div className="mt-2 flex gap-1">
            {[85, 72, 95, 68, 90, 78, 88, 65, 93, 76, 82, 97].map((pct, i) => (
              <motion.div
                key={i}
                className="flex-1 h-1 rounded-full bg-emerald/30"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
              >
                <motion.div
                  className="h-full rounded-full bg-emerald"
                  style={{ width: `${pct}%` }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </aside>
  );
}
