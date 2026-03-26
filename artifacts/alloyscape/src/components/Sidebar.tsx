import { useLocation } from "wouter";
import {
  LayoutDashboard, GitBranch, Boxes, FileCode2, ScrollText,
  Activity, Plug, Users, LogOut, ChevronLeft, Hexagon, Menu, Upload, Zap,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/orchestration", label: "Orchestration", icon: GitBranch },
  { path: "/modules", label: "System Modules", icon: Boxes },
  { path: "/workflows", label: "Workflow Templates", icon: FileCode2 },
  { path: "/logs", label: "Execution Logs", icon: ScrollText },
  { path: "/services", label: "Service Status", icon: Activity },
  { path: "/connectors", label: "Connectors", icon: Plug },
  { path: "/users", label: "Users & Roles", icon: Users },
  { path: "/extensions", label: "Extensions", icon: Zap },
  { path: "/import", label: "Import Center", icon: Upload },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function logout() {
    const token = localStorage.getItem("szl_token");
    if (token) fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  const user = localStorage.getItem("szl_user") || "Operator";

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
            <Hexagon className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-wider text-white">ALLOYSCAPE</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Operations Platform</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { setLocation(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2 text-xs text-gray-500 truncate">
            {user}
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 text-sm transition-colors"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-white/10 text-gray-400 hover:text-white transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full bg-[#0a0c14] border-r border-white/5 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}

      <div className={`hidden lg:flex flex-col shrink-0 h-screen bg-[#0a0c14] border-r border-white/5 transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}>
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 rounded-full bg-card border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors z-10"
          style={{ left: collapsed ? "calc(4rem - 12px)" : "calc(15rem - 12px)" }}
        >
          <ChevronLeft className={`w-3 h-3 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>
    </>
  );
}
