"use client";

import { useEffect, useState } from "react";

export default function CountUp({
  value,
  prefix = "",
  duration = 900,
}: {
  value: number;
  prefix?: string;
  duration?: number;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const shown = Number.isInteger(value) ? Math.round(n) : n.toFixed(2);
  return (
    <>
      {prefix}
      {shown}
    </>
  );
}