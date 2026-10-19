"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PrimaryButton } from "../ui/Buttons";
import { Sparkle } from "../ui/Sparkle";
import { StageHeading, TopRow } from "../ui/StageHeading";
import { useSound } from "../SoundProvider";

type Particle = { id: number; x: number; y: number; size: number; rot: number; blue: boolean; square: boolean };

const ease = [0.22, 1, 0.36, 1] as const;
const pop = { type: "spring", stiffness: 420, damping: 16 } as const;

export function Opening({ onNext }: { onNext: () => void }) {
  const reduce = useReducedMotion();
  const { play } = useSound();
  const [particles, setParticles] = useState<Particle[] | null>(null);
  const leaving = !!particles;

  const start = () => {
    if (particles) return;
    play("burst");
    if (reduce) {
      onNext();
      return;
    }
    setParticles(
      Array.from({ length: 22 }, (_, i) => {
        const angle = (i / 22) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 80 + Math.random() * 150;
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          size: 6 + Math.random() * 10,
          rot: Math.random() * 180,
          blue: Math.random() > 0.5,
          square: Math.random() > 0.6,
        };
      }),
    );
    window.setTimeout(onNext, 620);
  };

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: leaving ? 0 : 1, y: 0 },
    transition: { duration: leaving ? 0.3 : 0.6, delay: leaving ? 0 : delay, ease },
  });

  return (
    <div className="relative flex min-h-[calc(100dvh-9rem)] flex-col">
      {/* halftone print marks */}
      <div aria-hidden="true" className="halftone-pink pointer-events-none absolute -top-16 -right-24 h-60 w-60 rounded-full opacity-50" />
      <div aria-hidden="true" className="halftone-blue pointer-events-none absolute bottom-40 -left-10 h-28 w-28 opacity-40" />

      <motion.div {...fade(0)}>
        <TopRow left="A small transmission" right="Oct 2026" />
      </motion.div>

      <motion.p {...fade(0.1)} className="hand mt-8 -rotate-3 text-[30px]">
        for —
      </motion.p>

      <StageHeading as="h1" autoFocus={false} className="relative mt-2">
        <span className="sr-only">Amarachi</span>
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: leaving ? 0 : 1, x: 0 }}
          transition={{ duration: leaving ? 0.3 : 0.7, delay: leaving ? 0 : 0.2, ease }}
          className="headline block text-[clamp(64px,23.5vw,112px)] [text-shadow:4px_4px_0_var(--color-pink)]"
        >
          AMA
          <br />
          RA
          <br />
          CHI.
        </motion.span>
      </StageHeading>

      <div className="relative mt-7 flex items-center gap-4">
        <motion.p {...fade(0.45)} className="flex-1 text-[22px] leading-[1.15] font-medium text-ink">
          This is slightly random. I made you something.
        </motion.p>
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={leaving ? { scale: 0, rotate: 40 } : { scale: 1, rotate: 12 }}
          transition={leaving ? { duration: 0.25 } : { ...pop, delay: 0.7 }}
          className="flex h-[104px] w-[104px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink bg-pink p-3 text-center shadow-[3px_3px_0_#16161D]"
        >
          <span className="font-hand text-[21px] leading-[0.95] font-bold text-ink">
            not weird.
            <br />
            (probably)
          </span>
        </motion.div>
      </div>

      <motion.div {...fade(0.6)} className="mt-auto pt-10">
        <div className="border-t-[1.5px] border-dashed border-ink pt-3">
          <p className="label text-muted">5 pages · approx. 2 min · sound: yes</p>
        </div>
        <div className="relative mt-4">
          <PrimaryButton onClick={start} disabled={leaving}>
            Open it
          </PrimaryButton>
          {particles?.map((p) => (
            <motion.span
              key={p.id}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2"
              initial={{ x: "-50%", y: "-50%", scale: 1, opacity: 1, rotate: 0 }}
              animate={{ x: `calc(-50% + ${p.x}px)`, y: `calc(-50% + ${p.y}px)`, scale: 0, opacity: 0, rotate: p.rot }}
              transition={{ duration: 0.75, ease }}
              style={{ color: p.blue ? "#1F4FD8" : "#FF4FA3" }}
            >
              {p.square ? (
                <span className="block border-[1.5px] border-ink bg-current" style={{ width: p.size, height: p.size }} />
              ) : (
                <Sparkle style={{ width: p.size, height: p.size }} />
              )}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
