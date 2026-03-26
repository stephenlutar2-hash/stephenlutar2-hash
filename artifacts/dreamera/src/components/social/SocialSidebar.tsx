import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  CalendarDays,
  BarChart3,
  Link2,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { path: "/social-command", label: "Dashboard", icon: LayoutDashboard },
  { path: "/social-command/generator", label: "Content Generator", icon: Sparkles },
  { path: "/social-command/carousel", label: "Carousel Builder", icon: Layers },
  { path: "/social-command/calendar", label: "Content Calendar", icon: CalendarDays },
  { path: "/social-command/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/social-command/connections", label: "Connections", icon: Link2 },
  { path: "/social-command/library", label: "Content Library", icon: BookOpen },
];

export default function SocialSidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 min-h-screen border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold tracking-wide text-foreground">
              SOCIAL COMMAND
            </h2>
            <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
              SZL Holdings
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            location === item.path ||
            (item.path !== "/social-command" && location.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to DreamEra
        </Link>
      </div>
    </aside>
  );
}
