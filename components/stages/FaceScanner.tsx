"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ContinueButton, PrimaryButton } from "../ui/Buttons";
import { Portrait } from "../ui/Portrait";
import { Eyebrow, StageHeading } from "../ui/StageHeading";
import { useSound } from "../SoundProvider";

const ease = [0.22, 1, 0.36, 1] as const;

const READINGS = [
  { label: "Face detected", value: "Yes. Obviously." },
  { label: "Smile", value: "Dangerous" },
  { label: "Resting b— face", value: "Detected ✓ (it's just how she is)" },
  { label: "Style", value: "Effortless" },
];

// Phases: idle → scanning (readings tick in) → measuring cuteness → error
const READING_MS = 750;
const MEASURE_MS = 1900;

export function FaceScanner({ onNext }: { onNext: () => void }) {
  const { play } = useSound();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(-1); // -1 idle, 0..n readings, n measuring, n+1 error
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const measuring = step === READINGS.length;
  const broken = step > READINGS.length;
  const scanning = step >= 0 && !broken;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const start = () => {
    if (step !== -1) return;
    play("tap");
    const per = reduce ? 150 : READING_MS;
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    setStep(0);
    READINGS.forEach((_, i) => at(per * (i + 1), () => {
      setStep(i + 1);
      play("sparkle");
    }));
    at(per * (READINGS.length + 1) + (reduce ? 300 : MEASURE_MS), () => {
      setStep(READINGS.length + 1);
      play("burst");
    });
  };

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
        <Eyebrow className="mb-4">Facial analysis · v2.0 (very advanced)</Eyebrow>
        <StageHeading className="font-display text-[clamp(2.3rem,10vw,4.2rem)] leading-[1] text-ivory">
          Hold still. <span className="italic text-violet">Quick scan.</span>
        </StageHeading>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -2 }}
        animate={broken && !reduce ? { opacity: 1, y: 0, rotate: 0, x: [0, -8, 7, -5, 4, 0] } : { opacity: 1, y: 0, rotate: 0 }}
        transition={broken ? { duration: 0.45 } : { duration: 0.8, delay: 0.2, ease }}
        className="relative mt-7 w-[min(66vw,260px)]"
      >
        <div className={broken ? "glitch" : ""}>
          <Portrait />
        </div>

        {/* HUD corners */}
        <div aria-hidden="true" className="pointer-events-none absolute -inset-2">
          {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((c) => (
            <span key={c} className={`absolute h-6 w-6 ${c} ${broken ? "border-pink" : "border-violet/80"} transition-colors`} />
          ))}
        </div>

        {/* face box */}
        <AnimatePresence>
          {step >= 1 && !broken && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute top-[5%] left-[35%] h-[26%] w-[28%] rounded-sm border border-pink shadow-[0_0_12px_rgba(255,61,154,0.6)]"
              initial={{ opacity: 0, scale: 1.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease }}
            >
              <span className="absolute -top-5 left-0 font-mono text-[0.5rem] tracking-[0.2em] whitespace-nowrap text-pink uppercase">
                Subject: Amarachi
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* scan line */}
        {scanning && (
          <div aria-hidden="true" className="scan-line pointer-events-none absolute inset-x-0 h-[3px] bg-pink shadow-[0_0_18px_4px_rgba(255,61,154,0.7)]" />
        )}

        {/* error overlay */}
        <AnimatePresence>
          {broken && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center rounded-xl bg-ink/55 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                aria-hidden="true"
                className="text-5xl"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.45 }}
              >
                ⚠️
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-7 w-full max-w-[22rem]" aria-live="polite">
        {step === -1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <PrimaryButton onClick={start}>START SCAN</PrimaryButton>
          </motion.div>
        )}

        {step >= 0 && !broken && (
          <ul className="space-y-2 text-left font-mono text-[0.72rem] tracking-[0.06em]">
            {READINGS.slice(0, step).map((r) => (
              <motion.li
                key={r.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-between gap-4 border-b border-ivory/8 pb-2"
              >
                <span className="text-ivory/45 uppercase">{r.label}</span>
                <span className="text-right text-ivory">{r.value}</span>
              </motion.li>
            ))}
            {measuring && (
              <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-1">
                <div className="flex justify-between">
                  <span className="text-ivory/45 uppercase">Cuteness level</span>
                  <span className="text-pink">calculating…</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ivory/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet to-pink"
                    initial={{ width: "0%" }}
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: MEASURE_MS / 1000, ease: "easeIn" }}
                  />
                </div>
                <motion.p
                  className="mt-1 text-right text-[0.65rem] text-pink"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1] }}
                  transition={{ duration: MEASURE_MS / 1000, times: [0, 0.6, 1] }}
                >
                  100%… 120%… 160%… ?!
                </motion.p>
              </motion.li>
            )}
          </ul>
        )}

        {broken && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <p className="font-mono text-[0.66rem] tracking-[0.28em] text-pink uppercase">Error 404: chill not found</p>
            <p className="mt-3 font-display text-[clamp(1.6rem,7vw,2.2rem)] leading-tight text-ivory">
              Subject too pretty. <span className="italic text-pink">Scanner overheated.</span>
            </p>
            <p className="mt-2 font-sans text-[0.88rem] text-ivory/50">We&apos;ll just have to take your word for it.</p>
            <div className="mt-6 flex justify-center">
              <ContinueButton onClick={onNext}>Continue</ContinueButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
