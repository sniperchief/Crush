"use client";

import { useSound } from "./SoundProvider";

export function Progress({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-valuetext={`Part ${current + 1} of ${total}: ${label}`}
        className="flex items-center gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="h-[3px] rounded-full transition-all duration-700 ease-out"
            style={{
              width: i === current ? 22 : 8,
              background:
                i < current
                  ? "rgba(246,240,232,0.55)"
                  : i === current
                    ? "var(--color-pink)"
                    : "rgba(246,240,232,0.14)",
              boxShadow: i === current ? "0 0 10px rgba(255,61,154,0.8)" : "none",
            }}
          />
        ))}
      </div>
      <span aria-hidden="true" className="font-mono text-[0.6rem] tracking-[0.24em] text-ivory/45 tabular-nums">
        0{current + 1} / 0{total}
      </span>
    </div>
  );
}

export function SoundToggle() {
  const { enabled, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Sound on. Turn sound off" : "Sound off. Turn sound on"}
      className="chrome-ring -mr-1 inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-white/[0.03] px-3 text-ivory/70 backdrop-blur-sm transition-colors hover:text-ivory"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none" />
        {enabled ? (
          <>
            <path d="M15.5 9a4 4 0 0 1 0 6" />
            <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
          </>
        ) : (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        )}
      </svg>
      <span className="hidden font-sans text-[0.6rem] tracking-[0.28em] uppercase sm:inline">
        {enabled ? "Sound" : "Muted"}
      </span>
    </button>
  );
}
