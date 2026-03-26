import { useState, useEffect } from "react";

export function useSimulatedLoading(delay = 500) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return loading;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden animate-pulse ${className}`}>
      <div className="aspect-video bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 bg-white/5 rounded" />
        <div className="h-3 w-1/2 bg-white/[0.03] rounded" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-white/5 mb-3" />
      <div className="h-6 w-12 bg-white/5 rounded mb-1" />
      <div className="h-3 w-16 bg-white/[0.03] rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 bg-white/5 rounded" />
        <div className="h-3 w-1/3 bg-white/[0.03] rounded" />
      </div>
      <div className="h-5 w-16 bg-white/5 rounded-full" />
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-56 bg-white/5 rounded mb-2" />
        <div className="h-4 w-72 bg-white/[0.03] rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <SkeletonStat key={i} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}
