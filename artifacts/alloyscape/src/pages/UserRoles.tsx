import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  Users, Shield, Eye, Code2, Crown, MoreHorizontal,
  Search, ArrowUpDown,
} from "lucide-react";
import { users } from "@/data/demo";

const roleConfig: Record<string, { label: string; icon: typeof Crown; color: string }> = {
  admin: { label: "Admin", icon: Crown, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  operator: { label: "Operator", icon: Shield, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  viewer: { label: "Viewer", icon: Eye, color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
  developer: { label: "Developer", icon: Code2, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
};

const statusStyle: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  suspended: "text-red-400 bg-red-500/10 border-red-500/20",
  invited: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

type SortKey = "username" | "role" | "status" | "lastActive";

export default function UserRoles() {
  const loading = useSimulatedLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("username");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [inviteFeedback, setInviteFeedback] = useState(false);
  const [rowActionId, setRowActionId] = useState<string | null>(null);
  const inviteTimer = useRef<ReturnType<typeof setTimeout>>();
  const rowTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => { clearTimeout(inviteTimer.current); clearTimeout(rowTimer.current); }, []);

  function showRowAction(userId: string) {
    clearTimeout(rowTimer.current);
    setRowActionId(userId);
    rowTimer.current = setTimeout(() => setRowActionId(null), 2500);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoadingSkeleton title="Users & Roles" />
      </DashboardLayout>
    );
  }

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  }

  const roleCounts: Record<string, number> = {
    admin: users.filter(u => u.role === "admin").length,
    operator: users.filter(u => u.role === "operator").length,
    developer: users.filter(u => u.role === "developer").length,
    viewer: users.filter(u => u.role === "viewer").length,
  };

  const filtered = users
    .filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "username") return a.username.localeCompare(b.username) * dir;
      if (sortBy === "role") return a.role.localeCompare(b.role) * dir;
      if (sortBy === "status") return a.status.localeCompare(b.status) * dir;
      return a.lastActive.localeCompare(b.lastActive) * dir;
    });

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Users & Roles</h2>
            <p className="text-sm text-gray-500 mt-1">Manage access and permissions for the platform</p>
          </div>
          <button
            onClick={() => { clearTimeout(inviteTimer.current); setInviteFeedback(true); inviteTimer.current = setTimeout(() => setInviteFeedback(false), 2500); }}
            className="px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors flex items-center gap-2 self-start"
          >
            <Users className="w-4 h-4" /> {inviteFeedback ? "Invite sent (demo)" : "Invite User"}
          </button>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
        >
          {Object.entries(roleConfig).map(([key, cfg]) => {
            const RoleIcon = cfg.icon;
            return (
              <motion.button
                key={key}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setRoleFilter(roleFilter === key ? "all" : key)}
                className={`p-4 rounded-xl border text-left transition-colors ${roleFilter === key ? `${cfg.color}` : "bg-white/[0.03] border-white/5 hover:border-white/10"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <RoleIcon className={`w-4 h-4 ${cfg.color.split(" ")[0]}`} />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{cfg.label}s</span>
                </div>
                <p className="text-2xl font-bold text-white">{roleCounts[key]}</p>
              </motion.button>
            );
          })}
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
            />
          </div>
          <div className="flex gap-2">
            {(["username", "role", "status"] as SortKey[]).map(key => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider border transition-colors ${sortBy === key ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"}`}
              >
                <ArrowUpDown className="w-3 h-3" />
                {key} {sortBy === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">User</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Role</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Last Active</th>
                  <th className="text-left px-5 py-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium hidden lg:table-cell">Permissions</th>
                  <th className="px-5 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map((user, i) => {
                  const rcfg = roleConfig[user.role];
                  const RoleIcon = rcfg.icon;
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.04 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center text-xs font-bold text-cyan-400">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${rcfg.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {rcfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyle[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">{user.lastActive}</td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.slice(0, 3).map(perm => (
                            <span key={perm} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 font-mono">
                              {perm}
                            </span>
                          ))}
                          {user.permissions.length > 3 && (
                            <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-500">
                              +{user.permissions.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {rowActionId === user.id ? (
                          <span className="text-[10px] text-cyan-400 whitespace-nowrap">Actions (demo)</span>
                        ) : (
                          <button
                            onClick={() => showRowAction(user.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 transition-colors"
                            title="User actions (demo)"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-500">No Users Found</h3>
            <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
