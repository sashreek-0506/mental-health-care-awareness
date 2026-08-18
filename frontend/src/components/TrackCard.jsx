import { useState, useRef } from "react";
import { Music2, Play, Pause, ExternalLink } from "lucide-react";

export default function TrackCard({ track }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef(null);

  const spotifyQuery = encodeURIComponent(`${track.title} ${track.artist}`);

  function togglePlay(e) {
    e.stopPropagation();
    if (!audioRef.current || !track.audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Audio playback issue:", err);
          setHasError(true);
        });
    }
  }

  return (
    <div className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-sage/40 transition-colors">
      {track.audioUrl && (
        <audio
          ref={audioRef}
          src={track.audioUrl}
          onEnded={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
          preload="metadata"
        />
      )}

      <div className="flex items-start gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={togglePlay}
          title={isPlaying ? "Pause track" : "Listen in app"}
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
            isPlaying
              ? "bg-sage text-ink shadow-md scale-105"
              : "bg-sage/15 text-sage hover:bg-sage/30 hover:scale-105"
          }`}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-paper font-medium truncate">{track.title}</p>
            {track.tag && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-sage shrink-0 border border-sage/20">
                {track.tag}
              </span>
            )}
          </div>
          <p className="text-xs text-mist truncate">{track.artist}</p>
          {track.why && <p className="text-xs text-mist-dim mt-1 line-clamp-2">{track.why}</p>}
        </div>
      </div>

      <a
        href={`https://open.spotify.com/search/${spotifyQuery}`}
        target="_blank"
        rel="noreferrer"
        title="Open on Spotify"
        className="p-2 rounded-lg text-mist hover:text-paper hover:bg-white/5 transition-colors shrink-0 flex items-center gap-1 text-xs"
      >
        <ExternalLink size={15} />
      </a>
    </div>
  );
}
