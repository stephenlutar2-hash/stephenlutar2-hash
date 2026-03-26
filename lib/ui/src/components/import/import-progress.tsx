import * as React from "react";
import { cn } from "../../utils";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";

export type ImportStatus = "idle" | "parsing" | "validating" | "importing" | "complete" | "error";

export interface ImportProgressProps {
  status: ImportStatus;
  progress: number;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  errors?: string[];
  className?: string;
  accentColor?: string;
}

const statusLabels: Record<ImportStatus, string> = {
  idle: "Ready to import",
  parsing: "Parsing file...",
  validating: "Validating data...",
  importing: "Importing records...",
  complete: "Import complete",
  error: "Import failed",
};

export function ImportProgress({
  status,
  progress,
  totalRows,
  processedRows,
  successCount,
  errorCount,
  errors = [],
  className,
  accentColor = "#6366f1",
}: ImportProgressProps) {
  const isActive = status === "parsing" || status === "validating" || status === "importing";
  const showProgress = isActive || status === "complete" || status === "error";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3">
        {status === "complete" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        {status === "error" && <XCircle className="w-5 h-5 text-red-400" />}
        {isActive && <Loader2 className="w-5 h-5 animate-spin" style={{ color: accentColor }} />}
        <span className="text-sm font-medium text-white">{statusLabels[status]}</span>
      </div>

      {showProgress && (
        <>
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: (status as string) === "error" ? "#f87171" : accentColor,
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
              <div className="text-lg font-bold text-white">{processedRows}</div>
              <div className="text-xs text-white/40">Processed</div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
              <div className="text-lg font-bold text-emerald-400">{successCount}</div>
              <div className="text-xs text-white/40">Imported</div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
              <div className="text-lg font-bold text-red-400">{errorCount}</div>
              <div className="text-xs text-white/40">Errors</div>
            </div>
          </div>
        </>
      )}

      {errors.length > 0 && (
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {errors.slice(0, 20).map((err, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/10 rounded px-3 py-1.5"
            >
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
          {errors.length > 20 && (
            <div className="text-xs text-white/30 text-center py-1">
              ...and {errors.length - 20} more errors
            </div>
          )}
        </div>
      )}
    </div>
  );
}
