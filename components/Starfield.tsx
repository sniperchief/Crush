import { SPARKLE_PATH } from "./ui/Sparkle";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

// Deterministic so server and client render the same sky.
const STARS = (() => {
  const r = mulberry32(1001);
  return Array.from({ length: 64 }, (_, i) => {
    const big = r() > 0.9;
    const tintRoll = r();
    return {
      id: i,
      x: round(r() * 100),
      y: round(r() * 100),
      size: round(big ? 7 + r() * 5 : 1 + r() * 1.8),
      delay: round(r() * 6),
      duration: round(3 + r() * 5),
      opacity: round(0.25 + r() * 0.6),
      big,
      color: tintRoll < 0.12 ? "var(--color-pink)" : tintRoll < 0.3 ? "var(--color-violet)" : "var(--color-ivory)",
    };
  });
})();

// Aurora placement per stage: [pink x, pink y, violet x, violet y, intensity]
const AURA: Record<number, [number, number, number, number, number]> = {
  0: [20, 18, 82, 78, 1],
  1: [78, 22, 18, 70, 1],
  2: [30, 80, 76, 24, 0.9],
  3: [50, 30, 20, 85, 1],
  4: [50, 55, 50, 45, 0.28],
};

export function Starfield({ stage, dim }: { stage: number; dim: boolean }) {
  const [px, py, vx, vy, intensity] = AURA[stage] ?? AURA[0];

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink">
      <div
        className="aura absolute h-[120vmax] w-[120vmax] rounded-full"
        style={{
          left: `${px}%`,
          top: `${py}%`,
          opacity: 0.55 * intensity,
          background: "radial-gradient(circle, rgba(255,61,154,0.32) 0%, rgba(255,61,154,0.08) 35%, transparent 62%)",
        }}
      />
      <div
        className="aura absolute h-[110vmax] w-[110vmax] rounded-full"
        style={{
          left: `${vx}%`,
          top: `${vy}%`,
          opacity: 0.6 * intensity,
          background: "radial-gradient(circle, rgba(200,184,255,0.26) 0%, rgba(200,184,255,0.06) 38%, transparent 62%)",
        }}
      />
      <div className="absolute inset-0 transition-opacity duration-[1600ms]" style={{ opacity: dim ? 0.35 : 1 }}>
        {STARS.map((s) =>
          s.big ? (
            <svg
              key={s.id}
              viewBox="0 0 24 24"
              className="twinkle absolute"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                color: s.color,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
                ["--o" as string]: s.opacity,
                filter: `drop-shadow(0 0 4px ${s.color})`,
              }}
            >
              <path d={SPARKLE_PATH} fill="currentColor" />
            </svg>
          ) : (
            <span
              key={s.id}
              className="twinkle absolute rounded-full"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                background: s.color,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
                ["--o" as string]: s.opacity,
              }}
            />
          ),
        )}
      </div>
      <div
        className="absolute inset-0 transition-opacity duration-[1600ms]"
        style={{
          opacity: dim ? 1 : 0,
          background: "radial-gradient(ellipse at 50% 40%, rgba(9,9,13,0.4) 0%, rgba(4,4,6,0.92) 70%)",
        }}
      />
    </div>
  );
}
