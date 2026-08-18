import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import MoodGrid from "../components/MoodGrid.jsx";
import IntensitySlider from "../components/IntensitySlider.jsx";
import TrackCard from "../components/TrackCard.jsx";
import CrisisStrip from "../components/CrisisStrip.jsx";

export default function CheckIn() {
  const [mood, setMood] = useState(null);
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { crisis, resources } | { streakCount, suggestion }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!mood) {
      setError("Pick how you're feeling first.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/moods", { mood, intensity, note });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save that check-in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setMood(null);
    setIntensity(3);
    setNote("");
    setResult(null);
  }

  if (result?.crisis) {
    return (
      <div className="max-w-lg mx-auto py-8">
        <CrisisStrip expanded resources={result.resources} />
        <button onClick={reset} className="mt-6 text-sm text-mist hover:text-paper transition-colors">
          ← Log a different check-in
        </button>
      </div>
    );
  }

  if (result?.suggestion) {
    const { reflection, groundingTip, tracks, noteInsight, dayContextInsight } = result.suggestion;
    return (
      <div className="max-w-lg mx-auto py-8">
        <p className="eyebrow mb-2">logged</p>
        <h1 className="font-display text-2xl text-paper mb-6">Thanks for checking in.</h1>

        <div className="glass-card rounded-2xl p-5 mb-6">
          <p className="text-paper">{reflection}</p>
          <p className="text-sm text-sage mt-3">{groundingTip}</p>
          {dayContextInsight && (
            <p className="text-xs text-mist mt-3 pt-3 border-t border-white/5">{dayContextInsight}</p>
          )}
          {noteInsight && <p className="text-xs text-lamp mt-3 pt-3 border-t border-white/5">{noteInsight}</p>}
        </div>

        <p className="eyebrow mb-3">music for right now</p>
        <div className="space-y-3 mb-8">
          {tracks.map((t) => (
            <TrackCard key={t.id} track={t} />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/calm-space"
            className="text-sm px-5 py-2.5 rounded-full font-medium"
            style={{ background: "var(--color-sage)", color: "var(--color-ink)" }}
          >
            Open breathing exercise
          </Link>
          <button onClick={reset} className="text-sm text-mist hover:text-paper transition-colors">
            Log another check-in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <p className="eyebrow mb-2">how are you, really</p>
      <h1 className="font-display text-3xl text-paper mb-8">Check in</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <MoodGrid value={mood} onChange={setMood} />

        {mood && <IntensitySlider value={intensity} onChange={setIntensity} />}

        <div>
          <label htmlFor="note" className="text-sm text-mist block mb-1.5">
            What happened today? <span className="text-mist-dim">(optional)</span>
          </label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. big DBMS exam tomorrow, argued with a friend, finally finished my project"
            className="w-full rounded-xl px-4 py-3 bg-dusk border border-transparent focus:border-sage outline-none text-paper resize-none"
          />
        </div>

        {error && <p className="text-sm" style={{ color: "#e08a8a" }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-full font-medium disabled:opacity-60"
          style={{ background: "var(--color-sage)", color: "var(--color-ink)" }}
        >
          {submitting ? "Saving..." : "Save check-in"}
        </button>
      </form>
    </div>
  );
}
