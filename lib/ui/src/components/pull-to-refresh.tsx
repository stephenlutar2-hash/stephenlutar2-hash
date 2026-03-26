import { useState, useRef, useCallback, type ReactNode } from "react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, threshold = 80, className = "" }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const delta = Math.max(0, e.touches[0].clientY - startY.current);
    const dampened = Math.min(delta * 0.5, threshold * 1.5);
    setPullDistance(dampened);
  }, [pulling, refreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pulling, pullDistance, threshold, refreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex items-center justify-center transition-opacity duration-200 overflow-hidden"
        style={{ height: pullDistance > 0 || refreshing ? Math.max(pullDistance, refreshing ? 48 : 0) : 0, opacity: progress }}
      >
        <div className={`w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: `rotate(${progress * 360}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}
