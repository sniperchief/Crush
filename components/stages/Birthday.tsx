"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ContinueButton, SecondaryButton } from "../ui/Buttons";
import { StageHeading } from "../ui/StageHeading";
import { Confetti, type ConfettiShot } from "../Confetti";
import { useSound } from "../SoundProvider";
import { Portal } from "../ui/Portal";

const ease = [0.22, 1, 0.36, 1] as const;
const INK = "#16161D";

function Cake({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 240 220" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <pattern id="cake-dots" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1.4" fill="#fff" opacity="0.35" />
        </pattern>
        <pattern id="candle-stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="8" height="8" fill="#fff" />
          <rect width="3.2" height="8" fill="#FF4FA3" />
        </pattern>
      </defs>

      {/* glow */}
      <AnimatePresence>
        {lit && (
          <motion.circle
            key="glow"
            cx="120"
            cy="38"
            r="34"
            fill="#FFD23F"
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.92, 1.05, 0.92] }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.35 } }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
        )}
      </AnimatePresence>

      {/* plate */}
      <ellipse cx="120" cy="192" rx="106" ry="15" fill={INK} />

      {/* sponge */}
      <path d="M40 110 L40 182 A80 14 0 0 0 200 182 L200 110 Z" fill="#1F4FD8" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M40 110 L40 182 A80 14 0 0 0 200 182 L200 110 Z" fill="url(#cake-dots)" />

      {/* icing */}
      <path
        d="M40 110 C40 118 43 123 47 125 C49 139 57 140 58 128 C63 131 70 133 78 134 C80 152 90 152 91 135 C100 137 110 138 120 138 C130 138 136 137 144 136 C146 156 157 156 158 134 C167 133 175 131 182 128 C184 143 193 143 193 123 C197 120 200 116 200 110 Z"
        fill="#FF4FA3"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <ellipse cx="120" cy="110" rx="80" ry="16" fill="#FF4FA3" stroke={INK} strokeWidth="2.5" />

      {/* candle */}
      <rect x="113" y="60" width="14" height="52" rx="3" fill="url(#candle-stripes)" stroke={INK} strokeWidth="2.5" />
      <path d="M120 60 L120 52" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />

      {/* flame */}
      <AnimatePresence>
        {lit && (
          <motion.g
            key="flame"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1, y: -6 }}
            transition={{ duration: 0.3, ease }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
          >
            <g className="flame">
              <path d="M120 16 C129 29 133 38 129 46 C126 53 114 53 111 46 C107 38 111 29 120 16Z" fill="#FF7A3D" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M120 31 C124 37 125 42 123 46 C121 49 119 49 117 46 C115 42 116 37 120 31Z" fill="#FFD23F" />
            </g>
          </motion.g>
        )}
      </AnimatePresence>

      {/* tap target ring */}
      {lit && <circle className="spin-slow" cx="120" cy="36" r="30" fill="none" stroke={INK} strokeWidth="1.8" strokeDasharray="5 5" />}

      {/* smoke */}
      {!lit &&
        [0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d={["M120 52 C114 42 126 34 119 22 C113 12 124 4 120 -8", "M121 52 C128 44 116 36 124 26 C130 18 120 10 126 0", "M119 52 C112 46 120 38 113 30"][i]}
            fill="none"
            stroke={INK}
            strokeOpacity="0.5"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.8 }}
            animate={{ pathLength: 1, opacity: 0, y: -18 }}
            transition={{ duration: 1.8, delay: 0.15 + i * 0.18, ease: "easeOut" }}
          />
        ))}
    </svg>
  );
}

export function Birthday({ onNext }: { onNext: () => void }) {
  const { play } = useSound();
  const [lit, setLit] = useState(true);
  const [shot, setShot] = useState<ConfettiShot | null>(null);
  const candleRef = useRef<HTMLButtonElement>(null);

  const blow = () => {
    if (!lit) return;
    setLit(false);
    play("blow");
    const rect = candleRef.current?.getBoundingClientRect();
    setShot({
      key: Date.now(),
      x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
      y: rect ? rect.top + rect.height * 0.3 : window.innerHeight / 2,
    });
  };

  return (
    <div>
      <Portal>
        <Confetti shot={shot} />
      </Portal>

      {/* parcel label */}
      <motion.div
        initial={{ opacity: 0, y: -10, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: -1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="card overflow-hidden rounded-lg"
      >
        <div className="label flex justify-between bg-ink px-3.5 py-2 text-paper">
          <span>Late delivery</span>
          <span>Re: 01.10</span>
        </div>
        <div className="grid grid-cols-2 divide-x-[1.5px] divide-ink">
          <div className="px-3.5 py-2.5">
            <p className="label text-muted">To:</p>
            <p className="text-[18px] font-bold">Amarachi</p>
          </div>
          <div className="px-3.5 py-2.5">
            <p className="label text-muted">Status:</p>
            <p className="text-[18px] font-bold text-stamp">18 days late</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease }}>
        <StageHeading className="headline mt-7 text-[clamp(38px,11.5vw,52px)]">Oh, and one small problem…</StageHeading>
        <p className="mt-4 text-[17px] leading-snug text-muted">
          Your birthday was October 1. We hadn&apos;t met yet, so I missed my chance to wish you properly.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease }}
        className="relative mx-auto mt-6 aspect-[240/220] w-[min(70vw,280px)]"
      >
        <Cake lit={lit} />
        <button
          ref={candleRef}
          type="button"
          onClick={blow}
          aria-label={lit ? "Blow out the candle" : "Candle blown out"}
          aria-disabled={!lit}
          className="absolute top-0 left-[33%] h-[52%] w-[34%] rounded-full"
        />
        <AnimatePresence>
          {lit && (
            <motion.p
              aria-hidden="true"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 6 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6 }}
              className="hand pointer-events-none absolute top-[2%] -right-[6%] w-[34%] text-[20px] leading-[0.95]"
            >
              make a wish, then tap me
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-6 min-h-[8rem]" aria-live="polite">
        <AnimatePresence mode="wait">
          {lit ? (
            <motion.div key="blow" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
              <SecondaryButton onClick={blow}>Blow out the candle</SecondaryButton>
            </motion.div>
          ) : (
            <motion.div
              key="wish"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease }}
            >
              <p className="headline text-[clamp(30px,9vw,40px)]">Happy belated birthday, Amarachi.</p>
              <p className="mt-3 text-[17px] text-muted">I may be late, but at least I brought a little something.</p>
              <div className="mt-6">
                <ContinueButton onClick={onNext} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
