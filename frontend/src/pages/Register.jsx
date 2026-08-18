import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", institution: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password, form.institution);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto py-8">
      <p className="eyebrow mb-2">first time here</p>
      <h1 className="font-display text-3xl text-paper mb-8">Create your account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-mist block mb-1.5" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={update("name")}
            className="w-full rounded-xl px-4 py-2.5 bg-dusk border border-transparent focus:border-sage outline-none text-paper"
          />
        </div>
        <div>
          <label className="text-sm text-mist block mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            className="w-full rounded-xl px-4 py-2.5 bg-dusk border border-transparent focus:border-sage outline-none text-paper"
          />
        </div>
        <div>
          <label className="text-sm text-mist block mb-1.5" htmlFor="institution">
            College <span className="text-mist-dim">(optional)</span>
          </label>
          <input
            id="institution"
            value={form.institution}
            onChange={update("institution")}
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
            minLength={6}
            value={form.password}
            onChange={update("password")}
            className="w-full rounded-xl px-4 py-2.5 bg-dusk border border-transparent focus:border-sage outline-none text-paper"
          />
          <p className="text-xs text-mist-dim mt-1">At least 6 characters.</p>
        </div>

        {error && <p className="text-sm" style={{ color: "#e08a8a" }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-full font-medium disabled:opacity-60"
          style={{ background: "var(--color-sage)", color: "var(--color-ink)" }}
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-mist mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-sage hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
