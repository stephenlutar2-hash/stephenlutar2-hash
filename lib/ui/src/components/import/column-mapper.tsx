import * as React from "react";
import { cn } from "../../utils";
import { ArrowRight, Check, Zap } from "lucide-react";

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string | null;
}

export interface TargetField {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
}

export interface ColumnMapperProps {
  sourceColumns: string[];
  targetFields: TargetField[];
  mappings: ColumnMapping[];
  onMappingsChange: (mappings: ColumnMapping[]) => void;
  className?: string;
  accentColor?: string;
}

function autoMapColumns(sourceColumns: string[], targetFields: TargetField[]): ColumnMapping[] {
  return sourceColumns.map((src) => {
    const normalized = src.toLowerCase().replace(/[_\-\s]+/g, "");
    const match = targetFields.find((f) => {
      const targetNorm = f.name.toLowerCase().replace(/[_\-\s]+/g, "");
      const labelNorm = f.label.toLowerCase().replace(/[_\-\s]+/g, "");
      return targetNorm === normalized || labelNorm === normalized || targetNorm.includes(normalized) || normalized.includes(targetNorm);
    });
    return { sourceColumn: src, targetField: match?.name ?? null };
  });
}

export function ColumnMapper({
  sourceColumns,
  targetFields,
  mappings,
  onMappingsChange,
  className,
  accentColor = "#6366f1",
}: ColumnMapperProps) {
  const handleAutoMap = React.useCallback(() => {
    const auto = autoMapColumns(sourceColumns, targetFields);
    onMappingsChange(auto);
  }, [sourceColumns, targetFields, onMappingsChange]);

  const handleMappingChange = React.useCallback(
    (sourceColumn: string, targetField: string | null) => {
      const updated = mappings.map((m) =>
        m.sourceColumn === sourceColumn ? { ...m, targetField: targetField || null } : m
      );
      onMappingsChange(updated);
    },
    [mappings, onMappingsChange]
  );

  const mappedCount = mappings.filter((m) => m.targetField).length;
  const requiredFields = targetFields.filter((f) => f.required);
  const mappedRequired = requiredFields.filter((f) => mappings.some((m) => m.targetField === f.name));

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/50">
          {mappedCount} of {sourceColumns.length} columns mapped
          {requiredFields.length > 0 && (
            <span className="ml-2">
              ({mappedRequired.length}/{requiredFields.length} required)
            </span>
          )}
        </div>
        <button
          onClick={handleAutoMap}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: accentColor }}
        >
          <Zap className="w-3.5 h-3.5" />
          Auto-map
        </button>
      </div>

      <div className="space-y-2">
        {mappings.map((mapping) => {
          const isMapped = !!mapping.targetField;
          return (
            <div
              key={mapping.sourceColumn}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                isMapped
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-white/5 bg-white/[0.01]"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-white/80 truncate">{mapping.sourceColumn}</span>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-white/20 shrink-0" />

              <div className="flex-1 min-w-0">
                <select
                  value={mapping.targetField || ""}
                  onChange={(e) => handleMappingChange(mapping.sourceColumn, e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 outline-none focus:border-white/30 appearance-none cursor-pointer"
                  style={{
                    borderColor: isMapped ? `${accentColor}40` : undefined,
                  }}
                >
                  <option value="">— Skip this column —</option>
                  {targetFields.map((field) => (
                    <option key={field.name} value={field.name}>
                      {field.label}{field.required ? " *" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {isMapped && (
                <Check className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { autoMapColumns };
