import { motion, useReducedMotion } from "framer-motion";
import { useBoxBreathing } from "../hooks/useBoxBreathing.js";

/**
 * The app's signature element: a slow-pulsing orb driven by a real 4-4-4-4
 * box breathing timer. It appears both as ambient atmosphere on the landing
 * hero and as the literal, functional guide on the Calm Space page.
 */
export default function BreathingOrb({ size = 220, active = true, showLabel = true }) {
  const { phaseLabel, scaleTarget, secondsLeft } = useBoxBreathing(active);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-6">
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--color-sage) 55%, transparent), transparent 70%)",
          }}
          animate={prefersReducedMotion ? {} : { scale: scaleTarget }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full border"
          style={{
            width: "70%",
            height: "70%",
            borderColor: "color-mix(in srgb, var(--color-sage) 40%, transparent)",
          }}
          animate={prefersReducedMotion ? {} : { scale: scaleTarget }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "22%",
            height: "22%",
            background: "var(--color-lamp)",
            boxShadow: "0 0 24px color-mix(in srgb, var(--color-lamp) 60%, transparent)",
          }}
        />
      </div>

      {showLabel && (
        <div className="text-center">
          <p className="font-display text-xl text-paper">{phaseLabel}</p>
          <p className="eyebrow mt-1">{secondsLeft}s</p>
        </div>
      )}
    </div>
  );
}
