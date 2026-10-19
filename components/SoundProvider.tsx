"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type SoundKind = "tap" | "sparkle" | "chime" | "burst" | "blow" | "pop";

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  play: (kind: SoundKind) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

/**
 * Tiny synthesized sound palette (Web Audio, no files). Muted by default;
 * nothing is created until the visitor turns sound on.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC = window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const playNow = useCallback(
    (kind: SoundKind) => {
      const ac = getCtx();
      if (!ac) return;
      const t = ac.currentTime + 0.01;

      const tone = (
        freq: number,
        start: number,
        dur: number,
        type: OscillatorType = "sine",
        gain = 0.06,
      ) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        o.connect(g).connect(ac.destination);
        o.start(start);
        o.stop(start + dur + 0.05);
      };

      const noise = (start: number, dur: number, freq: number, gain = 0.08) => {
        const len = Math.floor(ac.sampleRate * dur);
        const buffer = ac.createBuffer(1, len, ac.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        const src = ac.createBufferSource();
        src.buffer = buffer;
        const filter = ac.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(freq, start);
        filter.frequency.exponentialRampToValueAtTime(freq / 3, start + dur);
        const g = ac.createGain();
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(gain, start + dur * 0.25);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        src.connect(filter).connect(g).connect(ac.destination);
        src.start(start);
        src.stop(start + dur);
      };

      switch (kind) {
        case "tap":
          tone(880, t, 0.14, "sine", 0.045);
          break;
        case "sparkle":
          tone(1318.5, t, 0.22, "sine", 0.04);
          tone(1760, t + 0.06, 0.3, "sine", 0.03);
          break;
        case "pop":
          tone(520, t, 0.12, "triangle", 0.06);
          tone(780, t + 0.05, 0.16, "sine", 0.04);
          break;
        case "chime":
          [659.25, 830.61, 987.77, 1318.51].forEach((f, i) =>
            tone(f, t + i * 0.09, 0.9, "sine", 0.045),
          );
          break;
        case "burst":
          noise(t, 0.35, 2400, 0.04);
          [987.77, 1318.51, 1975.53].forEach((f, i) =>
            tone(f, t + 0.05 + i * 0.05, 0.6, "sine", 0.035),
          );
          break;
        case "blow":
          noise(t, 0.55, 900, 0.12);
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
            tone(f, t + 0.45 + i * 0.1, 1.1, "sine", 0.04),
          );
          break;
      }
    },
    [getCtx],
  );

  const play = useCallback(
    (kind: SoundKind) => {
      if (enabledRef.current) playNow(kind);
    },
    [playNow],
  );

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    if (next) playNow("sparkle");
  }, [playNow]);

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used inside <SoundProvider>");
  return ctx;
}
