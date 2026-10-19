"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { SoundProvider } from "./SoundProvider";
import { TouchSparkles } from "./TouchSparkles";
import { Header } from "./Chrome";
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
  const backCover = stage === last;

  return (
    <MotionConfig reducedMotion="user">
      <SoundProvider>
        <div className={`min-h-dvh transition-colors duration-500 ${backCover ? "bg-blue" : "bg-paper"}`}>
          <TouchSparkles />
          <Header current={stage} total={STAGE_NAMES.length} label={STAGE_NAMES[stage]} inverted={backCover} />

          <main className="relative mx-auto w-full max-w-[34rem] overflow-x-clip px-4 pt-5 pb-10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.section
                key={stage}
                aria-label={STAGE_NAMES[stage]}
                className="w-full origin-bottom-left"
                initial={{ opacity: 0, x: 70, rotate: 2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: -70, rotate: -1.5, transition: { duration: 0.28, ease: "easeIn" } }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {stage === 0 && <Opening onNext={next} />}
                {stage === 1 && <FaceScanner onNext={next} />}
                {stage === 2 && <RunawayButton onNext={next} />}
                {stage === 3 && <Birthday onNext={next} />}
                {stage === last && <Finale onRestart={() => goTo(0)} />}
              </motion.section>
            </AnimatePresence>
          </main>
        </div>
      </SoundProvider>
    </MotionConfig>
  );
}
