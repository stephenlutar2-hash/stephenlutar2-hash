import { useState, useEffect } from "react";

export function useSimulatedLoading(delay = 600) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return loading;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 p-5 animate-pulse">
      <div className="h-10 w-10 rounded-lg bg-white/5 mb-3" />
      <div className="h-5 w-16 bg-white/5 rounded mb-2" />
      <div className="h-3 w-24 bg-white/[0.03] rounded" />
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <div className="h-9 w-9 rounded-xl bg-white/5 animate-pulse" />
          <div className="ml-3 space-y-1.5 animate-pulse hidden sm:block">
            <div className="h-4 w-16 bg-white/5 rounded" />
            <div className="h-2.5 w-28 bg-white/[0.03] rounded" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-pulse">
        <div>
          <div className="h-7 w-48 bg-white/5 rounded mb-2" />
          <div className="h-4 w-64 bg-white/[0.03] rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="h-4 w-40 bg-white/5 rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="h-3 w-16 bg-white/5 rounded mb-2" />
                <div className="h-1.5 bg-white/5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 bg-white/5 rounded" />
                  <div className="h-3 w-40 bg-white/[0.03] rounded" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="p-2 rounded-lg bg-white/[0.02]">
                    <div className="h-3 w-10 bg-white/5 rounded mb-1" />
                    <div className="h-4 w-12 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
