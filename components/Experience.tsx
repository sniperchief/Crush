"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { SoundProvider } from "./SoundProvider";
import { Starfield } from "./Starfield";
import { TouchSparkles } from "./TouchSparkles";
import { Progress, SoundToggle } from "./Chrome";
import { Opening } from "./stages/Opening";
import { FaceScanner } from "./stages/FaceScanner";
import { RunawayButton } from "./stages/RunawayButton";
import { Birthday } from "./stages/Birthday";
import { Finale } from "./stages/Finale";

const STAGE_NAMES = ["Opening", "The scan", "One simple question", "Late delivery", "One last thing"];

// Ignore stage changes that arrive too soon after the last one (double taps).
const ADVANCE_COOLDOWN_MS = 700;

export function Experience() {
  const [stage, setStage] = useState(0);
  const lastChange = useRef(0);

  const goTo = useCallback((target: number) => {
    const now = performance.now();
    if (now - lastChange.current < ADVANCE_COOLDOWN_MS) return;
    lastChange.current = now;
    setStage(Math.max(0, Math.min(target, STAGE_NAMES.length - 1)));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage]);

  const next = () => goTo(stage + 1);
  const last = STAGE_NAMES.length - 1;

  return (
    <MotionConfig reducedMotion="user">
      <SoundProvider>
        <Starfield stage={stage} dim={stage === STAGE_NAMES.length - 1} />
        <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[1]" />
        <TouchSparkles />

        <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 sm:px-8 sm:pt-6">
          <motion.div animate={{ opacity: stage === last ? 0.45 : 1 }} transition={{ duration: 1.2 }}>
            <Progress current={stage} total={STAGE_NAMES.length} label={STAGE_NAMES[stage]} />
          </motion.div>
          <SoundToggle />
        </header>

        <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-4 pt-20 pb-12 sm:px-8 sm:pt-24">
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={stage}
              aria-label={STAGE_NAMES[stage]}
              className="w-full"
              initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, filter: "blur(8px)", transition: { duration: 0.3, ease: "easeIn" } }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {stage === 0 && <Opening onNext={next} />}
              {stage === 1 && <FaceScanner onNext={next} />}
              {stage === 2 && <RunawayButton onNext={next} />}
              {stage === 3 && <Birthday onNext={next} />}
              {stage === last && <Finale onRestart={() => goTo(0)} />}
            </motion.section>
          </AnimatePresence>
        </main>
      </SoundProvider>
    </MotionConfig>
  );
}
