import { useState, useEffect } from "react";
import { Lock, Sparkles, Heart, Trash2, ShieldCheck, Bookmark, Feather, MessageSquareHeart } from "lucide-react";
import api from "../api/axios.js";
import CrisisStrip from "../components/CrisisStrip.jsx";

export default function PrivateSpace() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [currentResult, setCurrentResult] = useState(null); // { crisis, resources } | { entry }
  const [entries, setEntries] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filterFavorite, setFilterFavorite] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setLoadingHistory(true);
    try {
      const res = await api.get("/private-space");
      setEntries(res.data?.entries || []);
    } catch (err) {
      console.warn("Could not fetch private space entries:", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  function handleAddTag(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, "");
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput("");
    }
  }

  function removeTag(tagToRemove) {
    setTags(tags.filter((t) => t !== tagToRemove));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write a private thought or reflection first.");
      return;
    }
    setError("");
    setSubmitting(true);
    setCurrentResult(null);

    try {
      const res = await api.post("/private-space", {
        title: title.trim() || "Untitled Reflection",
        content: content.trim(),
        tags,
      });

      setCurrentResult(res.data);
      if (!res.data.crisis && res.data.entry) {
        setEntries((prev) => [res.data.entry, ...prev]);
        setTitle("");
        setContent("");
        setTags([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save private reflection.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleFavorite(id) {
    try {
      const res = await api.patch(`/private-space/${id}/favorite`);
      const updated = res.data.entry;
      setEntries((prev) => prev.map((e) => (e._id === id ? updated : e)));
      if (currentResult?.entry?._id === id) {
        setCurrentResult((prev) => ({ ...prev, entry: updated }));
      }
    } catch (err) {
      console.warn("Could not toggle favorite:", err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this private entry permanently?")) return;
    try {
      await api.delete(`/private-space/${id}`);
      setEntries((prev) => prev.filter((e) => e._id !== id));
      if (currentResult?.entry?._id === id) {
        setCurrentResult(null);
      }
    } catch (err) {
      console.warn("Could not delete entry:", err);
    }
  }

  const displayedEntries = filterFavorite
    ? entries.filter((e) => e.isFavorite)
    : entries;

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-4">
      {/* Header Banner */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-sage/20 shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-sage/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sage text-xs uppercase tracking-widest font-semibold">
              <Lock size={14} />
              <span>Confidential & Private Sanctuary</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-paper">
              Private Space <span className="text-sage font-normal">Encouragement</span>
            </h1>
            <p className="text-mist text-sm max-w-xl">
              Write your unfiltered thoughts, worries, or wins in complete confidence. Our local Machine Learning model provides compassionate cognitive reframing, strength spotlighting, and personalized encouragement.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-mist">
            <ShieldCheck size={16} className="text-sage" />
            <span>100% Encrypted & Private</span>
          </div>
        </div>
      </section>

      {/* Editor Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5 border border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-paper flex items-center gap-2">
                <Feather size={18} className="text-sage" />
                <span>Write Private Entry</span>
              </h2>
              <span className="text-xs text-mist">Only visible to you</span>
            </div>

            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title or focus (e.g. Late night thoughts, Feeling overwhelmed by lab exam)"
                className="w-full rounded-xl px-4 py-2.5 bg-dusk/80 border border-white/5 focus:border-sage outline-none text-paper placeholder:text-mist/40 text-sm"
              />
            </div>

            <div>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Pour out your thoughts freely... What happened today? What is weighing on your mind or making you proud?"
                className="w-full rounded-xl px-4 py-3 bg-dusk/80 border border-white/5 focus:border-sage outline-none text-paper placeholder:text-mist/40 text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-mist block mb-1">
                Tags <span className="text-mist-dim">(press Enter or comma to add)</span>
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-dusk/80 border border-white/5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-sage/20 text-paper flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400 text-mist text-xs ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? "Add tags e.g. #exam #reflections #study" : "Add tag..."}
                  className="bg-transparent text-xs text-paper outline-none flex-1 min-w-[120px]"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "var(--color-sage)", color: "var(--color-ink)" }}
            >
              <Sparkles size={18} />
              <span>{submitting ? "Analyzing & Generating Encouragement..." : "Save Entry & Get ML Encouragement"}</span>
            </button>
          </form>
        </div>

        {/* Live ML Encouragement Card / Result */}
        <div className="lg:col-span-5 space-y-6">
          {currentResult?.crisis ? (
            <CrisisStrip expanded resources={currentResult.resources} />
          ) : currentResult?.entry?.encouragement ? (
            <div className="glass-card rounded-2xl p-6 border border-sage/30 relative overflow-hidden space-y-4 shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-sage font-medium text-sm">
                  <Sparkles size={16} />
                  <span>ML Encouragement Card</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(currentResult.entry._id)}
                  className="text-mist hover:text-rose-400 transition-colors"
                >
                  <Heart
                    size={18}
                    className={currentResult.entry.isFavorite ? "fill-rose-400 text-rose-400" : ""}
                  />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-sage font-medium">Validation</p>
                  <p className="text-sm text-paper mt-0.5 leading-relaxed">
                    "{currentResult.entry.encouragement.validation}"
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wider text-sage font-medium">Strength Spotlight</p>
                  <p className="text-sm text-paper/90 mt-0.5 leading-relaxed">
                    {currentResult.entry.encouragement.strengthSpotlight}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wider text-sage font-medium">Cognitive Reframe</p>
                  <p className="text-sm text-paper/90 mt-0.5 leading-relaxed">
                    {currentResult.entry.encouragement.reframing}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-sage/10 border border-sage/20 mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-sage font-semibold">Your Daily Mantra</p>
                  <p className="text-sm font-display text-paper mt-1 italic">
                    "{currentResult.entry.encouragement.mantra}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 text-center py-12 space-y-3 border border-white/5">
              <MessageSquareHeart size={36} className="text-sage/60 mx-auto" />
              <h3 className="text-paper font-medium text-base">Your Encouragement Space</h3>
              <p className="text-xs text-mist max-w-xs mx-auto">
                Write a private reflection on the left. Our local ML model will process your note and construct an encouraging cognitive reframing card.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* History & Favorite Mantras Wall */}
      <section className="space-y-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-paper">Your Private Journal & Mantras</h2>
            <p className="text-xs text-mist">Review past encrypted entries and saved encouragement mantras</p>
          </div>

          <button
            onClick={() => setFilterFavorite(!filterFavorite)}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
              filterFavorite
                ? "bg-rose-500/20 border-rose-400 text-paper"
                : "bg-dusk border-white/10 text-mist hover:text-paper"
            }`}
          >
            <Bookmark size={14} className={filterFavorite ? "fill-rose-400 text-rose-400" : ""} />
            <span>{filterFavorite ? "Saved Mantras Only" : "Show All Entries"}</span>
          </button>
        </div>

        {loadingHistory ? (
          <p className="text-sm text-mist italic">Loading private space...</p>
        ) : displayedEntries.length === 0 ? (
          <p className="text-sm text-mist italic py-8 text-center glass-card rounded-2xl">
            {filterFavorite ? "No bookmarked entries yet. Click the heart icon on any ML Encouragement Card to save it here!" : "No private reflections saved yet."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedEntries.map((entry) => (
              <div key={entry._id} className="glass-card rounded-2xl p-5 border border-white/10 hover:border-sage/30 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-sage font-medium">{new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(entry._id)}
                        className="text-mist hover:text-rose-400 transition-colors"
                      >
                        <Heart size={16} className={entry.isFavorite ? "fill-rose-400 text-rose-400" : ""} />
                      </button>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="text-mist hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display text-lg text-paper">{entry.title}</h3>
                  <p className="text-xs text-mist line-clamp-3 leading-relaxed">{entry.content}</p>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {entry.tags.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-mist">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {entry.encouragement && (
                  <div className="p-3 rounded-xl bg-sage/10 border border-sage/20 space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-sage font-semibold flex items-center gap-1">
                      <Sparkles size={11} />
                      <span>ML Mantra</span>
                    </p>
                    <p className="text-xs italic text-paper font-display">"{entry.encouragement.mantra}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
