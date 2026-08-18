import { useState, useEffect } from "react";
import api from "../api/axios.js";

const DEFAULT_GENRES = [
  { id: "all", label: "All Calming", icon: "✨" },
  { id: "lofi", label: "Lofi Beats", icon: "🎧" },
  { id: "ambient", label: "Ambient", icon: "🌌" },
  { id: "piano", label: "Solo Piano", icon: "🎹" },
  { id: "nature", label: "Nature Sounds", icon: "🌿" },
  { id: "classical", label: "Classical", icon: "🎻" },
  { id: "acoustic", label: "Acoustic", icon: "🎸" },
  { id: "chill", label: "Chill & Downtempo", icon: "☕" },
  { id: "minimalist", label: "Minimalist", icon: "🕯️" },
  { id: "instrumental", label: "Instrumental", icon: "🌊" },
];

export default function GenreSelector({ value = "all", onChange }) {
  const [genres, setGenres] = useState(DEFAULT_GENRES);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await api.get("/music/genres");
        if (res.data?.genres) {
          setGenres(res.data.genres);
        }
      } catch (err) {
        // Soft fallback to DEFAULT_GENRES if offline/guest
      }
    }
    fetchGenres();
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-wider text-mist font-medium block">
        Choose Music Genre <span className="text-sage">(Optional)</span>
      </label>
      <div className="flex flex-wrap gap-2 py-1">
        {genres.map((g) => {
          const isSelected = value === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onChange(g.id)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? "bg-sage/20 border-sage text-paper font-medium shadow-sm"
                  : "bg-dusk/60 border-white/5 text-mist hover:text-paper hover:border-white/15"
              }`}
            >
              <span>{g.icon}</span>
              <span>{g.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
