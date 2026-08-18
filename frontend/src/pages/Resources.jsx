import { useEffect, useState } from "react";
import api from "../api/axios.js";
import CrisisStrip from "../components/CrisisStrip.jsx";

export default function Resources() {
  const [articles, setArticles] = useState([]);
  const [crisisResources, setCrisisResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSlug, setOpenSlug] = useState(null);

  useEffect(() => {
    api
      .get("/resources")
      .then((res) => {
        setArticles(res.data.articles);
        setCrisisResources(res.data.crisisResources);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <p className="eyebrow mb-2">read</p>
      <h1 className="font-display text-3xl text-paper mb-8">Resources</h1>

      <div className="mb-10">
        <CrisisStrip expanded resources={crisisResources} />
      </div>

      {loading && <p className="text-mist">Loading...</p>}

      <div className="space-y-3">
        {articles.map((a) => {
          const open = openSlug === a.slug;
          return (
            <div key={a.slug} className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenSlug(open ? null : a.slug)}
                className="w-full text-left p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="eyebrow mb-1">{a.tag}</p>
                  <p className="text-paper font-display text-lg">{a.title}</p>
                </div>
                <span className="text-mist text-xl shrink-0">{open ? "–" : "+"}</span>
              </button>
              {open && (
                <div className="px-5 pb-5">
                  <p className="text-mist text-sm leading-relaxed">{a.body}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
