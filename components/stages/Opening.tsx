"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PrimaryButton } from "../ui/Buttons";
import { Sparkle } from "../ui/Sparkle";
import { Eyebrow, StageHeading } from "../ui/StageHeading";
import { useSound } from "../SoundProvider";

type Particle = { id: number; x: number; y: number; size: number; rot: number; pink: boolean };

const ease = [0.22, 1, 0.36, 1] as const;

export function Opening({ onNext }: { onNext: () => void }) {
  const reduce = useReducedMotion();
  const { play } = useSound();
  const [particles, setParticles] = useState<Particle[] | null>(null);

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
        const dist = 70 + Math.random() * 150;
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          size: 4 + Math.random() * 10,
          rot: Math.random() * 180,
          pink: Math.random() > 0.4,
        };
      }),
    );
    window.setTimeout(onNext, 620);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-10 flex h-20 w-20 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,61,154,0.45), transparent 65%)" }}
          animate={particles ? { scale: 3.2, opacity: 0 } : { scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
          transition={particles ? { duration: 0.6, ease } : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          initial={{ scale: 0, rotate: -90, opacity: 0 }}
          animate={particles ? { scale: 0, rotate: 135, opacity: 0 } : { scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: particles ? 0.35 : 1.1, ease }}
          className="relative text-ivory"
          style={{ filter: "drop-shadow(0 0 10px #FF3D9A) drop-shadow(0 0 22px rgba(255,61,154,0.6))" }}
        >
          <Sparkle className="star-spin h-9 w-9" />
        </motion.span>
        {particles?.map((p) => (
          <motion.span
            key={p.id}
            aria-hidden="true"
            className="absolute left-1/2 top-1/2"
            initial={{ x: "-50%", y: "-50%", scale: 1, opacity: 1, rotate: 0 }}
            animate={{ x: `calc(-50% + ${p.x}px)`, y: `calc(-50% + ${p.y}px)`, scale: 0, opacity: 0, rotate: p.rot }}
            transition={{ duration: 0.75, ease }}
            style={{ color: p.pink ? "#FF3D9A" : "#C8B8FF" }}
          >
            <Sparkle style={{ width: p.size, height: p.size }} />
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: particles ? 0 : 1, y: 0 }}
        transition={{ duration: particles ? 0.4 : 0.8, delay: particles ? 0 : 0.35, ease }}
      >
        <Eyebrow className="mb-6">A small transmission · for</Eyebrow>
      </motion.div>

      <StageHeading as="h1" autoFocus={false} className="flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 30, letterSpacing: "0.12em" }}
          animate={{ opacity: particles ? 0 : 1, y: 0, letterSpacing: "-0.02em" }}
          transition={{ duration: particles ? 0.4 : 1.3, delay: particles ? 0.05 : 0.45, ease }}
          className="chrome-text block font-display text-[clamp(3.6rem,21vw,11.5rem)] leading-[0.9]"
        >
          Amarachi,
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: particles ? 0 : 1, y: 0 }}
          transition={{ duration: particles ? 0.35 : 0.9, delay: particles ? 0.1 : 0.9, ease }}
          className="mt-4 block font-display text-[clamp(1.6rem,7.4vw,3rem)] leading-tight text-ivory italic"
        >
          this is slightly random.
        </motion.span>
      </StageHeading>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: particles ? 0 : 1, y: 0 }}
        transition={{ duration: particles ? 0.3 : 0.8, delay: particles ? 0.12 : 1.25, ease }}
        className="mt-6 max-w-[22rem] font-sans text-[0.98rem] leading-relaxed text-ivory/65"
      >
        I made you something. Don&apos;t worry, it&apos;s not weird.{" "}
        <span className="whitespace-nowrap text-violet">Probably.</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: particles ? 0 : 1, y: 0 }}
        transition={{ duration: particles ? 0.25 : 0.8, delay: particles ? 0.15 : 1.5, ease }}
        className="mt-11"
      >
        <PrimaryButton onClick={start} disabled={!!particles}>
          LET&apos;S SEE
          <Sparkle className="h-3 w-3 transition-transform duration-300 group-hover:rotate-90" />
        </PrimaryButton>
      </motion.div>
    </div>
  );
}
