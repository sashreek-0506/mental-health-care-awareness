import { Link } from "react-router-dom";
import BreathingOrb from "../components/BreathingOrb.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const FEATURES = [
  {
    tag: "check in",
    title: "Say how you actually feel",
    body: "A ten-second mood log, not a survey. Track the pattern over a semester, not just today.",
  },
  {
    tag: "breathe",
    title: "A guided reset that works",
    body: "Box breathing with a real timer, the same technique used before exams, vivas, and interviews.",
  },
  {
    tag: "listen",
    title: "Music matched to your mood",
    body: "A curated, AI-assisted picks list — calming instrumentals when you're wired, not another algorithm feed.",
  },
  {
    tag: "read",
    title: "Practical, not clinical",
    body: "Short, specific pieces on exam stress, sleep, and grounding — written for a busy student, not a textbook.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <section className="grid md:grid-cols-2 gap-12 items-center py-8">
        <div>
          <p className="eyebrow mb-4">a check-in space for students</p>
          <h1 className="font-display text-4xl sm:text-5xl text-paper leading-[1.1] mb-6">
            You don't have to be doing fine to be doing okay.
          </h1>
          <p className="text-mist text-lg mb-8 max-w-md">
            MindSpace is a quiet place to log how you're feeling between classes and deadlines,
            breathe through the spike, and get music picked for the moment you're in.
          </p>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-full font-medium"
                style={{ background: "var(--color-sage)", color: "var(--color-ink)" }}
              >
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-full font-medium"
                  style={{ background: "var(--color-sage)", color: "var(--color-ink)" }}
                >
                  Get started
                </Link>
                <Link to="/resources" className="text-mist hover:text-paper transition-colors text-sm">
                  Just show me the resources →
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <BreathingOrb size={260} showLabel={false} />
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-6 py-16">
        {FEATURES.map((f) => (
          <div key={f.tag} className="glass-card rounded-2xl p-6">
            <p className="eyebrow mb-3">{f.tag}</p>
            <h3 className="font-display text-xl text-paper mb-2">{f.title}</h3>
            <p className="text-mist text-sm">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
