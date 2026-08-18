import CrisisStrip from "./CrisisStrip.jsx";

export default function Footer() {
  return (
    <footer
      className="mt-24 border-t"
      style={{ borderColor: "color-mix(in srgb, var(--color-mist) 10%, transparent)" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-4">
        <CrisisStrip />
        <p className="text-xs text-mist-dim">
          MindSpace is a self-reflection and study-stress tool built by a student, not a medical
          device or a substitute for professional care.
        </p>
      </div>
    </footer>
  );
}
