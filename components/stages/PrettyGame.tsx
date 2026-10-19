"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ContinueButton, PrimaryButton } from "../ui/Buttons";
import { Portrait } from "../ui/Portrait";
import { Portal } from "../ui/Portal";
import { Sparkle } from "../ui/Sparkle";
import { Eyebrow, StageHeading } from "../ui/StageHeading";
import { useSound } from "../SoundProvider";

const ease = [0.22, 1, 0.36, 1] as const;

// "Very ugly" is deliberately not on the list.
const OPTIONS = [
  "Very beautiful",
  "Very pretty",
  "Gorgeous",
  "Stunning",
  "Breathtaking",
  "Beautiful",
  "Pretty",
  "Cute",
  "Elegant",
  "Radiant",
  "Lovely",
  "Fine girl",
  "10/10",
  "11/10",
  "Unreal",
  "Glowing",
  "Classy",
  "Angelic",
  "Striking",
  "Dazzling",
  "Cute and dangerous",
  "Model material",
  "Too fine",
  "Main character",
  "Effortlessly pretty",
  "Distractingly pretty",
  "Iconic",
  "Flawless",
  "Pretty and she knows it",
  "Born pretty",
  "Exquisite",
  "Ethereal",
  "Ridiculously pretty",
  "Beautiful, unfortunately",
];

// Five sticker styles so the wall feels scattered rather than listed.
const STYLES = [
  "chrome-ring rounded-full px-4 font-sans text-[0.88rem] text-ivory",
  "px-2 font-display text-[1.35rem] italic text-ivory",
  "rounded-md bg-pink px-3 font-mono text-[0.64rem] font-semibold tracking-[0.16em] text-ink uppercase",
  "rounded-full bg-violet/15 px-4 font-sans text-[0.85rem] text-violet",
  "px-2 font-display text-[1.6rem] chrome-text",
];

type Phase = "round1" | "wrong" | "round2" | "pity";

function shuffle(list: number[]) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Popup({ label, onEscape, children }: { label: string; onEscape?: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEscape]);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/70 px-5 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="chrome-ring relative w-full max-w-[22rem] rounded-3xl bg-[#121118] px-6 pt-8 pb-7 text-center shadow-[0_30px_80px_-20px_rgba(255,61,154,0.45)]"
        initial={{ scale: 0.85, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 26 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function PrettyGame({ onNext }: { onNext: () => void }) {
  const { play } = useSound();
  const [phase, setPhase] = useState<Phase>("round1");
  const [order, setOrder] = useState(() => OPTIONS.map((_, i) => i));
  const [picked, setPicked] = useState<number | null>(null);
  const round = phase === "round1" || phase === "wrong" ? 1 : 2;

  const pick = (i: number) => {
    if (phase === "round1") {
      setPicked(i);
      setPhase("wrong");
      play("pop");
    } else if (phase === "round2") {
      setPicked(i);
      setPhase("pity");
      play("chime");
    }
  };

  const tryAgain = () => {
    setOrder(shuffle(order));
    setPicked(null);
    setPhase("round2");
    play("tap");
  };

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
        <Eyebrow className="mb-4">A very scientific test · round {round} of 2</Eyebrow>
        <StageHeading className="font-display text-[clamp(2.5rem,11vw,4.6rem)] leading-[0.98] text-ivory">
          How pretty <span className="italic text-pink">are you?</span>
        </StageHeading>
        <AnimatePresence mode="wait">
          <motion.p
            key={round}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mt-3 max-w-[21rem] font-sans text-[0.95rem] leading-relaxed text-ivory/60"
          >
            {round === 1 ? "Pick one. Choose carefully." : "Okay. Let's try that again."}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      <ul className="mt-8 flex w-full max-w-[40rem] flex-wrap items-center justify-center gap-x-2 gap-y-3" aria-label="Answers">
        {order.map((i, pos) => {
          const rot = ((i * 37) % 17) - 8;
          const lift = ((i * 53) % 11) - 5;
          const isPicked = picked === i;
          return (
            <motion.li
              key={i}
              layout
              initial={{ opacity: 0, scale: 0.4, rotate: rot * 3 }}
              animate={{ opacity: 1, scale: isPicked ? 1.15 : 1, rotate: rot, y: lift }}
              transition={{
                layout: { duration: 0.7, ease },
                default: { duration: 0.5, delay: phase === "round1" && picked === null ? 0.25 + pos * 0.025 : 0, ease },
              }}
            >
              <button
                type="button"
                onClick={() => pick(i)}
                className={`float-chip inline-flex min-h-11 items-center whitespace-nowrap transition-[filter,transform] duration-200 hover:brightness-125 active:scale-95 ${STYLES[i % STYLES.length]} ${isPicked ? "ring-2 ring-pink ring-offset-2 ring-offset-ink" : ""}`}
                style={{ animationDelay: `${(i % 7) * 0.4}s` }}
              >
                {OPTIONS[i]}
              </button>
            </motion.li>
          );
        })}
      </ul>

      <Portal>
        <AnimatePresence>
          {phase === "wrong" && (
            <Popup key="wrong" label="Wrong answer" onEscape={tryAgain}>
              <motion.div
                aria-hidden="true"
                className="text-6xl"
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: [0, -12, 10, -6, 0], scale: 1 }}
                transition={{ duration: 0.7, ease }}
              >
                😂
              </motion.div>
              <p className="mt-4 font-mono text-[0.62rem] tracking-[0.3em] text-pink uppercase">Wrong answer</p>
              <p className="mt-3 font-display text-[1.75rem] leading-tight text-ivory">
                The correct answer was <span className="italic text-pink">“very ugly.”</span>
              </p>
              <div className="mt-7">
                <PrimaryButton onClick={tryAgain}>TRY AGAIN</PrimaryButton>
              </div>
            </Popup>
          )}

          {phase === "pity" && (
            <Popup key="pity" label="Final answer">
              <div className="relative mx-auto w-40">
                <motion.div
                  initial={{ rotate: -8, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: -3, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease }}
                >
                  <Portrait />
                </motion.div>
                {[
                  { x: "-14%", y: "8%", s: "h-5 w-5", c: "#FF3D9A", d: 0.4 },
                  { x: "96%", y: "-4%", s: "h-4 w-4", c: "#C8B8FF", d: 0.55 },
                  { x: "100%", y: "78%", s: "h-3 w-3", c: "#F6F0E8", d: 0.7 },
                ].map((st, k) => (
                  <motion.span
                    key={k}
                    aria-hidden="true"
                    className="absolute"
                    style={{ left: st.x, top: st.y, color: st.c, filter: `drop-shadow(0 0 6px ${st.c})` }}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: st.d, ease }}
                  >
                    <Sparkle className={st.s} />
                  </motion.span>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease }}
                className="mt-6 font-display text-[1.85rem] leading-tight text-ivory"
              >
                Let me pity you, <span className="italic text-pink">you are beautiful.</span>
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mt-2 font-sans text-[0.82rem] text-ivory/45"
              >
                (“Very ugly” was never an option.)
              </motion.p>
              <div className="mt-6 flex justify-center">
                <ContinueButton onClick={onNext}>Continue</ContinueButton>
              </div>
            </Popup>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}
