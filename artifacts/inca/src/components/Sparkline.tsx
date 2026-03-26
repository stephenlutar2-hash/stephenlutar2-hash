import { motion } from "framer-motion";
import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  filled?: boolean;
}

export default function Sparkline({
  data,
  color = "hsl(192, 85%, 55%)",
  width = 80,
  height = 28,
  strokeWidth = 1.5,
  filled = true,
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const w = width - padding * 2;
    const h = height - padding * 2;

    const points = data.map((val, i) => ({
      x: padding + (i / (data.length - 1)) * w,
      y: padding + h - ((val - min) / range) * h,
    }));

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) / 3;
      const cpx2 = prev.x + (2 * (curr.x - prev.x)) / 3;
      d += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return d;
  }, [data, width, height]);

  const fillPath = useMemo(() => {
    if (!filled || data.length < 2) return "";
    const padding = 2;
    const w = width - padding * 2;
    return `${path} L ${padding + w} ${height - padding} L ${padding} ${height - padding} Z`;
  }, [path, filled, data, width, height]);

  if (data.length < 2) return null;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {filled && (
        <motion.path
          d={fillPath}
          fill={color}
          fillOpacity={0.1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      )}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}
