"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ContinueButton, PrimaryButton } from "../ui/Buttons";
import { Portrait } from "../ui/Portrait";
import { StageHeading, TopRow } from "../ui/StageHeading";
import { useSound } from "../SoundProvider";

const ease = [0.22, 1, 0.36, 1] as const;

const READINGS = [
  { label: "Face detected", value: "Yes. Obviously." },
  { label: "Smile", value: "Dangerous" },
  { label: "Resting face", value: "Detected. It's just how she is." },
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
    READINGS.forEach((_, i) =>
      at(per * (i + 1), () => {
        setStep(i + 1);
        play("sparkle");
      }),
    );
    at(per * (READINGS.length + 1) + (reduce ? 300 : MEASURE_MS), () => {
      setStep(READINGS.length + 1);
      play("burst");
    });
  };

  return (
    <div>
      <TopRow
        left="Lab report no. 002"
        right={
          <span className={broken ? "text-stamp" : "text-blue"}>
            <span className={scanning ? "blink" : ""}>●</span> {broken ? "Error" : scanning ? "Scanning" : "Ready"}
          </span>
        }
      />

      <StageHeading className="headline mt-6 text-[clamp(40px,12.8vw,56px)] text-ink [text-shadow:none]">
        Hold still.
        <br />
        <span className="text-blue [text-shadow:3px_3px_0_var(--color-pink)]">Quick scan.</span>
      </StageHeading>

      <div className="mt-8 flex items-start gap-3">
        {/* polaroid */}
        <motion.div
          initial={{ opacity: 0, y: 16, rotate: 2 }}
          animate={broken && !reduce ? { opacity: 1, y: 0, rotate: -6, x: [0, -8, 7, -5, 4, 0] } : { opacity: 1, y: 0, rotate: broken ? -6 : -3 }}
          transition={broken ? { duration: 0.45 } : { duration: 0.6, delay: 0.15, ease }}
          className="relative w-[min(54vw,220px)] shrink-0 border-[1.5px] border-ink bg-white p-[10px] pb-[34px] shadow-[4px_4px_0_#16161D]"
        >
          <span aria-hidden="true" className="tape -top-3 left-1/2 z-10 -translate-x-1/2 -rotate-[4deg]" />
          <div className="relative overflow-hidden border border-ink/20">
            <Portrait />

            <AnimatePresence>
              {step >= 1 && !broken && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-[5%] left-[35%] h-[26%] w-[28%] border-2 border-dashed border-ink"
                  initial={{ opacity: 0, scale: 1.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                />
              )}
            </AnimatePresence>

            {scanning && <div aria-hidden="true" className="scan-line pointer-events-none absolute inset-x-0 h-[3px] bg-pink" />}
          </div>
          <p className="hand absolute inset-x-0 bottom-1.5 text-center text-[22px] text-ink">subject: A.</p>

          {/* rubber stamp */}
          <AnimatePresence>
            {broken && (
              <motion.div
                className="absolute top-[34%] left-1/2 z-20 flex flex-col items-center rounded-[10px] border-4 border-stamp bg-white/85 px-3 py-2 text-stamp"
                style={{ x: "-50%" }}
                initial={{ scale: 2.4, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: -14, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 15 }}
              >
                <span className="text-[40px] leading-[0.85] font-extrabold tracking-[-0.04em]">
                  TOO
                  <br />
                  PRETTY
                </span>
                <span className="label mt-1.5 text-[9px] whitespace-nowrap">Scanner overheated</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 1, rotate: 5 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="hand mt-6 text-[23px]"
        >
          v2.0 (very advanced). Do not blink.
        </motion.p>
      </div>

      <div className="mt-8" aria-live="polite">
        {step === -1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <PrimaryButton onClick={start}>Start scan</PrimaryButton>
          </motion.div>
        )}

        {scanning && (
          <div>
            <dl>
              {READINGS.slice(0, step).map((r) => (
                <motion.div
                  key={r.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-baseline justify-between gap-4 border-b border-ink/25 py-2.5"
                >
                  <dt className="label shrink-0 text-muted">{r.label}</dt>
                  <dd className="text-right text-[15px] font-semibold text-ink">{r.value}</dd>
                </motion.div>
              ))}
            </dl>

            {measuring && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                <div className="flex items-baseline justify-between">
                  <span className="label text-muted">Cuteness level</span>
                  <motion.span
                    className="text-[18px] font-extrabold text-stamp"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0, 1] }}
                    transition={{ duration: MEASURE_MS / 1000, times: [0, 0.7, 1] }}
                  >
                    160% ?!
                  </motion.span>
                </div>
                <div className="relative mt-2 w-[72%]">
                  <div className="relative h-7 border-[1.5px] border-ink bg-white">
                    {Array.from({ length: 11 }, (_, i) => (
                      <span
                        key={i}
                        aria-hidden="true"
                        className="absolute bottom-0 w-px bg-ink"
                        style={{ left: `${i * 10}%`, height: i % 5 === 0 ? "60%" : "30%" }}
                      />
                    ))}
                    <motion.div
                      className="absolute top-[-1.5px] bottom-[-1.5px] left-[-1.5px] border-[1.5px] border-ink bg-pink"
                      initial={{ width: "0%" }}
                      animate={{ width: "160%" }}
                      transition={{ duration: MEASURE_MS / 1000, ease: "easeIn" }}
                    />
                  </div>
                  <div className="label relative mt-1 h-4 text-muted">
                    <span className="absolute left-0">0</span>
                    <span className="absolute left-1/2 -translate-x-1/2">50</span>
                    <span className="absolute right-0 translate-x-1/2 whitespace-nowrap">100 (max)</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {broken && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3, ease }}>
            <p className="label text-stamp">Error 404 · chill not found</p>
            <p className="headline mt-3 text-[clamp(34px,10vw,46px)]">Subject too pretty. Machine gave up.</p>
            <p className="hand mt-4 -rotate-2 text-[28px]">We&apos;ll just take your word for it.</p>
            <div className="mt-6">
              <ContinueButton onClick={onNext} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
