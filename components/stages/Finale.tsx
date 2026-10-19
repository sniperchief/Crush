"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkle } from "../ui/Sparkle";
import { StageHeading } from "../ui/StageHeading";
import { useSound } from "../SoundProvider";
import { Portal } from "../ui/Portal";

const ease = [0.22, 1, 0.36, 1] as const;

const LINES = [
  <>
    Amarachi, you&apos;re <em className="text-pink">genuinely beautiful.</em>
  </>,
  <>But I think the fun part is getting to know the person behind the face.</>,
  <>
    Anyway, that&apos;s all. Don&apos;t let this website make you too proud.{" "}
    <span className="not-italic">😂</span>
  </>,
];

export function Finale({ onRestart }: { onRestart: () => void }) {
  const { play } = useSound();
  const [found, setFound] = useState(false);

  const reveal = () => {
    if (found) return;
    setFound(true);
    play("chime");
  };

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-col items-center justify-center pb-28 text-center">
      {/* the single star */}
      <div className="relative mb-10 flex h-16 w-16 items-center justify-center" aria-hidden="true">
        <motion.span
          className="absolute inset-[-60%] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(200,184,255,0.35), transparent 62%)" }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0.7], scale: [0.4, 1.1, 1] }}
          transition={{ duration: 2, ease }}
        />
        <motion.span
          className="relative text-ivory"
          style={{ filter: "drop-shadow(0 0 8px #C8B8FF) drop-shadow(0 0 24px rgba(200,184,255,0.7))" }}
          initial={{ scale: 0, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.15, ease }}
        >
          <Sparkle className="star-breathe h-7 w-7" />
        </motion.span>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.7, ease }}>
        <StageHeading className="font-sans text-[0.72rem] font-medium tracking-[0.4em] text-violet/80 uppercase">
          One last thing.
        </StageHeading>
      </motion.div>

      <div className="mt-7 max-w-[30rem] space-y-5">
        {LINES.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 1 + i * 0.45, ease }}
            className={
              i === 0
                ? "font-display text-[clamp(2.1rem,9.4vw,3.6rem)] leading-[1.02] text-ivory"
                : "font-display text-[clamp(1.25rem,5.4vw,1.75rem)] leading-snug text-ivory/80"
            }
          >
            {line}
          </motion.p>
        ))}
      </div>

      <div className="mt-10 min-h-[8rem] w-full max-w-[24rem]" aria-live="polite">
        <AnimatePresence>
          {found && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
              className="flex flex-col items-center"
            >
              <p className="chrome-ring rounded-2xl bg-white/[0.03] px-5 py-4 font-sans text-[0.92rem] leading-relaxed text-ivory/85 backdrop-blur-sm">
                <span className="mr-1 font-semibold tracking-[0.15em] text-pink">P.S.</span> You can keep the website.
                The compliments were non-refundable.
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
                className="mt-8 font-display text-3xl text-ivory/90 italic"
              >
                fin.
              </motion.p>
              <motion.button
                type="button"
                onClick={onRestart}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="mt-3 min-h-11 px-4 font-sans text-[0.62rem] tracking-[0.32em] text-ivory/40 uppercase underline-offset-4 transition-colors hover:text-ivory/80 hover:underline"
              >
                Watch again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Portal>
      {/* the finish: a soft horizon that rises once the P.S. is found */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[2] h-[55vh]"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 100%, rgba(255,61,154,0.22) 0%, rgba(200,184,255,0.10) 38%, transparent 70%)",
        }}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: found ? 1 : 0, y: found ? 0 : 60 }}
        transition={{ duration: 2.2, ease }}
      />

      {/* the tiny hidden star */}
      <motion.button
        type="button"
        onClick={reveal}
        aria-label={found ? "Tiny star, found" : "A tiny star. Tap it"}
        aria-disabled={found}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 2.6 }}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] left-[62%] z-20 flex h-12 w-12 items-center justify-center rounded-full"
      >
        <span
          className={found ? "" : "tiny-star"}
          style={{
            color: found ? "#FF3D9A" : "#F6F0E8",
            filter: found ? "drop-shadow(0 0 8px #FF3D9A)" : "drop-shadow(0 0 5px rgba(246,240,232,0.9))",
            display: "inline-flex",
            transition: "color .5s, filter .5s",
          }}
        >
          <Sparkle className="h-2.5 w-2.5" />
        </span>
        {found && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-pink/60"
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        )}
      </motion.button>
      </Portal>
    </div>
  );
}
