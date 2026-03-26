import { useEffect, useRef } from "react";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { IncaProject, CreateIncaProjectStatus } from "@szl-holdings/api-client-react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    status: CreateIncaProjectStatus;
    aiModel: string;
    accuracy: number;
  }) => void;
  project?: IncaProject;
  isPending?: boolean;
  error?: boolean;
}

export default function ProjectModal({ isOpen, onClose, onSubmit, project, isPending, error }: ProjectModalProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen && formRef.current) {
      formRef.current.reset();
    }
  }, [isOpen, project]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      status: fd.get("status") as CreateIncaProjectStatus,
      aiModel: fd.get("aiModel") as string,
      accuracy: Number(fd.get("accuracy")),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative glass-panel rounded-2xl p-6 w-full max-w-lg border-cyan/20 z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold text-white">
                {project ? "Edit Project" : "New Project"}
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Project Name</label>
                  <input
                    required
                    name="name"
                    defaultValue={project?.name}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:border-cyan focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">AI Model</label>
                  <input
                    required
                    name="aiModel"
                    defaultValue={project?.aiModel}
                    placeholder="e.g. GPT-4, Claude-3"
                    className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:border-cyan focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Description</label>
                <textarea
                  required
                  name="description"
                  defaultValue={project?.description}
                  rows={3}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:border-cyan focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Status</label>
                  <select
                    required
                    name="status"
                    defaultValue={project?.status || "research"}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:border-cyan focus:outline-none transition-colors"
                  >
                    <option value="research">Research</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="deployed">Deployed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Accuracy %</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    name="accuracy"
                    defaultValue={project?.accuracy ?? 0}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:border-cyan focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Failed to save project. Please try again.</span>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2 bg-cyan/20 text-cyan border border-cyan/40 rounded-lg hover:bg-cyan hover:text-background font-medium text-sm transition-all disabled:opacity-50 glow-cyan"
                >
                  {isPending ? "Saving..." : project ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
