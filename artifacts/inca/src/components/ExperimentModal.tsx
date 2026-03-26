import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { CreateIncaExperimentStatus } from "@szl-holdings/api-client-react";

interface ExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectName?: string;
  onSubmit: (data: {
    projectId: number;
    name: string;
    hypothesis: string;
    result: string;
    status: CreateIncaExperimentStatus;
    accuracy: number;
  }) => void;
  isPending?: boolean;
}

export default function ExperimentModal({ isOpen, onClose, projectId, projectName, onSubmit, isPending }: ExperimentModalProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen && formRef.current) formRef.current.reset();
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      projectId,
      name: fd.get("name") as string,
      hypothesis: fd.get("hypothesis") as string,
      result: fd.get("result") as string,
      status: fd.get("status") as CreateIncaExperimentStatus,
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
            className="relative glass-panel rounded-2xl p-6 w-full max-w-lg border-violet/20 z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-display font-bold text-white">New Experiment</h3>
                {projectName && (
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">Project: {projectName}</p>
                )}
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Experiment Name</label>
                <input
                  required
                  name="name"
                  className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:border-violet focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Hypothesis</label>
                <textarea
                  required
                  name="hypothesis"
                  rows={2}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:border-violet focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Result / Findings</label>
                <textarea
                  required
                  name="result"
                  rows={2}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:border-violet focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Status</label>
                  <select
                    required
                    name="status"
                    className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:border-violet focus:outline-none transition-colors"
                  >
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
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
                    className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:border-violet focus:outline-none transition-colors"
                  />
                </div>
              </div>

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
                  className="px-6 py-2 bg-violet/20 text-violet border border-violet/40 rounded-lg hover:bg-violet hover:text-white font-medium text-sm transition-all disabled:opacity-50 glow-violet"
                >
                  {isPending ? "Creating..." : "Create Experiment"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
