import { ShieldAlert } from "lucide-react";

export function LabBanner() {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-2 text-amber-400 text-xs font-bold tracking-[0.2em] uppercase">
      <ShieldAlert className="w-4 h-4" />
      <span>Lab Mode — Authorized Simulation Only</span>
      <ShieldAlert className="w-4 h-4" />
    </div>
  );
}
