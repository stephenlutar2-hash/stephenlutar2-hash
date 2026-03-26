import { trackEvent } from "@szl-holdings/platform";
import { useState } from "react";
import { useLocation } from "wouter";
import { Hexagon, Lock, User, AlertCircle } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setError("Invalid credentials"); return; }
      const data = await res.json();
      localStorage.setItem("szl_token", data.token);
      localStorage.setItem("szl_user", data.username);
      setLocation("/dashboard");
    } catch { setError("Connection failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background" style={{ backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(6,182,212,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.05) 0%, transparent 60%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
            <Hexagon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-white">ALLOYSCAPE</h1>
          <p className="text-gray-500 mt-2 text-sm tracking-widest uppercase">Infrastructure Operations Platform</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg tracking-wider uppercase text-sm hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Connecting..." : "Enter AlloyScape"}
          </button>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.setItem("szl_token", "demo_token_alloyscape");
              localStorage.setItem("szl_user", "demo");
              localStorage.setItem("szl_demo_mode", "true"); trackEvent("demo", "enter", "alloyscape");
              setLocation("/dashboard");
            }}
            className="w-full border border-cyan-500/30 text-cyan-400 font-semibold py-3 rounded-lg tracking-wide text-sm hover:bg-cyan-500/10 transition"
          >
            Explore Demo
          </button>
          <p className="text-center text-gray-600 text-xs">No credentials needed — browse with sample data</p>
        </form>
      </div>
    </div>
  );
}
