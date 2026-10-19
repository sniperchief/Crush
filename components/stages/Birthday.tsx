"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ContinueButton } from "../ui/Buttons";
import { Eyebrow, StageHeading } from "../ui/StageHeading";
import { Confetti, type ConfettiShot } from "../Confetti";
import { useSound } from "../SoundProvider";
import { Portal } from "../ui/Portal";

const ease = [0.22, 1, 0.36, 1] as const;

// Pearls along the cake's front band.
const PEARLS = Array.from({ length: 13 }, (_, i) => {
  const t = (i / 12) * Math.PI;
  return {
    cx: Math.round((120 - 80 * Math.cos(t)) * 10) / 10,
    cy: Math.round((158 + 14 * Math.sin(t)) * 10) / 10,
  };
});

const SPRINKLES = [
  { x: 76, y: 106, r: 30, c: "#FF3D9A" },
  { x: 92, y: 116, r: -20, c: "#C8B8FF" },
  { x: 150, y: 104, r: 60, c: "#C8B8FF" },
  { x: 166, y: 113, r: -40, c: "#FF3D9A" },
  { x: 136, y: 118, r: 10, c: "#FF3D9A" },
  { x: 104, y: 100, r: 80, c: "#9C93B8" },
  { x: 178, y: 106, r: 20, c: "#9C93B8" },
  { x: 62, y: 112, r: -60, c: "#C8B8FF" },
];

function Cake({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 240 220" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="plate" x1="0" x2="1">
          <stop offset="0" stopColor="#5d5a68" />
          <stop offset="0.3" stopColor="#e9e6ef" />
          <stop offset="0.5" stopColor="#8b8797" />
          <stop offset="0.72" stopColor="#f6f0e8" />
          <stop offset="1" stopColor="#4a4754" />
        </linearGradient>
        <linearGradient id="sponge" x1="0" x2="1">
          <stop offset="0" stopColor="#4b1630" />
          <stop offset="0.35" stopColor="#c42a74" />
          <stop offset="0.55" stopColor="#ff5aa9" />
          <stop offset="1" stopColor="#3d1229" />
        </linearGradient>
        <linearGradient id="icing" x1="0" x2="1">
          <stop offset="0" stopColor="#d9cff5" />
          <stop offset="0.45" stopColor="#fbf7f2" />
          <stop offset="1" stopColor="#b7a8e6" />
        </linearGradient>
        <pattern id="stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="6" height="6" fill="#F6F0E8" />
          <rect width="2.6" height="6" fill="#FF3D9A" />
        </pattern>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#FFC58A" stopOpacity="0.55" />
          <stop offset="0.4" stopColor="#FF3D9A" stopOpacity="0.18" />
          <stop offset="1" stopColor="#FF3D9A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flameOuter" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FF3D9A" />
          <stop offset="0.45" stopColor="#FF8A5C" />
          <stop offset="1" stopColor="#FFD9A0" />
        </linearGradient>
      </defs>

      {/* candle glow */}
      <motion.circle
        cx="120"
        cy="44"
        r="90"
        fill="url(#glow)"
        animate={{ opacity: lit ? [0.85, 1, 0.8, 1] : 0 }}
        transition={lit ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.6 }}
      />

      {/* plate */}
      <ellipse cx="120" cy="190" rx="106" ry="17" fill="url(#plate)" />
      <ellipse cx="120" cy="187" rx="98" ry="13" fill="#15141b" />

      {/* sponge */}
      <path d="M40 110 L40 182 A80 14 0 0 0 200 182 L200 110 Z" fill="url(#sponge)" />
      <path d="M40 140 A80 14 0 0 0 200 140" fill="none" stroke="#F6F0E8" strokeOpacity="0.18" strokeWidth="2" />
      {PEARLS.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r="2.3" fill="#F6F0E8" opacity="0.85" />
      ))}

      {/* drips + top icing */}
      <path
        d="M40 110 C40 118 43 123 47 125 C49 137 56 138 57 128 C62 131 70 133 78 134 C80 150 89 150 90 135 C100 137 110 138 120 138 C130 138 136 137 144 136 C146 154 156 154 157 134 C167 133 175 131 182 128 C184 141 192 141 192 123 C197 120 200 116 200 110 Z"
        fill="url(#icing)"
      />
      <ellipse cx="120" cy="110" rx="80" ry="16" fill="url(#icing)" />
      <ellipse cx="112" cy="106" rx="46" ry="6" fill="#ffffff" opacity="0.35" />
      {SPRINKLES.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width="7" height="2.2" rx="1.1" fill={s.c} transform={`rotate(${s.r} ${s.x + 3.5} ${s.y + 1.1})`} />
      ))}

      {/* candle */}
      <rect x="114" y="62" width="12" height="50" rx="3" fill="url(#stripes)" />
      <rect x="114" y="62" width="4" height="50" rx="2" fill="#ffffff" opacity="0.25" />
      <ellipse cx="120" cy="112" rx="9" ry="2.6" fill="#000" opacity="0.15" />
      <path d="M120 62 L120 54" stroke="#2a2730" strokeWidth="1.8" strokeLinecap="round" />

      {/* flame */}
      <AnimatePresence>
        {lit && (
          <motion.g
            key="flame"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1, y: -6 }}
            transition={{ duration: 0.35, ease }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
          >
            <g className="flame">
              <path d="M120 18 C129 31 133 40 129 48 C126 55 114 55 111 48 C107 40 111 31 120 18Z" fill="url(#flameOuter)" />
              <path d="M120 32 C125 39 126 44 124 49 C122 52 118 52 116 49 C114 44 115 39 120 32Z" fill="#FFF4E0" />
            </g>
          </motion.g>
        )}
      </AnimatePresence>

      {/* smoke */}
      {!lit &&
        [0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d={["M120 54 C114 44 126 36 119 24 C113 14 124 6 120 -6", "M121 54 C128 46 116 38 124 28 C130 20 120 12 126 2", "M119 54 C112 48 120 40 113 32"][i]}
            fill="none"
            stroke="#C8B8FF"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.7 }}
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
    <div className="flex flex-col items-center text-center">
      <Portal>
        <Confetti shot={shot} />
      </Portal>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
        <Eyebrow className="mb-5">Late delivery · re: 01.10</Eyebrow>
        <StageHeading className="font-display text-[clamp(2.3rem,10vw,4.2rem)] leading-[1] text-ivory">
          Oh, and one small <span className="italic text-pink">problem…</span>
        </StageHeading>
        <p className="mx-auto mt-4 max-w-[22rem] font-sans text-[0.95rem] leading-relaxed text-ivory/60">
          Your birthday was October 1. We hadn&apos;t met yet, so I missed my chance to wish you properly.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.25, ease }}
        className="relative mt-6 aspect-[240/220] w-[min(72vw,290px)]"
      >
        <Cake lit={lit} />
        <button
          ref={candleRef}
          type="button"
          onClick={blow}
          aria-label={lit ? "Blow out the candle" : "Candle blown out"}
          aria-disabled={!lit}
          className="absolute top-0 left-[33%] h-[54%] w-[34%] rounded-3xl"
        >
          {lit && <span aria-hidden="true" className="candle-hint absolute top-[2%] left-[18%] h-[52%] w-[64%] rounded-full" />}
        </button>
      </motion.div>

      <div className="mt-5 flex min-h-[6.5rem] w-full max-w-[24rem] flex-col items-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {lit ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="font-sans text-[0.7rem] tracking-[0.3em] text-violet/75 uppercase"
            >
              Make a wish · then tap the flame
            </motion.p>
          ) : (
            <motion.p
              key="wish"
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.25, ease }}
              className="font-display text-[clamp(1.4rem,6.2vw,1.95rem)] leading-snug text-ivory"
            >
              <span className="text-pink italic">Happy belated birthday, Amarachi.</span> I may be late, but at least I
              brought a little something.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex min-h-14 items-center">
        {!lit && <ContinueButton onClick={onNext}>One more thing</ContinueButton>}
      </div>
    </div>
  );
}
