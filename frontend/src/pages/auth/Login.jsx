import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login({ portal = "government" }) {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedInUser = await login(form);
      if (portal === "startup" && loggedInUser.role !== "startup") {
        logout();
        throw new Error("Please use the government portal for this account.");
      }
      if (portal === "government" && loggedInUser.role === "startup") {
        logout();
        throw new Error("Please use the startup portal for this account.");
      }
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div>
          <div className="brand !p-0">
            <span className="brand-mark">S2</span>
            <b className="brand-name">Scale2Start</b>
          </div>
          <p className="eyebrow !mt-16 !text-[#90b4ff]">
            {portal === "startup"
              ? "Startup opportunity portal"
              : "Government innovation workspace"}
          </p>
          <h1>
            {portal === "startup"
              ? "Discover the right government opportunities."
              : "Turn public challenges into measurable impact."}
          </h1>
          <p className="mt-5 text-[#b9c7d9]">
            AI-powered discovery, structured evaluation, outcome-driven pilots
            and transparent procurement in one secure platform.
          </p>
        </div>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-tabs">
            <Link
              className={`auth-tab ${portal === "government" ? "active" : ""}`}
              to="/government/login"
            >
              Government
            </Link>
            <Link
              className={`auth-tab ${portal === "startup" ? "active" : ""}`}
              to="/startup/login"
            >
              Startup
            </Link>
          </div>
          <p className="eyebrow">Secure portal access</p>
          <h1 className="page-title">Welcome back</h1>
          <p className="subtitle mb-7">Sign in to your {portal} workspace.</p>
          <form onSubmit={handleSubmit}>
            <label className="form-label">
              Email
              <input
                className="form-input mt-1"
                type="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label className="form-label mt-4">
              Password
              <input
                className="form-input mt-1"
                type="password"
                required
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
              />
            </label>
            {error && (
              <p
                className="mt-4 rounded-lg bg-[#fef3f2] p-3 text-xs text-[#b42318]"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              className="btn btn-primary mt-5 w-full !py-3"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign in securely →"}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-[#667085]">
            No account?{" "}
            <Link
              className="font-semibold text-[#155eef]"
              to={`/register?role=${portal === "startup" ? "startup" : "government"}`}
            >
              Register
            </Link>
          </p>
          <Link
            to="/"
            className="mt-5 block text-center text-xs text-[#667085]"
          >
            ← Back to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
