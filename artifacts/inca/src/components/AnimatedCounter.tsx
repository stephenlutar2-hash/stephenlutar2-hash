import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number | string;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
}

export default function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1.2,
  className = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      setDisplayValue(String(value));
      return;
    }

    const startTime = performance.now();
    const startVal = 0;

    let rafId: number;

    function update(currentTime: number) {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (numValue - startVal) * eased;

      setDisplayValue(current.toFixed(decimals));

      if (progress < 1) {
        rafId = requestAnimationFrame(update);
      }
    }

    rafId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(rafId);
  }, [isInView, value, duration, decimals]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 5 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3 }}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
}
