"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SPARKLE_PATH } from "./ui/Sparkle";

type Spark = { id: number; x: number; y: number; hue: "pink" | "blue" };

/** A small star blooms wherever the screen is touched or clicked. */
export function TouchSparkles() {
  const reduce = useReducedMotion();
  const [sparks, setSparks] = useState<Spark[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (reduce) return;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const onDown = (e: PointerEvent) => {
      const id = ++idRef.current;
      const spark: Spark = { id, x: e.clientX, y: e.clientY, hue: id % 2 === 0 ? "blue" : "pink" };
      setSparks((s) => [...s.slice(-6), spark]);
      const timer = setTimeout(() => {
        setSparks((s) => s.filter((p) => p.id !== id));
        timers.delete(timer);
      }, 800);
      timers.add(timer);
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onDown);
      timers.forEach(clearTimeout);
    };
  }, [reduce]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50">
      {sparks.map((s) => (
        <span
          key={s.id}
          className="touch-spark absolute"
          style={{
            left: s.x,
            top: s.y,
            color: s.hue === "pink" ? "var(--color-pink)" : "var(--color-blue)",
          }}
        >
          <span className="touch-spark-ring" />
          <svg viewBox="0 0 24 24" className="touch-spark-star">
            <path d={SPARKLE_PATH} fill="currentColor" />
          </svg>
        </span>
      ))}
    </div>
  );
}
