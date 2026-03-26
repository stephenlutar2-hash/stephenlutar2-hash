import * as React from "react";
import { cn } from "../../utils";
import { Upload, File, X, FileText, FileSpreadsheet, FileCode, FileJson } from "lucide-react";

export interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  multiple?: boolean;
  className?: string;
  accentColor?: string;
}

const fileTypeIcons: Record<string, React.ElementType> = {
  csv: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  xls: FileSpreadsheet,
  json: FileJson,
  xml: FileCode,
  yaml: FileCode,
  yml: FileCode,
  ipynb: FileCode,
  txt: FileText,
  ics: FileText,
};

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return fileTypeIcons[ext] || File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropZone({
  onFilesSelected,
  acceptedTypes = [".csv", ".json", ".xml", ".xlsx"],
  maxSizeMB = 50,
  multiple = true,
  className,
  accentColor = "#6366f1",
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFiles = React.useCallback(
    (files: File[]): File[] => {
      setError(null);
      const valid: File[] = [];
      for (const file of files) {
        const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
        if (acceptedTypes.length > 0 && !acceptedTypes.includes(ext) && !acceptedTypes.includes("*")) {
          setError(`File type ${ext} is not supported. Accepted: ${acceptedTypes.join(", ")}`);
          continue;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`File ${file.name} exceeds ${maxSizeMB}MB limit`);
          continue;
        }
        valid.push(file);
      }
      return valid;
    },
    [acceptedTypes, maxSizeMB]
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      const valid = validateFiles(multiple ? files : files.slice(0, 1));
      if (valid.length > 0) {
        const updated = multiple ? [...selectedFiles, ...valid] : valid;
        setSelectedFiles(updated);
        onFilesSelected(updated);
      }
    },
    [multiple, selectedFiles, validateFiles, onFilesSelected]
  );

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const valid = validateFiles(multiple ? files : files.slice(0, 1));
      if (valid.length > 0) {
        const updated = multiple ? [...selectedFiles, ...valid] : valid;
        setSelectedFiles(updated);
        onFilesSelected(updated);
      }
      if (inputRef.current) inputRef.current.value = "";
    },
    [multiple, selectedFiles, validateFiles, onFilesSelected]
  );

  const removeFile = React.useCallback(
    (index: number) => {
      const updated = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(updated);
      onFilesSelected(updated);
    },
    [selectedFiles, onFilesSelected]
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
          isDragging
            ? "border-opacity-100 bg-opacity-10"
            : "border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]"
        )}
        style={{
          borderColor: isDragging ? accentColor : undefined,
          backgroundColor: isDragging ? `${accentColor}10` : undefined,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(",")}
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Upload className="w-6 h-6" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {isDragging ? "Drop files here" : "Drag & drop files here, or click to browse"}
            </p>
            <p className="text-xs text-white/50 mt-1">
              Supports {acceptedTypes.join(", ")} — Max {maxSizeMB}MB per file
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, i) => {
            const Icon = getFileIcon(file.name);
            return (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2"
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-white/40">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
