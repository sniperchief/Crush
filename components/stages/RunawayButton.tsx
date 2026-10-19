"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ContinueButton } from "../ui/Buttons";
import { Sparkle } from "../ui/Sparkle";
import { Eyebrow, StageHeading } from "../ui/StageHeading";
import { useSound } from "../SoundProvider";

const ease = [0.22, 1, 0.36, 1] as const;

// YES escapes this many times, then stays put for the final try.
const ESCAPES = 2;

const NO_POS = { x: 70, y: 50 };

type Emoji = { id: number; x: number; y: number };

export function RunawayButton({ onNext }: { onNext: () => void }) {
  const { play } = useSound();
  const [yesPos, setYesPos] = useState({ x: 30, y: 50 });
  const [tries, setTries] = useState(0);
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [wrongButton, setWrongButton] = useState(false);
  const [done, setDone] = useState(false);
  const skipClick = useRef(false);
  const catchable = tries >= ESCAPES;

  const escape = () => {
    let next = yesPos;
    // Somewhere far from where it was, and clear of NO.
    for (let i = 0; i < 30; i++) {
      const cand = { x: 14 + Math.random() * 72, y: 14 + Math.random() * 72 };
      const fromHere = Math.hypot(cand.x - yesPos.x, cand.y - yesPos.y);
      const fromNo = Math.hypot(cand.x - NO_POS.x, (cand.y - NO_POS.y) * 0.6);
      if (fromHere > 35 && fromNo > 28) {
        next = cand;
        break;
      }
    }
    setEmojis((list) => [...list, { id: Date.now(), x: yesPos.x, y: yesPos.y }]);
    setYesPos(next);
    setTries((n) => n + 1);
    setWrongButton(false);
    play("pop");
  };

  const onYesPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    // Reset each press: the click from an escaped tap often never fires.
    skipClick.current = false;
    if (done || catchable) return;
    e.preventDefault();
    skipClick.current = true;
    escape();
  };

  const onYesClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (done) return;
    if (skipClick.current) {
      skipClick.current = false;
      return;
    }
    // Keyboard presses (detail === 0) follow the same rules as taps.
    if (!catchable && e.detail === 0) return escape();
    if (catchable) {
      setDone(true);
      setWrongButton(false);
      play("chime");
    }
  };

  const onNo = () => {
    if (done) return;
    setWrongButton(true);
    play("tap");
  };

  const message = done
    ? null
    : wrongButton
      ? "Wrong button 😂 try the other one."
      : catchable
        ? "Okay okay… one more try."
        : tries === 1
          ? "Too slow 😂"
          : null;

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
        <Eyebrow className="mb-4">One simple question</Eyebrow>
        <StageHeading className="font-display text-[clamp(2.3rem,10vw,4.3rem)] leading-[1] text-ivory">
          Do you think you&apos;re <span className="italic text-pink">beautiful?</span>
        </StageHeading>
        <p className="mx-auto mt-3 max-w-[20rem] font-sans text-[0.92rem] text-ivory/55">Be honest.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative mt-6 h-[min(52vh,340px)] w-full max-w-[30rem] rounded-3xl border border-dashed border-ivory/10"
      >
        {/* laughing emojis left behind where YES used to be */}
        {emojis.map((em) => (
          <motion.span
            key={em.id}
            aria-hidden="true"
            className="pointer-events-none absolute text-3xl"
            style={{ left: `${em.x}%`, top: `${em.y}%`, x: "-50%", y: "-50%" }}
            initial={{ scale: 0, opacity: 1, rotate: -20 }}
            animate={{ scale: [0, 1.4, 1], opacity: [1, 1, 0], rotate: 15, y: ["-50%", "-50%", "120%"] }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          >
            😂
          </motion.span>
        ))}

        <button
          type="button"
          onClick={onNo}
          disabled={done}
          className="chrome-ring absolute flex min-h-14 min-w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.04] px-8 text-[0.8rem] font-semibold tracking-[0.28em] text-ivory transition-opacity disabled:opacity-40"
          style={{ left: `${NO_POS.x}%`, top: `${NO_POS.y}%` }}
        >
          NO
        </button>

        <motion.button
          type="button"
          onPointerDown={onYesPointerDown}
          onClick={onYesClick}
          aria-label={catchable ? "Yes" : "Yes (good luck)"}
          className="chrome-ring btn-glow absolute flex min-h-14 min-w-28 items-center justify-center rounded-full bg-pink px-8 text-[0.8rem] font-semibold tracking-[0.28em] text-ink"
          style={{ x: "-50%", y: "-50%" }}
          animate={{
            left: `${yesPos.x}%`,
            top: `${yesPos.y}%`,
            rotate: catchable ? 0 : tries * 9 - 6,
            scale: done ? [1, 1.2, 1] : 1,
          }}
          transition={{ type: "spring", stiffness: 520, damping: 28 }}
        >
          YES
        </motion.button>
      </motion.div>

      <div className="mt-6 flex min-h-[7rem] w-full max-w-[24rem] flex-col items-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="flex flex-col items-center"
            >
              <p className="flex items-center gap-3 font-display text-[clamp(1.5rem,6.5vw,2rem)] leading-tight text-ivory">
                <Sparkle className="h-4 w-4 shrink-0 text-pink" />
                Correct answer. Confidence looks good on you.
              </p>
              <div className="mt-6">
                <ContinueButton onClick={onNext}>Continue</ContinueButton>
              </div>
            </motion.div>
          ) : message ? (
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className={
                catchable && !wrongButton
                  ? "chrome-ring rounded-full bg-pink/10 px-5 py-2.5 font-sans text-[0.95rem] text-ivory"
                  : "font-mono text-[0.72rem] tracking-[0.2em] text-violet/85 uppercase"
              }
            >
              {message}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
