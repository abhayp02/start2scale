import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Card from "../../components/Card.jsx";
export default function StartupDashboard() {
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
    ["Recommended Challenges", metrics?.recommended ?? "—"],
    ["Active Applications", metrics?.activeApplications ?? "—"],
    ["Shortlisted", metrics?.shortlisted ?? "—"],
    ["Active Pilots", metrics?.activePilots ?? "—"],
    ["Contracts", metrics?.contracts ?? "—"],
    ["Total Opportunities", metrics?.opportunities ?? "—"],
  ];
  return (
    <main className="page dashboard-page startup-dashboard">
      <header className="page-head">
        <div>
          <p className="eyebrow">Startup workspace</p>
          <h1 className="page-title">Welcome back, {user.name}</h1>
          <p className="subtitle">
            AI-curated public-sector opportunities matched to your capabilities.
          </p>
        </div>
        <Link className="btn btn-primary startup-profile-cta" to="/company-profile">
          <span aria-hidden="true">◎</span>
          Complete company profile
          <span aria-hidden="true">→</span>
        </Link>
      </header>
      <section className="startup-identity-strip">
        <div><span>SOLUTION IDENTITY</span><b>{user.startupProfile?.domain || "Domain not completed"}</b></div>
        <div className="startup-capability-preview">
          {(user.startupProfile?.capabilityTags || user.startupProfile?.technology || []).slice(0, 4).map((item) => <span key={item}>{item}</span>)}
        </div>
        <Link to="/recommendations">Explore matched opportunities →</Link>
      </section>
      <div className="metrics">
        {cards.map(([a, b]) => (
          <div className="metric" key={a}>
            <div className="metric-label">{a}</div>
            <div className="metric-value">{b}</div>
            <div className="delta">AI-personalized</div>
          </div>
        ))}
      </div>
      {error && <div className="card mb-5 text-[#b42318]">{error}</div>}
      <div className="grid2">
        <Card title="Opportunity radar" eyebrow="AI recommendations" className="startup-opportunity-card">
          <p className="text-sm leading-6 text-[#667085]">
            {metrics?.recommended
              ? `${metrics.recommended} published challenges currently align with your company domain.`
              : "No personalized recommendations are available yet. Complete your company profile or check again when new challenges are published."}
          </p>
          <div className="startup-recommendation-summary">
            <strong>{metrics?.recommended ?? "—"}</strong><span>relevant challenge{metrics?.recommended === 1 ? "" : "s"}</span>
          </div>
          <Link className="btn btn-primary mt-5" to="/recommendations">
            View recommendations
          </Link>
        </Card>
        <section className="ai-panel startup-capability-panel">
          <p className="eyebrow !text-[#90b4ff]">Capability profile</p>
          <h2>{user.startupProfile?.domain ? "Core profile available" : "Profile needs details"}</h2>
          <p>
            Keep your capabilities and deployment evidence current to improve match confidence.
          </p>
          <div className="progress mt-5">
            <span style={{ width: user.startupProfile?.domain ? "70%" : "25%", background: "#12b76a" }}></span>
          </div>
        </section>
      </div>
    </main>
  );
}
