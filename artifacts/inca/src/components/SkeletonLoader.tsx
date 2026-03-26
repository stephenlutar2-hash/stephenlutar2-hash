import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "metric" | "chart" | "row";
  count?: number;
}

function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`bg-white/[0.04] rounded-lg ${className}`}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function SkeletonMetricCard() {
  return (
    <div className="metric-card border-white/5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonPulse className="w-8 h-8 rounded-lg" />
          <SkeletonPulse className="w-16 h-5 rounded" />
        </div>
        <SkeletonPulse className="w-20 h-8 rounded" />
        <SkeletonPulse className="w-32 h-3 rounded" />
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex gap-4">
        <SkeletonPulse className="w-14 h-14 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <SkeletonPulse className="w-48 h-5 rounded" />
          <SkeletonPulse className="w-24 h-3 rounded" />
          <SkeletonPulse className="w-full h-4 rounded" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between">
        <SkeletonPulse className="w-32 h-3 rounded" />
        <SkeletonPulse className="w-16 h-3 rounded" />
      </div>
    </div>
  );
}

const skeletonBarHeights = [55, 72, 40, 85, 63, 48, 78, 35];

export function SkeletonChart() {
  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <SkeletonPulse className="w-5 h-5 rounded" />
        <SkeletonPulse className="w-32 h-5 rounded" />
      </div>
      <div className="flex items-end gap-2 h-48">
        {skeletonBarHeights.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-white/[0.04] rounded-t"
            style={{ height: `${h}%` }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4">
      <SkeletonPulse className="w-3 h-3 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonPulse className="w-40 h-4 rounded" />
        <SkeletonPulse className="w-24 h-3 rounded" />
      </div>
      <SkeletonPulse className="w-16 h-5 rounded" />
      <SkeletonPulse className="w-12 h-4 rounded" />
    </div>
  );
}

export default function SkeletonLoader({ className = "", variant = "text", count = 1 }: SkeletonProps) {
  if (variant === "metric") {
    return (
      <>{Array.from({ length: count }).map((_, i) => <SkeletonMetricCard key={i} />)}</>
    );
  }
  if (variant === "card") {
    return (
      <>{Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}</>
    );
  }
  if (variant === "chart") {
    return (
      <>{Array.from({ length: count }).map((_, i) => <SkeletonChart key={i} />)}</>
    );
  }
  if (variant === "row") {
    return (
      <>{Array.from({ length: count }).map((_, i) => <SkeletonRow key={i} />)}</>
    );
  }
  return <SkeletonPulse className={className} />;
}
