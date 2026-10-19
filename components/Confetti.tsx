"use client";

import { useEffect, useRef } from "react";

export type ConfettiShot = { key: number; x: number; y: number };

const COLORS = ["#FF3D9A", "#C8B8FF", "#F6F0E8", "#FFB3D6", "#D9D6E0"];

/** Lightweight canvas confetti. Fires once each time `shot.key` changes. */
export function Confetti({ shot }: { shot: ConfettiShot | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!shot || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = w < 640 ? 90 : 140;
    const pieces = Array.from({ length: count }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15;
      const speed = 6 + Math.random() * 9;
      return {
        x: shot.x,
        y: shot.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        size: 5 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: Math.random() < 0.25 ? "star" : Math.random() < 0.5 ? "dot" : "strip",
        wobble: Math.random() * Math.PI * 2,
      };
    });

    const start = performance.now();
    const DURATION = 2600;
    let raf = 0;

    const drawStar = (s: number) => {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.12, -s * 0.12, s, 0);
      ctx.quadraticCurveTo(s * 0.12, s * 0.12, 0, s);
      ctx.quadraticCurveTo(-s * 0.12, s * 0.12, -s, 0);
      ctx.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s);
      ctx.fill();
    };

    const frame = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, w, h);
      const fade = t > DURATION - 700 ? Math.max(0, (DURATION - t) / 700) : 1;
      for (const p of pieces) {
        p.vy += 0.24;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.wobble += 0.12;
        p.x += p.vx + Math.sin(p.wobble) * 0.6;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "star") drawStar(p.size * 0.8);
        else if (p.shape === "dot") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } else ctx.fillRect(-p.size / 2, -p.size / 5, p.size, (p.size / 2.5) * Math.abs(Math.cos(p.wobble)) + 1);
        ctx.restore();
      }
      if (t < DURATION) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, w, h);
    };
  }, [shot]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 h-full w-full" />;
}
