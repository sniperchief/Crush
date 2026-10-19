"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; icon?: ReactNode };

export function ArrowIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

const base =
  "inline-flex h-16 w-full items-center justify-between gap-4 rounded-2xl border-[1.5px] border-ink px-5 text-left text-[20px] font-bold shadow-[4px_4px_0_#16161D] transition-[translate,box-shadow] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#16161D] disabled:opacity-60";

/** Full-width blue zine button: label left, arrow right. */
export function PrimaryButton({ children, className = "", icon = <ArrowIcon />, ...props }: Props) {
  return (
    <button type="button" className={`${base} bg-blue text-white ${className}`} {...props}>
      <span>{children}</span>
      {icon}
    </button>
  );
}

export function SecondaryButton({ children, className = "", icon = <ArrowIcon />, ...props }: Props) {
  return (
    <button type="button" className={`${base} bg-white text-ink ${className}`} {...props}>
      <span>{children}</span>
      {icon}
    </button>
  );
}

/** Primary "next page" action that slides in when it becomes available. */
export function ContinueButton({
  children = "Next page",
  className = "",
  ...props
}: Omit<Props, "children"> & { children?: ReactNode }) {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <PrimaryButton className={className} {...props}>
        {children}
      </PrimaryButton>
    </motion.div>
  );
}
