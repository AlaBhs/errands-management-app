import { useEffect, useRef, useState } from "react";

export const useAnimatedCounter = (
  target: number,
  duration = 600
): number => {
  const [current, setCurrent] = useState(0);
  const rafRef   = useRef<number>(0);
  const prevRef  = useRef<number>(0);

  useEffect(() => {
    const start     = prevRef.current;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.round(start + (target - start) * eased);
      setCurrent(value);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      else prevRef.current = target;
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
};