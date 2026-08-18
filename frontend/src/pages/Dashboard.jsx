import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Wind, Music2 } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import MoodChart from "../components/MoodChart.jsx";
import { MOOD_EMOJI, MOOD_LABEL } from "../constants/moods.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get("/moods/stats"),
          api.get("/moods?limit=6"),
        ]);
        if (cancelled) return;
        setStats(statsRes.data);
        setRecent(historyRes.data.entries);
      } catch {
        if (!cancelled) setError("Couldn't load your dashboard right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <p className="eyebrow mb-2">welcome back</p>
      <h1 className="font-display text-3xl text-paper mb-8">{user?.name?.split(" ")[0] || "there"}</h1>

      {loading && <p className="text-mist">Loading your dashboard...</p>}
      {error && <p className="text-sm" style={{ color: "#e08a8a" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-card rounded-2xl p-5 flex items-center gap-3">
              <Flame size={22} className="text-lamp" />
              <div>
                <p className="text-2xl text-paper font-display">{stats?.streakCount ?? 0}</p>
                <p className="text-xs text-mist">day check-in streak</p>
              </div>
            </div>
            <Link to="/check-in" className="glass-card rounded-2xl p-5 flex items-center gap-3 hover:border-sage/60 transition-colors">
              <Wind size={22} className="text-sage" />
              <div>
                <p className="text-paper font-medium text-sm">Check in</p>
                <p className="text-xs text-mist">Log how you're feeling</p>
              </div>
            </Link>
            <Link to="/calm-space" className="glass-card rounded-2xl p-5 flex items-center gap-3 hover:border-sage/60 transition-colors">
              <Music2 size={22} className="text-sage" />
              <div>
                <p className="text-paper font-medium text-sm">Calm space</p>
                <p className="text-xs text-mist">Breathe, or get music now</p>
              </div>
            </Link>
          </div>

          <p className="eyebrow mb-3">last 30 days</p>
          <MoodChart entries={stats?.entries || []} />

          <p className="eyebrow mt-10 mb-3">recent check-ins</p>
          {recent.length === 0 ? (
            <p className="text-mist text-sm">Nothing logged yet — your first check-in starts the history above.</p>
          ) : (
            <ul className="space-y-3">
              {recent.map((entry) => (
                <li key={entry._id} className="glass-card rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {MOOD_EMOJI[entry.mood]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-paper text-sm font-medium">
                      {MOOD_LABEL[entry.mood]}{" "}
                      <span className="text-mist-dim font-mono text-xs">
                        {new Date(entry.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </p>
                    {entry.note && <p className="text-sm text-mist truncate">{entry.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
