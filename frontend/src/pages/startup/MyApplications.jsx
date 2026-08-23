import { useEffect, useState } from "react";
import api from "../../services/api.js";
import StatusBadge from "../../components/StatusBadge.jsx";
const stages = [
  "Submitted",
  "Eligibility Check",
  "AI Analysis",
  "Government Evaluation",
  "Shortlisted",
  "Pilot",
];
export default function MyApplications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/applications/mine")
      .then((r) => setItems(r.data.applications))
      .catch((e) =>
        setError(e.response?.data?.message || "Failed to load applications."),
      );
  }, []);
  return (
    <main className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Opportunity pipeline</p>
          <h1 className="page-title">My applications</h1>
          <p className="subtitle">
            Track eligibility, evaluation and pilot decisions from one place.
          </p>
        </div>
      </header>
      {error && <div className="card text-[#b42318]">{error}</div>}
      <div className="space-y-4">
        {items.map((a) => {
          const progress =
            { submitted: 1, eligible: 3, rejected: 2, shortlisted: 5 }[
              a.status
            ] || 1;
          return (
            <article className="card" key={a._id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <StatusBadge status={a.status} />
                  <h2 className="mt-3 text-lg font-bold text-[#0b1f3a]">
                    {a.challengeId?.requirements?.domain ||
                      "Government challenge"}
                  </h2>
                  <p className="text-xs text-[#667085]">
                    {a.challengeId?.departmentName}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#155eef]">
                  Application {a._id.slice(-6).toUpperCase()}
                </span>
              </div>
              <div className="lifecycle mt-6">
                {stages.map((x, i) => (
                  <div
                    className={`life ${i < progress ? "done" : ""} ${i === progress ? "active" : ""}`}
                    key={x}
                  >
                    <div className="life-dot">{i < progress ? "✓" : i + 1}</div>
                    {x}
                  </div>
                ))}
              </div>
              {a.status === "rejected" && (
                <div className="mt-4 rounded-lg bg-[#fef3f2] p-3 text-xs text-[#b42318]">
                  This application did not meet the published eligibility
                  criteria.
                </div>
              )}
            </article>
          );
        })}
      </div>
      {!error && !items.length && (
        <div className="card text-center text-[#667085]">
          You have not submitted any applications yet.
        </div>
      )}
    </main>
  );
}
