import { Phone } from "lucide-react";

/**
 * A quiet, always-available strip pointing to real crisis resources.
 * Shown in the footer on every page, and expanded prominently whenever
 * the app detects language suggesting acute distress.
 */
export default function CrisisStrip({ expanded = false, resources = [] }) {
  if (expanded) {
    return (
      <div className="glass-card rounded-2xl p-6 border-lamp/40" style={{ borderColor: "color-mix(in srgb, var(--color-lamp) 40%, transparent)" }}>
        <p className="font-display text-lg text-paper mb-1">Before anything else — you don't have to handle this alone</p>
        <p className="text-sm text-mist mb-4">
          MindSpace isn't equipped for moments like this, but real people are. It's free and confidential to call.
        </p>
        <ul className="space-y-3">
          {resources.map((r) => (
            <li key={r.name} className="flex items-start gap-3">
              <Phone size={18} className="text-lamp mt-0.5 shrink-0" />
              <div>
                <p className="text-paper font-medium">
                  {r.name} — <span className="font-mono">{r.number}</span>
                  {r.altNumber && <span className="text-mist"> / {r.altNumber}</span>}
                </p>
                <p className="text-sm text-mist">{r.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-mist-dim">
      <span className="eyebrow">in a crisis?</span>
      <span>
        Tele-MANAS <span className="font-mono text-mist">14416</span>
      </span>
      <span>
        KIRAN <span className="font-mono text-mist">1800-599-0019</span>
      </span>
      <span>
        Emergency <span className="font-mono text-mist">112</span>
      </span>
    </div>
  );
}
