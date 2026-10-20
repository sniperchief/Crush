"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ContinueButton } from "../ui/Buttons";
import { StageHeading, TopRow } from "../ui/StageHeading";
import { useSound } from "../SoundProvider";

const ease = [0.22, 1, 0.36, 1] as const;

// YES escapes this many times, then stays put for the final try.
const ESCAPES = 2;

const NO_POS = { x: 70, y: 50 };

type Pos = { x: number; y: number };
// Where YES was and where it went, in % of the answer area plus its size in px.
type Escape = { id: number; from: Pos; to: Pos; w: number; h: number };

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink bg-white">
      {checked && (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <motion.path
            d="M4 12.5l5 5L20 6"
            fill="none"
            stroke="#1F4FD8"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, ease }}
          />
        </svg>
      )}
    </span>
  );
}

/** Hand-drawn blue arrow from YES's old spot to its new one. */
function EscapeArrow({ e }: { e: Escape }) {
  const x1 = (e.from.x / 100) * e.w;
  const y1 = (e.from.y / 100) * e.h;
  const x2 = (e.to.x / 100) * e.w;
  const y2 = (e.to.y / 100) * e.h;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  // Trim both ends so the arrow sits between the buttons, then bow it.
  const sx = x1 + ux * 46;
  const sy = y1 + uy * 40;
  const ex = x2 - ux * 70;
  const ey = y2 - uy * 42;
  const cx = (sx + ex) / 2 - uy * 40;
  const cy = (sy + ey) / 2 + ux * 40;
  // Head points along the curve's final tangent.
  const tx = ex - cx;
  const ty = ey - cy;
  const tl = Math.hypot(tx, ty) || 1;
  const hx = tx / tl;
  const hy = ty / tl;
  const head = (ang: number) => {
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    return `${ex - 13 * (hx * c - hy * s)},${ey - 13 * (hx * s + hy * c)}`;
  };

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${e.w} ${e.h}`}>
      <motion.path
        d={`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`}
        fill="none"
        stroke="#1F4FD8"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease }}
      />
      <motion.path
        d={`M${head(0.5)} L${ex},${ey} L${head(-0.5)}`}
        fill="none"
        stroke="#1F4FD8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.1 }}
      />
    </svg>
  );
}

const answerBtn =
  "absolute flex h-16 min-w-[7.5rem] items-center gap-3 rounded-[14px] border-[1.5px] border-ink pr-5 pl-3.5 text-[22px] font-bold text-ink";

export function RunawayButton({ onNext }: { onNext: () => void }) {
  const { play } = useSound();
  const [yesPos, setYesPos] = useState({ x: 30, y: 50 });
  const [tries, setTries] = useState(0);
  const [lastEscape, setLastEscape] = useState<Escape | null>(null);
  const [wrongButton, setWrongButton] = useState(false);
  const [done, setDone] = useState(false);
  const skipClick = useRef(false);
  const arenaRef = useRef<HTMLDivElement>(null);
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
    const rect = arenaRef.current?.getBoundingClientRect();
    setLastEscape({ id: Date.now(), from: yesPos, to: next, w: rect?.width ?? 360, h: rect?.height ?? 340 });
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

  return (
    <div>
      <TopRow left="Questionnaire · Q1 of 1" right="Be honest" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
        <StageHeading className="headline mt-6 text-[clamp(40px,13.4vw,58px)] text-ink [text-shadow:none]">
          Do you think you&apos;re <span className="text-blue [text-shadow:3px_3px_0_var(--color-pink)]">beautiful?</span>
        </StageHeading>
        <p className="mt-4 text-[17px] text-muted">Tick one box. Simple.</p>
      </motion.div>

      <motion.div
        ref={arenaRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease }}
        className="ruled card relative mt-6 h-[min(48vh,340px)] w-full rounded-xl"
      >
        <span className="label absolute top-3 left-3.5 text-muted">Answer area ↓</span>

        {/* where YES used to be */}
        <AnimatePresence>
          {lastEscape && !done && (
            <motion.div key={lastEscape.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                aria-hidden="true"
                className="absolute h-16 w-[7.5rem] rounded-[14px] border-[1.5px] border-dashed border-ink/60"
                style={{ left: `${lastEscape.from.x}%`, top: `${lastEscape.from.y}%`, translate: "-50% -50%" }}
              >
                <span className="hand absolute top-full left-1/2 mt-1 -translate-x-1/2 -rotate-3 text-[20px] whitespace-nowrap">it was here</span>
              </div>
              <EscapeArrow e={lastEscape} />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={onNo}
          disabled={done}
          className={`${answerBtn} bg-paper transition-opacity disabled:opacity-40`}
          style={{ left: `${NO_POS.x}%`, top: `${NO_POS.y}%`, translate: "-50% -50%" }}
        >
          <Checkbox checked={false} />
          NO
        </button>

        <motion.button
          type="button"
          onPointerDown={onYesPointerDown}
          onClick={onYesClick}
          aria-label={done ? "Yes, ticked" : catchable ? "Yes" : "Yes (good luck)"}
          className={`${answerBtn} z-10 bg-pink shadow-[4px_4px_0_#16161D]`}
          style={{ x: "-50%", y: "-50%" }}
          animate={{
            left: `${yesPos.x}%`,
            top: `${yesPos.y}%`,
            rotate: catchable ? 0 : tries * 5 - 3,
            scale: done ? [1, 1.12, 1] : 1,
          }}
          transition={{ type: "spring", stiffness: 520, damping: 28, scale: { duration: 0.45, ease } }}
        >
          <Checkbox checked={done} />
          YES
        </motion.button>
      </motion.div>

      <div className="mt-6 min-h-[6rem]" aria-live="polite">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
              <p className="text-[24px] leading-tight font-bold text-ink">Fine. You can have that one. Don&apos;t get used to it.</p>
              <div className="mt-6">
                <ContinueButton onClick={onNext} />
              </div>
            </motion.div>
          ) : wrongButton ? (
            <motion.div
              key="hint"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: -1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
              className="card inline-block rounded-xl px-4 py-3"
            >
              <p className="label font-medium text-blue">Hint</p>
              <p className="mt-1 text-[17px] font-semibold text-ink">Wrong button. Try the other one.</p>
            </motion.div>
          ) : catchable ? (
            <motion.p
              key="more"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ type: "spring", stiffness: 420, damping: 16 }}
              className="hand text-[30px]"
            >
              Okay okay… one more try.
            </motion.p>
          ) : tries === 1 ? (
            <motion.p
              key="slow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, rotate: 3 }}
              transition={{ type: "spring", stiffness: 420, damping: 16 }}
              className="hand text-[32px]"
            >
              too slow!
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
