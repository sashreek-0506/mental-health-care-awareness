import { Music2 } from "lucide-react";

export default function TrackCard({ track }) {
  const query = encodeURIComponent(`${track.title} ${track.artist}`);
  return (
    <a
      href={`https://open.spotify.com/search/${query}`}
      target="_blank"
      rel="noreferrer"
      className="glass-card rounded-2xl p-4 flex items-start gap-3 hover:border-sage/60 transition-colors group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "color-mix(in srgb, var(--color-sage) 18%, transparent)" }}
      >
        <Music2 size={18} className="text-sage" />
      </div>
      <div className="min-w-0">
        <p className="text-paper font-medium truncate">{track.title}</p>
        <p className="text-sm text-mist truncate">{track.artist}</p>
        {track.why && <p className="text-xs text-mist-dim mt-1">{track.why}</p>}
      </div>
    </a>
  );
}
