import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api.js";
const stages = [
  "Challenge",
  "Eligibility",
  "Solution",
  "Technical Proposal",
  "Impact",
  "Commercial Proposal",
  "Documents",
  "Review",
];
export default function Apply() {
  const { challengeId } = useParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const labels = [
    ["solution", "Solution overview"],
    ["technical", "Technical approach"],
    ["impact", "Expected public impact"],
    ["commercial", "Commercial proposal"],
    ["documents", "Document references"],
  ];
  async function submit() {
    setBusy(true);
    try {
      await api.post(`/applications/challenge/${challengeId}`, form);
      setMessage(
        "Application submitted successfully. You can track it from My Applications.",
      );
    } catch (e) {
      setMessage(e.response?.data?.message || "Submission failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Startup application</p>
          <h1 className="page-title">Submit your solution</h1>
          <p className="subtitle">
            Present your capability, evidence and proposed outcomes for
            government evaluation.
          </p>
        </div>
        <Link className="btn btn-secondary" to="/challenges">
          Cancel
        </Link>
      </header>
      <section className="card">
        <div className="wizard">
          {stages.map((x, i) => (
            <span className={i === step ? "active" : ""} key={x}>
              {i + 1}. {x}
            </span>
          ))}
        </div>
        {step === 0 ? (
          <div className="rounded-lg bg-[#f5f8ff] p-5">
            <b className="text-[#0b1f3a]">Challenge selected</b>
            <p className="mt-2 text-sm text-[#667085]">
              Your verified company profile will be attached automatically.
            </p>
          </div>
        ) : step === 1 ? (
          <div className="rounded-lg border border-[#abefc6] bg-[#ecfdf3] p-5">
            <b className="text-[#027a48]">
              Profile eligibility pre-check ready
            </b>
            <p className="mt-2 text-sm text-[#475467]">
              Registration, domain alignment and prototype status will be
              evaluated after submission.
            </p>
          </div>
        ) : step < 7 ? (
          <label>
            <span className="form-label">{labels[step - 2]?.[1]}</span>
            <textarea
              className="form-input"
              rows="8"
              value={form[labels[step - 2]?.[0]] || ""}
              onChange={(e) =>
                setForm({ ...form, [labels[step - 2]?.[0]]: e.target.value })
              }
              placeholder="Provide concise evidence and measurable commitments"
            />
          </label>
        ) : (
          <div>
            <h2 className="card-title">Review declaration</h2>
            <p className="mt-2 text-sm text-[#667085]">
              Confirm that the submitted information is accurate and your
              representative is authorized to apply.
            </p>
            <label className="mt-4 flex gap-2 text-sm">
              <input type="checkbox" required /> I confirm the information
              provided is complete and accurate.
            </label>
          </div>
        )}
        <div className="mt-7 flex justify-between border-t border-[#eaecf0] pt-5">
          <button
            className="btn btn-secondary"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            ← Back
          </button>
          {step < 7 ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep(step + 1)}
            >
              Continue →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={submit}
              disabled={busy}
            >
              {busy ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
        {message && (
          <p className="mt-4 rounded-lg bg-[#eff4ff] p-3 text-sm">{message}</p>
        )}
      </section>
    </main>
  );
}
