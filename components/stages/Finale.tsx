"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkle } from "../ui/Sparkle";
import { StageHeading } from "../ui/StageHeading";
import { useSound } from "../SoundProvider";

const ease = [0.22, 1, 0.36, 1] as const;
const pop = { type: "spring", stiffness: 380, damping: 17 } as const;
const AUTO_REVEAL_MS = 12000;

export function Finale({ onRestart }: { onRestart: () => void }) {
  const { play } = useSound();
  const [found, setFound] = useState(false);

  const reveal = () => {
    if (found) return;
    setFound(true);
    play("chime");
  };

  // If she never finds the star, the P.S. shows up on its own.
  useEffect(() => {
    if (found) return;
    const timer = setTimeout(() => {
      setFound(true);
      play("chime");
    }, AUTO_REVEAL_MS);
    return () => clearTimeout(timer);
  }, [found, play]);

  const line = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease },
  });

  return (
    <div className="relative min-h-[calc(100dvh-9rem)] pb-6 text-white">
      <div aria-hidden="true" className="halftone-white pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full opacity-35" />

      <motion.div {...line(0.15)}>
        <StageHeading className="label text-white/80">One last thing.</StageHeading>
      </motion.div>

      <motion.p {...line(0.35)} className="mt-6 text-[clamp(42px,13vw,58px)] leading-[0.9] font-extrabold tracking-[-0.04em]">
        Amarachi, you have a{" "}
        <span className="text-pink [text-shadow:3px_3px_0_var(--color-ink)]">genuinely beautiful smile.</span>
      </motion.p>

      <motion.p {...line(0.75)} className="mt-6 text-[19px] leading-snug font-medium">
        But I think the fun part is getting to know the person behind it.
      </motion.p>

      <motion.p {...line(1.1)} className="mt-4 text-[17px] leading-snug text-white/80">
        Anyway, that&apos;s all. Don&apos;t let this website make you too proud.
      </motion.p>

      {/* the tiny hidden star, with a nudge so it isn't missed */}
      <motion.div {...line(2)} className="relative mt-12 flex items-center justify-end gap-1 pr-[12%]">
        <AnimatePresence>
          {!found && (
            <motion.p
              aria-hidden="true"
              initial={{ opacity: 0, x: -6, rotate: 0 }}
              animate={{ opacity: 1, x: 0, rotate: -4 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: 2.4 }}
              className="flex items-center gap-1.5 font-hand text-[24px] leading-none font-bold text-white"
            >
              psst… tap the star
              <svg viewBox="0 0 40 20" className="h-4 w-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12 C12 4 24 4 36 10" />
                <path d="M29 5 L36 10 L29 14" />
              </svg>
            </motion.p>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={reveal}
          aria-label={found ? "Tiny star, found" : "A tiny star. Tap it"}
          aria-disabled={found}
          className="relative flex h-11 w-11 items-center justify-center rounded-full"
        >
          <span className={found ? "" : "tiny-star"} style={{ display: "inline-flex", color: "#FF4FA3" }}>
            <Sparkle className="h-5 w-5" />
          </span>
          {found && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-[1.5px] border-pink"
              initial={{ scale: 0.3, opacity: 1 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          )}
        </button>
      </motion.div>

      <div aria-live="polite">
        <AnimatePresence>
          {found && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <motion.div
                initial={{ scale: 0.6, rotate: 8, opacity: 0 }}
                animate={{ scale: 1, rotate: -2.5, opacity: 1 }}
                transition={pop}
                className="relative mt-2 border-[1.5px] border-ink bg-sticky px-5 pt-6 pb-5 text-ink shadow-[4px_4px_0_#16161D]"
              >
                <span aria-hidden="true" className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[3deg]" />
                <p className="font-hand text-[27px] leading-[1.05] font-bold">
                  P.S. You can keep the website. The compliments were non-refundable.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease }}
                className="mt-10 flex items-end justify-between gap-4"
              >
                <div>
                  <p className="text-[44px] leading-none font-extrabold tracking-[-0.04em]">fin.</p>
                  <button
                    type="button"
                    onClick={onRestart}
                    className="label mt-2 -ml-1 min-h-11 px-1 text-white/85 underline-offset-4 hover:underline"
                  >
                    Read it again ↺
                  </button>
                </div>
                <motion.div
                  initial={{ scale: 1.8, rotate: -10, opacity: 0 }}
                  animate={{ scale: 1, rotate: 4, opacity: 1 }}
                  transition={{ ...pop, delay: 0.9 }}
                  className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1.5 border-[1.5px] border-white text-center"
                >
                  <Sparkle className="h-5 w-5 text-pink" />
                  <span className="label text-[9px] leading-tight">
                    Built by
                    <br />
                    Ikenga
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
