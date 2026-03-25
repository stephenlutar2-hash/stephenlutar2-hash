import { useLocation, Link } from "wouter";
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
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-violet flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-white tracking-wide">INCA</h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em]">INTELLIGENCE PLATFORM</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            href={path}
            className={`sidebar-link ${isActive(path) ? "sidebar-link-active" : "sidebar-link-inactive"}`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">SYSTEM STATUS</span>
          </div>
          <p className="text-xs text-emerald font-medium">All systems operational</p>
        </div>
      </div>
    </aside>
  );
}
