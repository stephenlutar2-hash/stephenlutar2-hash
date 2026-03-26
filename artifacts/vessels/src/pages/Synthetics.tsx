import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, AlertTriangle, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

function ciiColor(rating: string) {
  if (rating === "A") return "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
  if (rating === "B") return "text-cyan-400 bg-cyan-500/15 border-cyan-500/30";
  if (rating === "C") return "text-amber-400 bg-amber-500/15 border-amber-500/30";
  if (rating === "D") return "text-orange-400 bg-orange-500/15 border-orange-500/30";
  return "text-red-400 bg-red-500/15 border-red-500/30";
}

function deadlineSeverity(severity: string) {
  if (severity === "critical") return "border-l-red-500 bg-red-500/5";
  if (severity === "high") return "border-l-amber-500 bg-amber-500/5";
  return "border-l-blue-500 bg-blue-500/5";
}

export default function Synthetics() {
  const { data, isLoading } = useQuery({
    queryKey: ["vessels-synthetics"],
    queryFn: () => fetch("/api/vessels/synthetics").then(r => r.json()),
  });

  if (isLoading || !data) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Proactive Compliance & Risk</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Synthetics</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Compliance Score", value: `${data.metrics.fleetComplianceScore}%`, color: data.metrics.fleetComplianceScore >= 80 ? "text-emerald-400" : "text-amber-400", icon: ShieldCheck },
          { label: "Expiring Certs", value: data.metrics.expiringCertificates, color: data.metrics.expiringCertificates > 0 ? "text-amber-400" : "text-emerald-400", icon: AlertTriangle },
          { label: "PSC Deficiencies", value: data.metrics.pscDeficiencies, color: data.metrics.pscDeficiencies > 0 ? "text-amber-400" : "text-emerald-400", icon: Clock },
          { label: "Sanctions Alerts", value: data.metrics.sanctionsAlerts, color: "text-emerald-400", icon: CheckCircle },
          { label: "CII A/B Ratio", value: `${data.metrics.ciiABRatio}%`, color: data.metrics.ciiABRatio >= 70 ? "text-emerald-400" : "text-amber-400", icon: ShieldCheck },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> CII Ratings
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.complianceCards.map((v: any) => (
              <div key={v.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 font-medium mb-2 truncate">{v.name}</p>
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border text-lg font-display font-bold ${ciiColor(v.ciiRating)}`}>
                  {v.ciiRating}
                </div>
                <p className="text-[10px] text-gray-500 mt-1 font-mono">{v.ciiScore}%</p>
                <p className={`text-[10px] mt-0.5 ${v.ciiTrend === "improving" ? "text-emerald-400" : v.ciiTrend === "declining" ? "text-red-400" : "text-gray-500"}`}>
                  {v.ciiTrend}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" /> Compliance Calendar
          </h3>
          <div className="space-y-1">
            {data.upcomingDeadlines.map((d: any, i: number) => {
              const daysUntil = Math.ceil((new Date(d.date).getTime() - Date.now()) / 86400000);
              const maxDays = 365;
              const pct = Math.min(100, Math.max(0, (daysUntil / maxDays) * 100));
              const dateObj = new Date(d.date);
              const monthStr = dateObj.toLocaleDateString("en-US", { month: "short" });
              const dayStr = dateObj.getDate();
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/[0.02] transition-colors ${deadlineSeverity(d.severity)}`}>
                  <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 ${
                    daysUntil <= 7 ? "bg-red-500/15 border border-red-500/30" :
                    daysUntil <= 30 ? "bg-amber-500/15 border border-amber-500/30" :
                    "bg-blue-500/10 border border-blue-500/20"
                  }`}>
                    <span className={`text-[10px] font-bold uppercase ${
                      daysUntil <= 7 ? "text-red-400" : daysUntil <= 30 ? "text-amber-400" : "text-blue-400"
                    }`}>{monthStr}</span>
                    <span className={`text-lg font-display font-bold leading-none ${
                      daysUntil <= 7 ? "text-red-400" : daysUntil <= 30 ? "text-amber-400" : "text-blue-400"
                    }`}>{dayStr}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 truncate">{d.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{d.scope}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${
                          daysUntil <= 7 ? "bg-red-500" : daysUntil <= 30 ? "bg-amber-500" : "bg-blue-500/60"
                        }`} style={{ width: `${100 - pct}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold font-mono ${
                        daysUntil <= 7 ? "text-red-400" : daysUntil <= 30 ? "text-amber-400" : "text-gray-500"
                      }`}>
                        {daysUntil > 0 ? `${daysUntil}d` : "OVERDUE"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="font-display font-semibold text-sm text-white mb-4">Certificate Status by Vessel</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                <th className="px-4 py-2 text-left font-medium">Vessel</th>
                <th className="px-4 py-2 text-center font-medium">EEXI</th>
                <th className="px-4 py-2 text-center font-medium">PSC Ready</th>
                <th className="px-4 py-2 text-center font-medium">Sanctions</th>
                <th className="px-4 py-2 text-center font-medium">Certs Expiring</th>
              </tr>
            </thead>
            <tbody>
              {data.complianceCards.map((v: any) => {
                const expiring = v.certificates.filter((c: any) => c.status === "expiring-soon").length;
                return (
                  <tr key={v.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 font-medium text-white">{v.name}</td>
                    <td className="px-4 py-2.5 text-center">
                      {v.eexiStatus === "compliant" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-xs font-mono ${v.pscReadiness >= 80 ? "text-emerald-400" : v.pscReadiness >= 60 ? "text-amber-400" : "text-red-400"}`}>
                        {v.pscReadiness}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">
                        {v.sanctionsScreening}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-xs font-mono ${expiring > 0 ? "text-amber-400" : "text-gray-500"}`}>
                        {expiring}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
