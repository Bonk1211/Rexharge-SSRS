import { useEffect, useRef, useState } from "react";
import { animate } from "motion";

/* Numerical counter that animates from 0 to `value` once on mount.
 * Uses motion's `animate` for the timing curve, snaps integer or 1-decimal. */

export default function CountUp({
  value,
  decimals = 0,
  durationMs = 1100,
  delay = 0,
  prefix,
  suffix,
  className,
}: {
  value: number;
  decimals?: number;
  durationMs?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [n, setN] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const controls = animate(fromRef.current, value, {
      duration: durationMs / 1000,
      delay: delay / 1000,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setN(latest),
    });
    return () => {
      fromRef.current = value;
      controls.stop();
    };
  }, [value, durationMs, delay]);

  const formatted = n.toLocaleString("en-MY", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
