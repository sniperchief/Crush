"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Stage headline that takes focus when its stage mounts, so keyboard and
 * screen-reader users land on the new content instead of a removed button.
 */
export function StageHeading({
  children,
  className = "",
  autoFocus = true,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  autoFocus?: boolean;
  as?: "h1" | "h2";
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  return (
    <Tag ref={ref} tabIndex={-1} className={`outline-none ${className}`}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`font-mono text-[0.62rem] font-medium tracking-[0.32em] text-violet/80 uppercase ${className}`}
    >
      {children}
    </p>
  );
}
