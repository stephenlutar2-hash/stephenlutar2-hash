import { useState, useEffect } from "react";

export function useSimulatedLoading(delay = 600) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return loading;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-white/[0.03] border border-white/5 p-5 animate-pulse ${className}`}>
      <div className="h-10 w-10 rounded-lg bg-white/5 mb-3" />
      <div className="h-5 w-16 bg-white/5 rounded mb-2" />
      <div className="h-3 w-24 bg-white/[0.03] rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="px-5 py-4 flex items-center gap-4 animate-pulse">
      <div className="w-3 h-3 rounded-full bg-white/5" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 bg-white/5 rounded" />
        <div className="h-3 w-32 bg-white/[0.03] rounded" />
      </div>
      <div className="h-5 w-16 bg-white/5 rounded-full" />
    </div>
  );
}

export function PageLoadingSkeleton({ title }: { title: string }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-48 bg-white/5 rounded mb-2" />
        <div className="h-4 w-64 bg-white/[0.03] rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <div className="h-4 w-32 bg-white/5 rounded" />
        </div>
        {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
      </div>
    </div>
  );
}
