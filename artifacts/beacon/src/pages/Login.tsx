import { trackEvent } from "@szl-holdings/platform";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Radar, Lock, User, AlertCircle } from "lucide-react";
import { PublicClientApplication } from "@azure/msal-browser";

interface EntraConfig {
  configured: boolean;
  tenantId?: string;
  clientId?: string;
  authority?: string;
  scopes?: string[];
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [entraConfig, setEntraConfig] = useState<EntraConfig | null>(null);
  const [entraLoading, setEntraLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetch("/api/auth/entra-config")
      .then(r => r.json())
      .then(c => setEntraConfig(c))
      .catch(() => setEntraConfig({ configured: false }))
      .finally(() => setEntraLoading(false));
  }, []);

  async function handleEntraLogin() {
    if (!entraConfig?.configured || !entraConfig.clientId || !entraConfig.authority) return;
    setError("");
    setLoading(true);
    try {
      const msalInstance = new PublicClientApplication({
        auth: {
          clientId: entraConfig.clientId,
          authority: entraConfig.authority,
          redirectUri: window.location.origin + import.meta.env.BASE_URL + "login",
        },
        cache: { cacheLocation: "sessionStorage" },
      });
      await msalInstance.initialize();
      const result = await msalInstance.loginPopup({
        scopes: entraConfig.scopes || ["openid", "profile", "email"],
      });
      if (result.idToken) {
        const res = await fetch("/api/auth/entra-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: result.idToken }),
        });
        if (!res.ok) { setError("Entra authentication failed"); return; }
        const data = await res.json();
        localStorage.setItem("szl_token", data.token);
        localStorage.setItem("szl_user", data.username);
        setLocation("/");
      }
    } catch (err: any) {
      if (err.errorCode === "user_cancelled") return;
      setError(err.message || "Microsoft sign-in failed");
    } finally {
      setLoading(false);
    }
  }

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
      setLocation("/");
    } catch { setError("Connection failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center px-4" style={{ backgroundImage: "radial-gradient(ellipse at center, rgba(6,182,212,0.05) 0%, transparent 70%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
            <Radar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-white">BEACON</h1>
          <p className="text-gray-500 mt-2 text-sm tracking-widest uppercase">Decision Analytics Hub</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}

          {!entraLoading && entraConfig?.configured && (
            <>
              <button
                onClick={handleEntraLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold py-3 rounded-lg tracking-wide text-sm transition disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 21 21"><path d="M0 0h10v10H0z" fill="#f25022"/><path d="M11 0h10v10H11z" fill="#7fba00"/><path d="M0 11h10v10H0z" fill="#00a4ef"/><path d="M11 11h10v10H11z" fill="#ffb900"/></svg>
                {loading ? "Signing in..." : "Sign in with Microsoft"}
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
              {loading ? "Authenticating..." : "Access Beacon"}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={() => {
              localStorage.setItem("szl_token", "demo_token_beacon");
              localStorage.setItem("szl_user", "demo");
              localStorage.setItem("szl_demo_mode", "true"); trackEvent("demo", "enter", "beacon");
              setLocation("/dashboard");
            }}
            className="w-full border border-cyan-500/30 text-cyan-400 font-semibold py-3 rounded-lg tracking-wide text-sm hover:bg-cyan-500/10 transition"
          >
            Explore Demo
          </button>
          <p className="text-center text-gray-600 text-xs">No credentials needed — browse with sample data</p>
        </div>
      </div>
    </div>
  );
}
