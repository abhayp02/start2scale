import { useEffect, useState } from "react";
import api from "../../services/api.js";
export default function ScoreApplications() {
  const [rubric, setRubric] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [challengeId, setChallengeId] = useState("");
  const [apps, setApps] = useState([]);
  const [applicationId, setApplicationId] = useState("");
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    api
      .get("/evaluations/rubric")
      .then((r) => setRubric(r.data.rubric.criteria))
      .catch((e) =>
        setMessage(e.response?.data?.message || "Failed to load rubric."),
      );
    api.get("/challenges").then((r) => {
      setChallenges(r.data.challenges);
      if (r.data.challenges[0]) setChallengeId(r.data.challenges[0]._id);
    });
  }, []);
  useEffect(() => {
    if (challengeId)
      api
        .get(`/applications/challenge/${challengeId}`)
        .then((r) => {
          const list = r.data.applications.filter((a) =>
            ["eligible", "shortlisted"].includes(a.status),
          );
          setApps(list);
          setApplicationId(list[0]?._id || "");
        })
        .catch((e) =>
          setMessage(
            e.response?.data?.message || "Failed to load applications.",
          ),
        );
  }, [challengeId]);
  const total = rubric.reduce(
    (sum, x) => sum + ((Number(scores[x.name]) || 0) * x.weight) / 10,
    0,
  );
  async function submit(e) {
    e.preventDefault();
    try {
      const r = await api.post(`/evaluations/application/${applicationId}`, {
        scores: rubric.map((x) => ({
          criterion: x.name,
          score: Number(scores[x.name]),
        })),
        notes,
      });
      setMessage(
        `Evaluation saved. Final weighted score: ${r.data.evaluation.totalScore.toFixed(1)}`,
      );
    } catch (x) {
      setMessage(x.response?.data?.message || "Scoring failed.");
    }
  }
  return (
    <main className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Independent evaluation</p>
          <h1 className="page-title">Score applications</h1>
          <p className="subtitle">
            Apply the standard weighted rubric consistently across eligible
            solutions.
          </p>
        </div>
        <div className="score">{total.toFixed(1)}</div>
      </header>
      <section className="card">
        <div className="form-grid mb-6">
          <label>
            <span className="form-label">Challenge</span>
            <select
              className="form-input"
              value={challengeId}
              onChange={(e) => setChallengeId(e.target.value)}
            >
              {challenges.map((c) => (
                <option value={c._id} key={c._id}>
                  {c.requirements?.domain || c.departmentName}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Eligible startup</span>
            <select
              className="form-input"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
            >
              {apps.map((a) => (
                <option value={a._id} key={a._id}>
                  {a.startupId?.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {applicationId ? (
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {rubric.map((x) => (
                <label
                  className="rounded-lg border border-[#eaecf0] p-4"
                  key={x.name}
                >
                  <span className="flex justify-between text-sm font-semibold">
                    <span>{x.name}</span>
                    <span className="text-[#155eef]">{x.weight}%</span>
                  </span>
                  <input
                    className="form-input mt-3"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    required
                    value={scores[x.name] ?? ""}
                    onChange={(e) =>
                      setScores({ ...scores, [x.name]: e.target.value })
                    }
                    placeholder="Score 0–10"
                  />
                </label>
              ))}
            </div>
            <label className="mt-5 block">
              <span className="form-label">Evaluator comments</span>
              <textarea
                className="form-input"
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Evidence, risks and clarification required"
              />
            </label>
            <label className="mt-4 flex items-start gap-2 text-xs text-[#475467]">
              <input type="checkbox" required /> I declare that I have no
              conflict of interest for this evaluation.
            </label>
            <button className="btn btn-primary mt-5">Submit evaluation</button>
          </form>
        ) : (
          <p className="py-10 text-center text-[#667085]">
            No eligible applications are available for this challenge.
          </p>
        )}
        {message && (
          <p className="mt-4 rounded-lg bg-[#eff4ff] p-3 text-sm">{message}</p>
        )}
      </section>
    </main>
  );
}
