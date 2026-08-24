import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLogin() {
  const { adminLogin, logout, user } = useAuth();
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
      const loggedInUser = await adminLogin(form);
      if (loggedInUser.role !== "admin") {
        logout();
        throw new Error("Administrator access is required.");
      }
      navigate("/admin");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="brand justify-center !p-0">
          <span className="brand-mark text-white">S2</span>
          <span>
            <b className="brand-name block text-[#0b1f3a]">Start2Scale</b>
            <small className="text-[#667085]">Platform Administration</small>
          </span>
        </div>
        <div className="admin-security-mark">◇</div>
        <p className="eyebrow text-center">Restricted access</p>
        <h1 className="page-title text-center">Administrator sign in</h1>
        <p className="subtitle mb-7 text-center">
          Manage platform access, integrity, templates and audit history.
        </p>
        <form onSubmit={handleSubmit}>
          <label className="form-label">
            Admin email
            <input
              className="form-input mt-1"
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label className="form-label mt-4">
            Password
            <input
              className="form-input mt-1"
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary mt-5 w-full !py-3" disabled={submitting}>
            {submitting ? "Verifying..." : "Access admin console →"}
          </button>
        </form>
        <div className="admin-login-note">
          Admin accounts cannot be created through public registration.
        </div>
        <Link className="mt-5 block text-center text-xs text-[#667085]" to="/">
          ← Return to homepage
        </Link>
      </section>
    </main>
  );
}
