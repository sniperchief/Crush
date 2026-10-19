"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

// Background loop: a music-box arpeggio over Fmaj7 – Em7 – Dm7 – Cmaj7.
const BPM = 78;
const EIGHTH = 60 / BPM / 2;
const CHORDS = [
  { bass: 174.61, notes: [440, 523.25, 659.25, 698.46] },
  { bass: 164.81, notes: [392, 493.88, 587.33, 659.25] },
  { bass: 146.83, notes: [349.23, 440, 523.25, 587.33] },
  { bass: 130.81, notes: [329.63, 392, 493.88, 523.25] },
];
const ARP = [0, 2, 1, 3, 2, 1, 3, 2];
const MUSIC_VOLUME = 0.55;

type Music = { bus: GainNode; timer: number; next: number; step: number };

/**
 * Synthesized sound (Web Audio, no files): a soft background loop plus small
 * effects. On by default; browsers only allow audio after the first tap, so
 * the music starts on her first interaction.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const enabledRef = useRef(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<Music | null>(null);

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

  const startMusic = useCallback(() => {
    if (musicRef.current) return;
    const ac = getCtx();
    if (!ac) return;

    const bus = ac.createGain();
    bus.gain.setValueAtTime(0.0001, ac.currentTime);
    bus.gain.exponentialRampToValueAtTime(MUSIC_VOLUME, ac.currentTime + 2.5);
    bus.connect(ac.destination);

    const voice = (freq: number, t: number, dur: number, peak: number, type: OscillatorType = "sine", attack = 0.006) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + dur + 0.05);
    };

    const scheduleStep = (step: number, t: number) => {
      const chord = CHORDS[Math.floor(step / 8) % CHORDS.length];
      const beat = step % 8;
      const note = chord.notes[ARP[beat]];
      // music-box bell: fundamental plus a quiet octave shimmer
      voice(note, t, 1.5, 0.05);
      voice(note * 2, t, 0.6, 0.012);
      if (beat === 0 || beat === 4) voice(chord.bass, t, EIGHTH * 4.2, 0.05, "sine", 0.03);
      if (beat === 0) {
        // soft pad under each bar
        chord.notes.slice(0, 2).forEach((f) => voice(f / 2, t, EIGHTH * 8.5, 0.014, "triangle", 0.8));
      }
    };

    const music: Music = { bus, timer: 0, next: ac.currentTime + 0.15, step: 0 };
    music.timer = window.setInterval(() => {
      while (music.next < ac.currentTime + 0.4) {
        scheduleStep(music.step, music.next);
        music.next += EIGHTH;
        music.step++;
      }
    }, 100);
    musicRef.current = music;
  }, [getCtx]);

  const stopMusic = useCallback(() => {
    const music = musicRef.current;
    const ac = ctxRef.current;
    if (!music || !ac) return;
    musicRef.current = null;
    window.clearInterval(music.timer);
    music.bus.gain.cancelScheduledValues(ac.currentTime);
    music.bus.gain.setValueAtTime(music.bus.gain.value, ac.currentTime);
    music.bus.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.5);
    window.setTimeout(() => music.bus.disconnect(), 700);
  }, []);

  // Start on the first tap/keypress (browsers block audio before that),
  // and pause while the tab is hidden.
  useEffect(() => {
    const onFirstGesture = () => {
      if (enabledRef.current) startMusic();
    };
    const onVisibility = () => {
      const ac = ctxRef.current;
      if (!ac) return;
      if (document.hidden) void ac.suspend();
      else if (enabledRef.current) void ac.resume();
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      document.removeEventListener("visibilitychange", onVisibility);
      stopMusic();
    };
  }, [startMusic, stopMusic]);

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
    if (next) {
      startMusic();
      playNow("sparkle");
    } else {
      stopMusic();
    }
  }, [playNow, startMusic, stopMusic]);

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used inside <SoundProvider>");
  return ctx;
}
