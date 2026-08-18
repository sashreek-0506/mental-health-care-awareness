import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MOOD_SCORE, MOOD_LABEL } from "../constants/moods.js";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div className="glass-card rounded-xl px-3 py-2 text-sm">
      <p className="text-mist-dim text-xs">{formatDate(point.createdAt)}</p>
      <p className="text-paper">{MOOD_LABEL[point.mood]}</p>
    </div>
  );
}

export default function MoodChart({ entries = [] }) {
  const data = entries.map((e) => ({
    ...e,
    score: MOOD_SCORE[e.mood] ?? 3,
  }));

  if (!data.length) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-mist">No check-ins yet. Your first one will show up here.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-sage)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--color-sage)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in srgb, var(--color-mist) 12%, transparent)" vertical={false} />
          <XAxis
            dataKey="createdAt"
            tickFormatter={formatDate}
            stroke="var(--color-mist-dim)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis domain={[1, 5]} hide />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="score" stroke="var(--color-sage)" strokeWidth={2} fill="url(#moodFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
