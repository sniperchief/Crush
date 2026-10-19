"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

/** Filled electric-pink pill with a chrome edge. */
export function PrimaryButton({ children, className = "", ...props }: Props) {
  return (
    <button
      type="button"
      className={`chrome-ring btn-glow group relative inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-pink px-9 text-[0.8rem] font-semibold tracking-[0.28em] text-ink transition-transform duration-200 active:scale-[0.97] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Quiet chrome-outlined continue action. Fades in when it becomes available. */
export function ContinueButton({
  children = "Continue",
  className = "",
  ...props
}: Omit<Props, "children"> & { children?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className={`chrome-ring group inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-white/[0.03] px-7 text-[0.72rem] font-medium tracking-[0.26em] text-ivory uppercase backdrop-blur-sm transition-[background,transform] duration-200 hover:bg-white/[0.07] active:scale-[0.97] ${className}`}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="text-pink transition-transform duration-200 group-hover:translate-x-1"
        >
          →
        </span>
      </button>
    </motion.div>
  );
}
