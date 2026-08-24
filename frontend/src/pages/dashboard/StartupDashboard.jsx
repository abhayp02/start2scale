import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Card from "../../components/Card.jsx";
export default function StartupDashboard() {
  const { user } = useAuth();
  return (
    <main className="page dashboard-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Startup workspace</p>
          <h1 className="page-title">Welcome back, {user.name}</h1>
          <p className="subtitle">
            AI-curated public-sector opportunities matched to your capabilities.
          </p>
        </div>
        <Link className="btn btn-primary" to="/company-profile">
          Complete company profile
        </Link>
      </header>
      <div className="metrics">
        {[
          ["Recommended Challenges", "14"],
          ["Active Applications", "5"],
          ["Shortlisted", "3"],
          ["Active Pilots", "1"],
          ["Contracts", "2"],
          ["Total Opportunities", "₹8.2 Cr"],
        ].map(([a, b]) => (
          <div className="metric" key={a}>
            <div className="metric-label">{a}</div>
            <div className="metric-value">{b}</div>
            <div className="delta">AI-personalized</div>
          </div>
        ))}
      </div>
      <div className="grid2">
        <Card title="Top recommendation">
          <div className="flex justify-between gap-4">
            <div>
              <p className="eyebrow">Department of Urban Development</p>
              <h2 className="mt-2 text-xl font-bold text-[#0b1f3a]">
                Smart Waste Management
              </h2>
              <p className="mt-2 text-sm text-[#667085]">
                Budget: ₹50L · Pilot Duration: 6 Months
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Computer Vision",
                  "Waste Management",
                  "IoT",
                  "Government Deployment",
                ].map((x) => (
                  <span className="badge blue" key={x}>
                    ✓ {x}
                  </span>
                ))}
              </div>
            </div>
            <div className="score">92%</div>
          </div>
          <Link className="btn btn-primary mt-5" to="/recommendations">
            View recommendation
          </Link>
        </Card>
        <section className="ai-panel">
          <p className="eyebrow !text-[#90b4ff]">Capability profile</p>
          <h2>Profile strength: 84%</h2>
          <p>
            Add certifications and government deployments to improve match
            confidence.
          </p>
          <div className="progress mt-5">
            <span style={{ width: "84%", background: "#12b76a" }}></span>
          </div>
        </section>
      </div>
    </main>
  );
}
