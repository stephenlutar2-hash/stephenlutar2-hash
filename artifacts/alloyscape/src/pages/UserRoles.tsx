import DashboardLayout from "@/components/DashboardLayout";
import {
  Users, Shield, Eye, Code2, Crown, MoreHorizontal,
} from "lucide-react";
import { users } from "@/data/demo";

const roleConfig = {
  admin: { label: "Admin", icon: Crown, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  operator: { label: "Operator", icon: Shield, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  viewer: { label: "Viewer", icon: Eye, color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
  developer: { label: "Developer", icon: Code2, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
};

const statusStyle = {
  active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  suspended: "text-red-400 bg-red-500/10 border-red-500/20",
  invited: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

export default function UserRoles() {
  const roleCounts = {
    admin: users.filter(u => u.role === "admin").length,
    operator: users.filter(u => u.role === "operator").length,
    developer: users.filter(u => u.role === "developer").length,
    viewer: users.filter(u => u.role === "viewer").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Users & Roles</h2>
            <p className="text-sm text-gray-500 mt-1">Manage access and permissions for the platform</p>
          </div>
          <button className="px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors flex items-center gap-2 self-start">
            <Users className="w-4 h-4" /> Invite User
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(roleConfig).map(([key, cfg]) => {
            const RoleIcon = cfg.icon;
            return (
              <div key={key} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <RoleIcon className={`w-4 h-4 ${cfg.color.split(" ")[0]}`} />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{cfg.label}s</span>
                </div>
                <p className="text-2xl font-bold text-white">{roleCounts[key as keyof typeof roleCounts]}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
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
                {users.map(user => {
                  const rcfg = roleConfig[user.role];
                  const RoleIcon = rcfg.icon;
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
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
                        <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
