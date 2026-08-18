import { useState } from "react";
import BreathingOrb from "../components/BreathingOrb.jsx";
import MoodGrid from "../components/MoodGrid.jsx";
import GenreSelector from "../components/GenreSelector.jsx";
import TrackCard from "../components/TrackCard.jsx";
import CrisisStrip from "../components/CrisisStrip.jsx";
import api from "../api/axios.js";

export default function CalmSpace() {
  const [breathingActive, setBreathingActive] = useState(true);

  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  const [genre, setGenre] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSuggest(e) {
    e.preventDefault();
    if (!mood) {
      setError("Pick a mood first.");
      return;
    }
    setError("");
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post("/music/suggest", { mood, note, genre });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't get a suggestion right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-16">
      <section>
        <p className="eyebrow mb-2">breathe</p>
        <h1 className="font-display text-3xl text-paper mb-6">Box breathing</h1>
        <p className="text-mist mb-8 max-w-md">
          In for 4, hold for 4, out for 4, hold for 4. Follow the orb — it's on the same timer as
          the numbers.
        </p>
        <div className="flex flex-col items-center gap-6 py-4">
          <BreathingOrb size={240} active={breathingActive} />
          <button
            onClick={() => setBreathingActive((a) => !a)}
            className="text-sm px-5 py-2 rounded-full border transition-colors hover:text-paper"
            style={{ borderColor: "color-mix(in srgb, var(--color-mist) 25%, transparent)" }}
          >
            {breathingActive ? "Pause" : "Resume"}
          </button>
        </div>
      </section>

      <section>
        <p className="eyebrow mb-2">listen</p>
        <h2 className="font-display text-2xl text-paper mb-6">Get music for right now</h2>

        {result?.crisis ? (
          <CrisisStrip expanded resources={result.resources} />
        ) : result?.suggestion ? (
          <div className="max-w-lg">
            <div className="glass-card rounded-2xl p-5 mb-6">
              <p className="text-paper">{result.suggestion.reflection}</p>
              <p className="text-sm text-sage mt-3">{result.suggestion.groundingTip}</p>
              {result.suggestion.dayContextInsight && (
                <p className="text-xs text-mist mt-3 pt-3 border-t border-white/5">
                  {result.suggestion.dayContextInsight}
                </p>
              )}
              {result.suggestion.noteInsight && (
                <p className="text-xs text-lamp mt-3 pt-3 border-t border-white/5">{result.suggestion.noteInsight}</p>
              )}
            </div>
            <div className="space-y-3">
              {result.suggestion.tracks.map((t) => (
                <TrackCard key={t.id} track={t} />
              ))}
            </div>
            <button
              onClick={() => {
                setResult(null);
                setMood(null);
                setNote("");
                setGenre("all");
              }}
              className="mt-6 text-sm text-mist hover:text-paper transition-colors"
            >
              Try a different mood or genre
            </button>
          </div>
        ) : (
          <form onSubmit={handleSuggest} className="max-w-lg space-y-6">
            <MoodGrid value={mood} onChange={setMood} />
            <GenreSelector value={genre} onChange={setGenre} />
            <div>
              <label htmlFor="calm-note" className="text-xs uppercase tracking-wider text-mist font-medium block mb-1.5">
                What's on your mind? <span className="text-mist-dim">(optional note for AI text analysis)</span>
              </label>
              <textarea
                id="calm-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. big exam coming up, fought with a classmate, feeling exhausted..."
                className="w-full rounded-xl px-4 py-3 bg-dusk border border-transparent focus:border-sage outline-none text-paper resize-none text-sm"
              />
            </div>
            {error && <p className="text-sm" style={{ color: "#e08a8a" }}>{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="py-3 px-6 rounded-full font-medium disabled:opacity-60"
              style={{ background: "var(--color-sage)", color: "var(--color-ink)" }}
            >
              {submitting ? "Analyzing & finding tracks..." : "Suggest music"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
