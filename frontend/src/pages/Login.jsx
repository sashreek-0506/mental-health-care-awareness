import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign you in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto py-8">
      <p className="eyebrow mb-2">welcome back</p>
      <h1 className="font-display text-3xl text-paper mb-8">Sign in</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-mist block mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 bg-dusk border border-transparent focus:border-sage outline-none text-paper"
          />
        </div>
        <div>
          <label className="text-sm text-mist block mb-1.5" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 bg-dusk border border-transparent focus:border-sage outline-none text-paper"
          />
        </div>

        {error && <p className="text-sm" style={{ color: "#e08a8a" }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-full font-medium disabled:opacity-60"
          style={{ background: "var(--color-sage)", color: "var(--color-ink)" }}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-mist mt-6">
        New here?{" "}
        <Link to="/register" className="text-sage hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
