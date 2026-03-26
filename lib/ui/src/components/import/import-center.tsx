import * as React from "react";
import { cn } from "../../utils";
import { FileDropZone } from "./file-drop-zone";
import { DataPreviewTable, type DataPreviewRow } from "./data-preview-table";
import { ColumnMapper, autoMapColumns, type ColumnMapping, type TargetField } from "./column-mapper";
import { ImportProgress, type ImportStatus } from "./import-progress";
import { parseFileData } from "./parse-utils";
import { ArrowLeft, ArrowRight, Upload, Database, CheckCircle2 } from "lucide-react";

export interface ImportType {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  acceptedTypes: string[];
  targetFields: TargetField[];
  sampleData?: string;
}

export interface ImportCenterProps {
  title: string;
  description: string;
  importTypes: ImportType[];
  onImport: (importTypeId: string, data: Record<string, any>[], mappings: ColumnMapping[]) => Promise<{ success: number; errors: string[] }>;
  className?: string;
  accentColor?: string;
}

type Step = "select" | "upload" | "map" | "preview" | "import";

export function ImportCenter({
  title,
  description,
  importTypes,
  onImport,
  className,
  accentColor = "#6366f1",
}: ImportCenterProps) {
  const [step, setStep] = React.useState<Step>("select");
  const [selectedType, setSelectedType] = React.useState<ImportType | null>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [parsedData, setParsedData] = React.useState<Record<string, any>[]>([]);
  const [sourceColumns, setSourceColumns] = React.useState<string[]>([]);
  const [mappings, setMappings] = React.useState<ColumnMapping[]>([]);
  const [previewRows, setPreviewRows] = React.useState<DataPreviewRow[]>([]);
  const [importStatus, setImportStatus] = React.useState<ImportStatus>("idle");
  const [importProgress, setImportProgress] = React.useState(0);
  const [successCount, setSuccessCount] = React.useState(0);
  const [errorCount, setErrorCount] = React.useState(0);
  const [importErrors, setImportErrors] = React.useState<string[]>([]);

  const handleSelectType = (type: ImportType) => {
    setSelectedType(type);
    setStep("upload");
  };

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    if (selectedFiles.length > 0) {
      try {
        const result = await parseFileData(selectedFiles[0]);
        setParsedData(result.data);
        setSourceColumns(result.columns);
        if (selectedType) {
          const autoMapped = autoMapColumns(result.columns, selectedType.targetFields);
          setMappings(autoMapped);
        }
      } catch (err) {
        console.error("Parse error:", err);
      }
    }
  };

  const handleProceedToMap = () => {
    if (parsedData.length > 0) {
      setStep("map");
    }
  };

  const handleProceedToPreview = () => {
    const rows: DataPreviewRow[] = parsedData.map((row) => {
      const mappedData: Record<string, any> = {};
      const errors: string[] = [];
      for (const m of mappings) {
        if (m.targetField) {
          mappedData[m.targetField] = row[m.sourceColumn] ?? null;
        }
      }
      const requiredFields = selectedType?.targetFields.filter((f) => f.required) || [];
      for (const rf of requiredFields) {
        if (!mappedData[rf.name] && mappedData[rf.name] !== 0) {
          errors.push(`Missing required field: ${rf.label}`);
        }
      }
      return { data: mappedData, valid: errors.length === 0, errors };
    });
    setPreviewRows(rows);
    setStep("preview");
  };

  const handleStartImport = async () => {
    if (!selectedType) return;
    setStep("import");
    setImportStatus("importing");
    setImportProgress(0);
    setSuccessCount(0);
    setErrorCount(0);
    setImportErrors([]);

    const mappedData = parsedData.map((row) => {
      const mapped: Record<string, any> = {};
      for (const m of mappings) {
        if (m.targetField) {
          mapped[m.targetField] = row[m.sourceColumn] ?? null;
        }
      }
      return mapped;
    });

    const progressInterval = setInterval(() => {
      setImportProgress((prev) => Math.min(prev + 15, 90));
    }, 300);

    try {
      const result = await onImport(selectedType.id, mappedData, mappings);
      clearInterval(progressInterval);
      setImportProgress(100);
      setSuccessCount(result.success);
      setErrorCount(result.errors.length);
      setImportErrors(result.errors);
      setImportStatus("complete");
    } catch (err: any) {
      clearInterval(progressInterval);
      setImportStatus("error");
      setImportErrors([err.message || "Import failed"]);
    }
  };

  const handleReset = () => {
    setStep("select");
    setSelectedType(null);
    setFiles([]);
    setParsedData([]);
    setSourceColumns([]);
    setMappings([]);
    setPreviewRows([]);
    setImportStatus("idle");
    setImportProgress(0);
    setSuccessCount(0);
    setErrorCount(0);
    setImportErrors([]);
  };

  const steps = [
    { key: "select", label: "Select Type" },
    { key: "upload", label: "Upload" },
    { key: "map", label: "Map Columns" },
    { key: "preview", label: "Preview" },
    { key: "import", label: "Import" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-sm text-white/50 mt-1">{description}</p>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const isComplete = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;
          return (
            <React.Fragment key={s.key}>
              {i > 0 && (
                <div
                  className={cn(
                    "flex-1 h-px max-w-[60px]",
                    isComplete ? "bg-white/30" : "bg-white/10"
                  )}
                />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    isComplete && "bg-emerald-400/20 text-emerald-400",
                    isCurrent && "text-white",
                    !isComplete && !isCurrent && "bg-white/5 text-white/30"
                  )}
                  style={{
                    backgroundColor: isCurrent ? `${accentColor}30` : undefined,
                    color: isCurrent ? accentColor : undefined,
                  }}
                >
                  {isComplete ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:inline",
                    isCurrent ? "text-white" : "text-white/40"
                  )}
                >
                  {s.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
        {step === "select" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {importTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type)}
                  className="text-left p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-white/90">
                        {type.label}
                      </h3>
                      <p className="text-xs text-white/40 mt-1 line-clamp-2">
                        {type.description}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {type.acceptedTypes.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/30"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === "upload" && selectedType && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Database className="w-4 h-4" />
              <span>Import type: <strong className="text-white">{selectedType.label}</strong></span>
            </div>
            <FileDropZone
              onFilesSelected={handleFilesSelected}
              acceptedTypes={selectedType.acceptedTypes}
              accentColor={accentColor}
              multiple={false}
            />
            {parsedData.length > 0 && (
              <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Parsed {parsedData.length} rows with {sourceColumns.length} columns
              </div>
            )}
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep("select")}
                className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleProceedToMap}
                disabled={parsedData.length === 0}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-30"
                style={{
                  backgroundColor: accentColor,
                  color: "white",
                }}
              >
                Map Columns
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === "map" && selectedType && (
          <div className="space-y-4">
            <ColumnMapper
              sourceColumns={sourceColumns}
              targetFields={selectedType.targetFields}
              mappings={mappings}
              onMappingsChange={setMappings}
              accentColor={accentColor}
            />
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep("upload")}
                className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleProceedToPreview}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: accentColor, color: "white" }}
              >
                Preview Data
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === "preview" && selectedType && (
          <div className="space-y-4">
            <DataPreviewTable
              rows={previewRows}
              columns={mappings.filter((m) => m.targetField).map((m) => m.targetField!)}
              totalRows={parsedData.length}
              accentColor={accentColor}
            />
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep("map")}
                className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleStartImport}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: accentColor, color: "white" }}
              >
                <Upload className="w-4 h-4" />
                Start Import ({previewRows.filter((r) => r.valid).length} rows)
              </button>
            </div>
          </div>
        )}

        {step === "import" && (
          <div className="space-y-4">
            <ImportProgress
              status={importStatus}
              progress={importProgress}
              totalRows={parsedData.length}
              processedRows={importStatus === "complete" ? parsedData.length : Math.round(parsedData.length * importProgress / 100)}
              successCount={successCount}
              errorCount={errorCount}
              errors={importErrors}
              accentColor={accentColor}
            />
            {importStatus === "complete" && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: accentColor, color: "white" }}
                >
                  Import More Data
                </button>
              </div>
            )}
            {importStatus === "error" && (
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => { setStep("preview"); setImportStatus("idle"); }}
                  className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Preview
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
