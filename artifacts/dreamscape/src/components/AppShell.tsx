import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, Grid3x3, GitBranch, Wand2, Clock, LayoutDashboard,
  LogOut, Menu, X, Sparkles
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/explore", label: "Explore", icon: Compass },
  { path: "/gallery", label: "Gallery", icon: Grid3x3 },
  { path: "/map", label: "Map", icon: GitBranch },
  { path: "/studio", label: "Studio", icon: Wand2 },
  { path: "/history", label: "History", icon: Clock },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);

  function logout() {
    const token = localStorage.getItem("szl_token");
    if (token) fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center cursor-pointer"
              onClick={() => setLocation("/dashboard")}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block cursor-pointer" onClick={() => setLocation("/dashboard")}>
              <h1 className="text-sm font-bold tracking-wider">DREAMSCAPE</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Creative Systems</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = location === item.path || location.startsWith(item.path + "/");
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition">
              <LogOut className="w-4 h-4" /> Disconnect
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
              className="md:hidden border-t border-white/5 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map(item => {
                  const isActive = location === item.path || location.startsWith(item.path + "/");
                  return (
                    <button
                      key={item.path}
                      onClick={() => { setLocation(item.path); setMobileMenu(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : "text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      <item.icon className="w-4 h-4" /> {item.label}
                    </button>
                  );
                })}
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm mt-2">
                  <LogOut className="w-4 h-4" /> Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
