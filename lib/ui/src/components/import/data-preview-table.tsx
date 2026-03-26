import * as React from "react";
import { cn } from "../../utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { Badge } from "../badge";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export interface DataPreviewRow {
  data: Record<string, string | number | boolean | null>;
  valid: boolean;
  errors?: string[];
}

export interface DataPreviewTableProps {
  rows: DataPreviewRow[];
  columns: string[];
  maxPreviewRows?: number;
  totalRows?: number;
  className?: string;
  accentColor?: string;
}

export function DataPreviewTable({
  rows,
  columns,
  maxPreviewRows = 10,
  totalRows,
  className,
  accentColor = "#6366f1",
}: DataPreviewTableProps) {
  const previewRows = rows.slice(0, maxPreviewRows);
  const validCount = rows.filter((r) => r.valid).length;
  const errorCount = rows.filter((r) => !r.valid).length;
  const total = totalRows ?? rows.length;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{validCount} valid</span>
        </div>
        {errorCount > 0 && (
          <div className="flex items-center gap-1.5 text-red-400">
            <XCircle className="w-3.5 h-3.5" />
            <span>{errorCount} errors</span>
          </div>
        )}
        <div className="text-white/40">
          Showing {Math.min(previewRows.length, maxPreviewRows)} of {total} rows
        </div>
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 bg-white/[0.03]">
                <TableHead className="text-white/50 text-xs w-10">#</TableHead>
                <TableHead className="text-white/50 text-xs w-10">Status</TableHead>
                {columns.map((col) => (
                  <TableHead key={col} className="text-white/50 text-xs whitespace-nowrap">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((row, i) => (
                <TableRow
                  key={i}
                  className={cn(
                    "border-white/5",
                    !row.valid && "bg-red-400/5"
                  )}
                >
                  <TableCell className="text-white/30 text-xs font-mono">{i + 1}</TableCell>
                  <TableCell>
                    {row.valid ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col} className="text-sm text-white/80 whitespace-nowrap max-w-[200px] truncate">
                      {row.data[col] !== null && row.data[col] !== undefined
                        ? String(row.data[col])
                        : <span className="text-white/20 italic">null</span>}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {errorCount > 0 && (
        <div className="space-y-1">
          {rows
            .filter((r) => !r.valid)
            .slice(0, 5)
            .map((row, i) => (
              <div
                key={i}
                className="text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/10 rounded px-3 py-1.5"
              >
                Row {rows.indexOf(row) + 1}: {row.errors?.join(", ") || "Validation error"}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
