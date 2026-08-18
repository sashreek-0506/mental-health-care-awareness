import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linkBase = "text-sm transition-colors hover:text-paper";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        borderColor: "color-mix(in srgb, var(--color-mist) 10%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--color-ink) 88%, transparent)",
        backdropFilter: "blur(8px)",
      }}
    >
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-lamp)" }} />
          <span className="font-display text-lg text-paper">MindSpace</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? "text-paper" : "text-mist"}`}>
                Dashboard
              </NavLink>
              <NavLink to="/check-in" className={({ isActive }) => `${linkBase} ${isActive ? "text-paper" : "text-mist"}`}>
                Check in
              </NavLink>
              <NavLink to="/calm-space" className={({ isActive }) => `${linkBase} ${isActive ? "text-paper" : "text-mist"}`}>
                Calm space
              </NavLink>
              <NavLink to="/resources" className={({ isActive }) => `${linkBase} ${isActive ? "text-paper" : "text-mist"}`}>
                Resources
              </NavLink>
              <button onClick={handleLogout} className="text-sm text-mist hover:text-paper transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/resources" className={({ isActive }) => `${linkBase} ${isActive ? "text-paper" : "text-mist"}`}>
                Resources
              </NavLink>
              <Link
                to="/login"
                className="text-sm px-4 py-2 rounded-full border transition-colors hover:text-paper"
                style={{ borderColor: "color-mix(in srgb, var(--color-mist) 25%, transparent)" }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm px-4 py-2 rounded-full font-medium"
                style={{ background: "var(--color-sage)", color: "var(--color-ink)" }}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
