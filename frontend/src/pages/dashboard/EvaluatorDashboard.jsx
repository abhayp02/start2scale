import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import Card from "../../components/Card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function EvaluatorDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((response) => setSummary(response.data.metrics))
      .catch((requestError) =>
        setError(requestError.response?.data?.message || "Failed to load dashboard."),
      );
  }, []);

  const metrics = [
    ["Assigned applications", summary?.assigned ?? "—"],
    ["Scoring pending", summary?.pending ?? "—"],
    ["Evaluations submitted", summary?.submitted ?? "—"],
    ["Declined assignments", summary?.declined ?? "—"],
  ];
  return (
    <main className="page dashboard-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Independent evaluation workspace</p>
          <h1 className="page-title">Good Morning, {user.name}</h1>
          <p className="subtitle">
            Review eligibility, score assigned applications and verify pilot evidence.
          </p>
        </div>
        <Link className="btn btn-primary" to="/evaluation/score">
          Continue evaluation →
        </Link>
      </header>
      <div className="metrics">
        {metrics.map(([label, value]) => (
          <div className="metric" key={label}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
            <div className="delta">Current assignment queue</div>
          </div>
        ))}
      </div>
      {error && <div className="card mb-5 text-[#b42318]">{error}</div>}
      <div className="grid2">
        <Card title="Evaluation queue">
          <p className="text-sm leading-6 text-[#667085]">
            {summary?.pending
              ? `${summary.pending} assigned application${summary.pending === 1 ? " is" : "s are"} ready for independent scoring.`
              : "No evaluations are currently assigned to your account."}
          </p>
          <Link className="btn btn-primary mt-5" to="/evaluation/score">Open assignment queue</Link>
        </Card>
        <Card title="Evaluator safeguards">
          <div className="protection-item"><span>✓</span><b>Weighted rubric scoring</b></div>
          <div className="protection-item mt-3"><span>✓</span><b>Conflict-of-interest declaration</b></div>
          <div className="protection-item mt-3"><span>✓</span><b>Independent evidence verification</b></div>
        </Card>
      </div>
    </main>
  );
}
