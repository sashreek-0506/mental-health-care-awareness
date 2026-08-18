export default function IntensitySlider({ value, onChange }) {
  const labels = ["Barely there", "Mild", "Noticeable", "Strong", "Intense"];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow">how strongly</span>
        <span className="text-sm text-mist font-mono">{labels[value - 1]}</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-sage)]"
      />
    </div>
  );
}
