import { useEffect, useRef, useState } from "react";

const PHASES = [
  { key: "in", label: "Breathe in", scale: 1.15 },
  { key: "hold1", label: "Hold", scale: 1.15 },
  { key: "out", label: "Breathe out", scale: 0.85 },
  { key: "hold2", label: "Hold", scale: 0.85 },
];

const PHASE_SECONDS = 4;

/**
 * Drives a 4-4-4-4 box breathing cycle: in, hold, out, hold, each 4 seconds.
 * Returns the current phase, a per-second countdown, and the scale the
 * orb should animate toward (consumed by BreathingOrb).
 */
export function useBoxBreathing(active = true) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASE_SECONDS);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!active) {
      clearInterval(tickRef.current);
      return;
    }

    tickRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setPhaseIndex((p) => (p + 1) % PHASES.length);
          return PHASE_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [active]);

  const phase = PHASES[phaseIndex];

  return {
    phaseKey: phase.key,
    phaseLabel: phase.label,
    scaleTarget: phase.scale,
    secondsLeft,
    isHold: phase.key.startsWith("hold"),
  };
}
