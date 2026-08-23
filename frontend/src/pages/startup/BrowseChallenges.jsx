import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
export default function BrowseChallenges({ publicView = false }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();
  useEffect(() => {
    api
      .get("/challenges")
      .then((r) => setItems(r.data.challenges))
      .catch((e) =>
        setError(e.response?.data?.message || "Failed to load challenges."),
      );
  }, []);
  return (
    <main className={publicView ? "hero min-h-screen" : "page"}>
      <div className={publicView ? "mx-auto max-w-6xl px-6 py-12" : ""}>
        <header className="page-head">
          <div>
            <p className="eyebrow">Open innovation opportunities</p>
            <h1 className="page-title">Discover government challenges</h1>
            <p className="subtitle">
              Explore published problems seeking startup-led solutions and
              measurable public impact.
            </p>
          </div>
          {publicView && (
            <Link className="btn btn-primary" to="/startup/login">
              Startup Login
            </Link>
          )}
        </header>
        {error && <div className="card text-[#b42318]">{error}</div>}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((c) => (
            <article className="card" key={c._id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="badge blue">Published</span>
                  <h2 className="mt-3 text-lg font-bold text-[#0b1f3a]">
                    {c.requirements?.domain ||
                      "Government Innovation Challenge"}
                  </h2>
                  <p className="mt-1 text-xs text-[#667085]">
                    {c.departmentName}
                  </p>
                </div>
                <span className="text-2xl text-[#155eef]">◇</span>
              </div>
              <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-6 text-[#475467]">
                {c.problemText}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  c.requirements?.technology,
                  c.requirements?.deployment,
                  c.requirements?.requiredAccuracy,
                ]
                  .filter(Boolean)
                  .map((x) => (
                    <span className="badge" key={x}>
                      {x}
                    </span>
                  ))}
              </div>
              <div className="mt-5 border-t border-[#eaecf0] pt-4">
                {user?.role === "startup" ? (
                  <Link
                    className="btn btn-primary"
                    to={`/challenges/${c._id}/apply`}
                  >
                    View & Apply →
                  </Link>
                ) : (
                  <Link className="btn btn-secondary" to="/startup/login">
                    Sign in to apply
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
        {!error && !items.length && (
          <div className="card text-center text-[#667085]">
            No published challenges yet.
          </div>
        )}
      </div>
    </main>
  );
}
