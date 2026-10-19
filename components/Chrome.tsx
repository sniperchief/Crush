"use client";

import { useSound } from "./SoundProvider";

function Progress({ current, total, label, inverted }: { current: number; total: number; label: string; inverted: boolean }) {
  const solid = inverted ? "#fff" : "var(--color-ink)";
  return (
    <div
      role="progressbar"
      aria-label="Page"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-valuetext={`Page ${current + 1} of ${total}: ${label}`}
      className="mt-1.5 flex items-center gap-1.5"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-1.5 transition-[width,background] duration-500"
          style={{
            width: i === current ? 18 : 6,
            background: i === current ? (inverted ? "#fff" : "var(--color-blue)") : i < current ? solid : "transparent",
            boxShadow: i > current ? `inset 0 0 0 1.2px ${solid}` : "none",
          }}
        />
      ))}
    </div>
  );
}

function SoundToggle({ inverted }: { inverted: boolean }) {
  const { enabled, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Sound on. Turn sound off" : "Sound off. Turn sound on"}
      className={`inline-flex h-11 items-center gap-2 rounded-full border-[1.5px] px-4 ${
        inverted ? "border-white text-white" : "border-ink text-ink"
      }`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <span className="label">{enabled ? "On" : "Off"}</span>
    </button>
  );
}

export function Header({ current, total, label, inverted }: { current: number; total: number; label: string; inverted: boolean }) {
  return (
    <header
      className={`sticky top-0 z-30 border-b-[1.5px] px-4 py-[14px] transition-colors duration-500 ${
        inverted ? "border-white bg-blue text-white" : "border-ink bg-paper text-ink"
      }`}
    >
      <div className="mx-auto flex max-w-[34rem] items-center justify-between gap-4">
        <div>
          <p className="label">Built by Ikenga</p>
          <Progress current={current} total={total} label={label} inverted={inverted} />
        </div>
        <SoundToggle inverted={inverted} />
      </div>
    </header>
  );
}
