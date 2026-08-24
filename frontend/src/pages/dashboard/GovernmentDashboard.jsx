import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Card from "../../components/Card.jsx";
export default function GovernmentDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((response) => setMetrics(response.data.metrics))
      .catch((requestError) =>
        setError(requestError.response?.data?.message || "Failed to load dashboard."),
      );
  }, []);

  const cards = [
    ["Active Challenges", metrics?.activeChallenges ?? "—"],
    ["Applications Received", metrics?.applications ?? "—"],
    ["AI Matches", metrics?.aiMatches ?? "—"],
    ["Active Pilots", metrics?.activePilots ?? "—"],
    [
      "Procurement Pipeline",
      metrics
        ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(metrics.procurementPipeline)
        : "—",
    ],
    ["Solutions Scaled", metrics?.scaledPilots ?? "—"],
    ["Estimated Public Impact", metrics?.estimatedImpact ?? "—"],
  ];
  return (
    <main className="page dashboard-page government-dashboard">
      <header className="page-head">
        <div>
          <p className="eyebrow">Government workspace</p>
          <h1 className="page-title">
            Good Morning, {user.name || "Procurement Officer"}
          </h1>
          <p className="subtitle">
            Here’s the latest across your innovation procurement portfolio.
          </p>
        </div>
        <Link className="btn btn-primary publish-challenge-button" to="/department/challenges/new">
          <span aria-hidden="true">＋</span>
          Publish Challenge
          <span className="publish-arrow" aria-hidden="true">→</span>
        </Link>
      </header>
      <section className="government-mandate-strip">
        <div><span>PUBLIC INNOVATION PORTFOLIO</span><b>{user.departmentName || "Government Department"}</b></div>
        <p>Challenge discovery</p><i>→</i><p>Evidence-led pilots</p><i>→</i><p>Outcome procurement</p>
      </section>
      <div className="metrics">
        {cards.map(([a, b]) => (
          <div className="metric" key={a}>
            <div className="metric-label">{a}</div>
            <div className="metric-value">{b}</div>
            <div className="delta">
              <span className="text-[#12b76a]">↑</span> updated this month
            </div>
          </div>
        ))}
      </div>
      {error && <div className="card mb-5 text-[#b42318]">{error}</div>}
      {metrics?.activeChallenges === 0 && (
        <section className="card mb-5 text-center">
          <h2 className="text-lg font-bold text-[#0b1f3a]">Start your first innovation workflow</h2>
          <p className="mt-2 text-sm text-[#667085]">This account has no challenges yet. Publish one to begin receiving applications and AI matches.</p>
          <Link className="btn btn-primary mt-4" to="/department/challenges/new">Publish challenge</Link>
        </section>
      )}
      {user.governmentProfile && (
        <section className="card mb-5 government-profile-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Organization profile</p>
              <h2 className="mt-2 text-lg font-bold text-[#0b1f3a]">{user.departmentName}</h2>
              <p className="mt-1 text-sm text-[#667085]">
                {user.governmentProfile.organizationType} · {user.governmentProfile.jurisdiction}
              </p>
            </div>
            <span className="badge success">Verified government account</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(user.governmentProfile.procurementFocus || []).map((focus) => (
              <span className="badge blue" key={focus}>{focus}</span>
            ))}
          </div>
        </section>
      )}
      <div className="grid2">
        <div>
          <section className="ai-panel">
            <p className="eyebrow !text-[#90b4ff]">✦ AI Matching Engine</p>
            <h2>{metrics?.aiMatches || 0} solution matches ready for review</h2>
            <p>
              Open a published challenge to analyze verified startup profiles.
            </p>
            <div className="ai-stats">
              <div>
                <strong>AI</strong>
                <span>TOP MATCH</span>
              </div>
              <div>
                <strong>{metrics?.aiMatches || 0}</strong>
                <span>MATCHES</span>
              </div>
              <div>
                <strong>{metrics?.activeChallenges || 0}</strong>
                <span>CHALLENGES</span>
              </div>
            </div>
            <Link className="btn btn-primary" to="/matching">
              Review AI matches →
            </Link>
          </section>
          <Card title="Innovation funnel" className="mt-5">
            <div className="lifecycle">
              {[
                `${metrics?.activeChallenges || 0} Active challenges`,
                `${metrics?.applications || 0} Applications`,
                `${metrics?.activePilots || 0} Active pilots`,
                `${metrics?.scaledPilots || 0} Scaled solutions`,
              ].map((x, i) => (
                <div
                  className={`life ${i < 2 ? "done" : ""} ${i === 2 ? "active" : ""}`}
                  key={x}
                >
                  <div className="life-dot">{i < 2 ? "✓" : i + 1}</div>
                  {x}
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div>
          <Card title="Priority actions">
            {[
              ["Applications received", `${metrics?.applications || 0} in your challenges`],
              ["Active pilot monitoring", `${metrics?.activePilots || 0} pilots`],
              ["Payments awaiting release", metrics?.procurementPipeline ? "Review procurement queue" : "No payments due"],
            ].map(([a, b]) => (
              <div className="activity" key={a}>
                <span className="dot"></span>
                <div>
                  <b>{a}</b>
                  <p className="text-[#667085]">{b}</p>
                </div>
              </div>
            ))}
          </Card>
          <Card title="Recent activity" className="mt-5">
            <p className="py-6 text-sm text-[#667085]">
              Account-specific audit activity will appear here as you publish challenges and process applications.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
