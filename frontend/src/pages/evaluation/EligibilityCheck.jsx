import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
export default function EligibilityCheck() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [selected, setSelected] = useState("");
  const [apps, setApps] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [evaluatorByApplication, setEvaluatorByApplication] = useState({});
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get(user.role === "government" ? "/challenges/mine" : "/challenges")
      .then((r) => {
        const list = r.data.challenges;
        setChallenges(list);
        if (list[0]) setSelected(list[0]._id);
      })
      .catch((e) =>
        setError(e.response?.data?.message || "Failed to load challenges."),
      );
  }, [user.role]);
  useEffect(() => {
    if (user.role !== "government") return;
    api
      .get("/evaluations/evaluators")
      .then((response) => setEvaluators(response.data.evaluators))
      .catch((requestError) =>
        setError(requestError.response?.data?.message || "Failed to load evaluators."),
      );
  }, [user.role]);
  useEffect(() => {
    if (selected)
      api
        .get(`/applications/challenge/${selected}`)
        .then((r) => setApps(r.data.applications))
        .catch((e) =>
          setError(e.response?.data?.message || "Failed to load applications."),
        );
  }, [selected]);
  async function check(id) {
    try {
      const r = await api.patch(`/applications/${id}/eligibility`, {});
      setApps((items) =>
        items.map((x) =>
          x._id === id ? { ...r.data.application, startupId: x.startupId } : x,
        ),
      );
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Eligibility check failed.");
    }
  }

  async function shortlist(id) {
    try {
      const response = await api.patch(`/applications/${id}/shortlist`, {});
      setApps((items) =>
        items.map((application) =>
          application._id === id
            ? {
                ...response.data.application,
                startupId: application.startupId,
              }
            : application,
        ),
      );
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Failed to shortlist application.",
      );
    }
  }

  async function assignEvaluator(applicationId) {
    const evaluatorId = evaluatorByApplication[applicationId];
    if (!evaluatorId) {
      setError("Select an evaluator first.");
      return;
    }
    try {
      const response = await api.post(
        `/evaluations/application/${applicationId}/assign`,
        { evaluatorId },
      );
      setError("");
      setAssignmentMessage(
        `${response.data.evaluation.evaluatorId.name} has been assigned successfully.`,
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Evaluator assignment failed.");
    }
  }
  return (
    <main className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Application screening</p>
          <h1 className="page-title">Eligibility checks</h1>
          <p className="subtitle">
            Transparent checks use registration, sector match and working
            prototype status only.
          </p>
        </div>
        <select
          className="form-input max-w-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {challenges.map((c) => (
            <option value={c._id} key={c._id}>
              {c.requirements?.domain || c.departmentName}
            </option>
          ))}
        </select>
      </header>
      {error && <div className="card text-[#b42318]">{error}</div>}
      {assignmentMessage && (
        <div className="card mb-4 text-[#067647]">{assignmentMessage}</div>
      )}
      <section className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#eaecf0] text-xs uppercase text-[#667085]">
            <tr>
              <th className="p-3">Startup</th>
              <th>Registered</th>
              <th>Sector match</th>
              <th>Prototype</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr className="border-b border-[#eaecf0]" key={a._id}>
                <td className="p-3">
                  <b>{a.startupId?.name}</b>
                  <small className="block text-[#667085]">
                    {a.startupId?.startupProfile?.domain}
                  </small>
                </td>
                {["registered", "sectorMatch", "hasWorkingPrototype"].map(
                  (k) => (
                    <td key={k}>
                      {a.eligibility?.[k] === undefined
                        ? "—"
                        : a.eligibility[k]
                          ? "✓"
                          : "✕"}
                    </td>
                  ),
                )}
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    {a.status === "submitted" && (
                      <button
                        className="btn btn-primary"
                        onClick={() => check(a._id)}
                      >
                        Run check
                      </button>
                    )}
                    {a.status === "eligible" && user.role === "government" && (
                      <>
                        <select
                          className="form-input min-w-48"
                          value={evaluatorByApplication[a._id] || ""}
                          onChange={(event) =>
                            setEvaluatorByApplication({
                              ...evaluatorByApplication,
                              [a._id]: event.target.value,
                            })
                          }
                        >
                          <option value="">Select evaluator</option>
                          {evaluators.map((evaluator) => (
                            <option value={evaluator._id} key={evaluator._id}>
                              {evaluator.name}
                              {evaluator.evaluatorProfile?.expertiseDomains?.length
                                ? ` — ${evaluator.evaluatorProfile.expertiseDomains.join(", ")}`
                                : ""}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-primary"
                          onClick={() => assignEvaluator(a._id)}
                        >
                          Assign
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => shortlist(a._id)}
                        >
                          Shortlist after score
                        </button>
                      </>
                    )}
                    {a.status === "shortlisted" &&
                      user.role === "government" && (
                        <Link
                          className="btn btn-primary"
                          to={`/applications/${a._id}/pilot/new`}
                        >
                          Create Pilot
                        </Link>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!apps.length && (
          <p className="py-10 text-center text-[#667085]">
            No applications for this challenge.
          </p>
        )}
      </section>
    </main>
  );
}
