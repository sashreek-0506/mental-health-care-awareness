import { MOODS } from "../constants/moods.js";

export default function MoodGrid({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {MOODS.map((m) => {
        const active = value === m.value;
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className="flex flex-col items-center gap-2 rounded-2xl py-4 px-2 border transition-all"
            style={{
              borderColor: active
                ? "var(--color-sage)"
                : "color-mix(in srgb, var(--color-mist) 14%, transparent)",
              backgroundColor: active
                ? "color-mix(in srgb, var(--color-sage) 14%, transparent)"
                : "color-mix(in srgb, var(--color-dusk) 60%, transparent)",
            }}
          >
            <span className="text-2xl" aria-hidden="true">
              {m.emoji}
            </span>
            <span className={`text-xs ${active ? "text-paper" : "text-mist"}`}>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
