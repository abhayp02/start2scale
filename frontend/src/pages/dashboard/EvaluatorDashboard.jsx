import { Link } from "react-router-dom";
import Card from "../../components/Card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const metrics = [
  ["Assigned applications", "24"],
  ["Eligibility pending", "8"],
  ["Scoring pending", "6"],
  ["Clarifications", "3"],
];

export default function EvaluatorDashboard() {
  const { user } = useAuth();
  return (
    <main className="page">
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
      <div className="grid2">
        <Card title="Evaluation queue">
          {[
            ["Smart Waste Management", "Technical scoring due"],
            ["Rural Health Analytics", "Eligibility review"],
            ["Water Quality Monitoring", "Clarification received"],
          ].map(([challenge, status]) => (
            <div className="activity" key={challenge}>
              <span className="dot" />
              <div><b>{challenge}</b><p className="text-[#667085]">{status}</p></div>
            </div>
          ))}
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
