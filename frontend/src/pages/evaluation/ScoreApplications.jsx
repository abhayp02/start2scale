import { useEffect, useMemo, useState } from "react";
import api from "../../services/api.js";

export default function ScoreApplications() {
  const [rubric, setRubric] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState("");
  const [conflictDeclared, setConflictDeclared] = useState(false);
  const [message, setMessage] = useState("");

  const selected = useMemo(
    () => assignments.find((assignment) => assignment._id === assignmentId),
    [assignments, assignmentId],
  );

  useEffect(() => {
    Promise.all([api.get("/evaluations/rubric"), api.get("/evaluations/assigned")])
      .then(([rubricResponse, assignmentResponse]) => {
        setRubric(rubricResponse.data.rubric.criteria);
        setAssignments(assignmentResponse.data.evaluations);
        const firstPending = assignmentResponse.data.evaluations.find(
          (assignment) => assignment.status === "assigned",
        );
        setAssignmentId(firstPending?._id || "");
      })
      .catch((requestError) =>
        setMessage(requestError.response?.data?.message || "Failed to load assignments."),
      );
  }, []);

  const total = rubric.reduce(
    (sum, criterion) =>
      sum + ((Number(scores[criterion.name]) || 0) * criterion.weight) / 10,
    0,
  );

  async function submit(event) {
    event.preventDefault();
    if (!selected?.applicationId?._id) return;

    try {
      const response = await api.post(
        `/evaluations/application/${selected.applicationId._id}`,
        {
          scores: rubric.map((criterion) => ({
            criterion: criterion.name,
            score: Number(scores[criterion.name]),
          })),
          notes,
          conflictDeclared,
        },
      );
      setAssignments((current) =>
        current.map((assignment) =>
          assignment._id === assignmentId
            ? { ...assignment, status: "submitted" }
            : assignment,
        ),
      );
      setMessage(
        `Evaluation submitted. Final weighted score: ${response.data.evaluation.totalScore.toFixed(1)}`,
      );
    } catch (requestError) {
      setMessage(requestError.response?.data?.message || "Scoring failed.");
    }
  }

  const pendingAssignments = assignments.filter(
    (assignment) => assignment.status === "assigned",
  );

  return (
    <main className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Independent evaluation</p>
          <h1 className="page-title">Assigned applications</h1>
          <p className="subtitle">
            Only applications assigned to your evaluator account are available
            for scoring.
          </p>
        </div>
        <div className="score">{total.toFixed(1)}</div>
      </header>

      <section className="card">
        <label className="mb-6 block">
          <span className="form-label">Evaluation assignment</span>
          <select
            className="form-input"
            value={assignmentId}
            onChange={(event) => {
              setAssignmentId(event.target.value);
              setScores({});
              setNotes("");
              setConflictDeclared(false);
              setMessage("");
            }}
          >
            <option value="">Select an assigned application</option>
            {pendingAssignments.map((assignment) => (
              <option value={assignment._id} key={assignment._id}>
                {assignment.applicationId?.startupId?.name} — {assignment.applicationId?.challengeId?.requirements?.domain || "Government challenge"}
              </option>
            ))}
          </select>
        </label>

        {selected ? (
          <form onSubmit={submit}>
            <div className="mb-6 rounded-lg border border-[#eaecf0] p-4">
              <p className="eyebrow">Assigned startup</p>
              <h2 className="mt-2 text-lg font-bold text-[#0b1f3a]">
                {selected.applicationId?.startupId?.name}
              </h2>
              <p className="mt-1 text-sm text-[#667085]">
                {selected.applicationId?.challengeId?.departmentName} · {selected.applicationId?.challengeId?.requirements?.domain}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {rubric.map((criterion) => (
                <label className="rounded-lg border border-[#eaecf0] p-4" key={criterion.name}>
                  <span className="flex justify-between text-sm font-semibold">
                    <span>{criterion.name}</span>
                    <span className="text-[#155eef]">{criterion.weight}%</span>
                  </span>
                  <input
                    className="form-input mt-3"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    required
                    value={scores[criterion.name] ?? ""}
                    onChange={(event) =>
                      setScores({ ...scores, [criterion.name]: event.target.value })
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
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Evidence, risks and clarification required"
              />
            </label>

            <label className="mt-4 flex items-start gap-2 text-xs text-[#475467]">
              <input
                type="checkbox"
                required
                checked={conflictDeclared}
                onChange={(event) => setConflictDeclared(event.target.checked)}
              />
              I declare that I have no conflict of interest for this evaluation.
            </label>

            <button className="btn btn-primary mt-5">Submit evaluation</button>
          </form>
        ) : (
          <p className="py-10 text-center text-[#667085]">
            No pending applications are assigned to you.
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-lg bg-[#eff4ff] p-3 text-sm">{message}</p>
        )}
      </section>
    </main>
  );
}
