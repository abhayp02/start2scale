import { useState } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
const steps = [
  "Challenge",
  "Requirements",
  "Eligibility",
  "Commercial",
  "Evaluation",
];
const fields = {
  0: [
    ["challengeTitle", "Challenge Title"],
    ["problemDescription", "Problem Statement", "textarea"],
    ["currentSituation", "Current Situation", "textarea"],
    ["targetBeneficiaries", "Target Beneficiaries"],
    ["expectedOutcome", "Expected Outcome", "textarea"],
  ],
  1: [
    ["functionalRequirements", "Functional Requirements", "textarea"],
    ["technicalRequirements", "Technical Requirements", "textarea"],
    ["integrationRequirements", "Integration Requirements", "textarea"],
    ["securityRequirements", "Security Requirements", "textarea"],
    ["performanceRequirements", "Performance Requirements", "textarea"],
  ],
  2: [
    ["startupType", "Startup Type"],
    ["registrationRequirements", "Registration Requirements"],
    ["certifications", "Certifications"],
    ["experience", "Experience"],
    ["geographicRequirements", "Geographic Requirements"],
    ["otherEligibility", "Other Eligibility Criteria", "textarea"],
  ],
  3: [
    ["pilotBudget", "Pilot Budget (INR)", "number"],
    ["procurementBudget", "Estimated Procurement Budget (INR)", "number"],
    ["pilotDuration", "Pilot Duration"],
    ["expectedScale", "Expected Scale"],
    ["procurementModel", "Procurement Model"],
    ["paymentStructure", "Payment Structure", "textarea"],
  ],
};
const criteria = [
  "Technical Feasibility",
  "Innovation",
  "Impact",
  "Scalability",
  "Cost",
  "Team Capability",
];
export default function CreateChallenge() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({});
  const [weights, setWeights] = useState({
    "Technical Feasibility": 25,
    Innovation: 20,
    Impact: 20,
    Scalability: 15,
    Cost: 10,
    "Team Capability": 10,
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  async function publish() {
    setBusy(true);
    setMessage("");
    try {
      const payload = {
        ...form,
        departmentName: user.departmentName || user.name,
        sector: form.startupType || "Cross-sector",
        problemDescription: `${form.challengeTitle}\n\n${form.problemDescription}\n\nCurrent situation: ${form.currentSituation}`,
        outcomeGoal: form.expectedOutcome,
        kpiList: [
          form.functionalRequirements,
          form.performanceRequirements,
        ].filter(Boolean),
        pilotScope: form.expectedScale,
        pilotDuration: form.pilotDuration,
        maxBudget: Number(form.pilotBudget),
      };
      const r = await api.post("/challenges", payload);
      await api.patch(`/challenges/${r.data.challenge._id}/status`, {
        status: "published",
      });
      setMessage(`Challenge published successfully: ${r.data.challenge._id}`);
      setForm({});
      setStep(0);
    } catch (e) {
      setMessage(e.response?.data?.message || "Unable to publish challenge.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Challenge management</p>
          <h1 className="page-title">Publish a government challenge</h1>
          <p className="subtitle">
            Define the problem clearly so the AI matching engine can discover
            the strongest startup solutions.
          </p>
        </div>
        <span className="badge blue">Secure workspace</span>
      </header>
      <section className="card">
        <div className="wizard">
          {steps.map((x, i) => (
            <span className={i === step ? "active" : ""} key={x}>
              {i + 1}. {x}
            </span>
          ))}
        </div>
        {step < 4 ? (
          <div className="form-grid">
            {fields[step].map(([name, label, type]) => (
              <div
                className={type === "textarea" ? "col-span-full" : ""}
                key={name}
              >
                <label className="form-label">{label}</label>
                {type === "textarea" ? (
                  <textarea
                    className="form-input"
                    rows="4"
                    name={name}
                    value={form[name] || ""}
                    onChange={update}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                ) : (
                  <input
                    className="form-input"
                    type={type || "text"}
                    name={name}
                    value={form[name] || ""}
                    onChange={update}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="mb-5 rounded-lg border border-[#b2ccff] bg-[#f5f8ff] p-4 text-sm text-[#344054]">
              <b>Configure weighted evaluation criteria</b>
              <p className="mt-1 text-xs text-[#667085]">
                Weights should total 100%. Evaluators score each criterion
                independently.
              </p>
            </div>
            {criteria.map((c) => (
              <div
                className="mb-4 grid grid-cols-[1fr_100px] items-center gap-4"
                key={c}
              >
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{c}</span>
                    <b>{weights[c]}%</b>
                  </div>
                  <input
                    className="w-full accent-[#155eef]"
                    type="range"
                    min="0"
                    max="50"
                    value={weights[c]}
                    onChange={(e) =>
                      setWeights({ ...weights, [c]: Number(e.target.value) })
                    }
                  />
                </div>
                <input
                  className="form-input"
                  type="number"
                  value={weights[c]}
                  onChange={(e) =>
                    setWeights({ ...weights, [c]: Number(e.target.value) })
                  }
                />
              </div>
            ))}
            <p
              className={`text-sm font-semibold ${Object.values(weights).reduce((a, b) => a + b, 0) === 100 ? "text-[#138808]" : "text-[#d92d20]"}`}
            >
              Total: {Object.values(weights).reduce((a, b) => a + b, 0)}%
            </p>
          </div>
        )}
        <div className="mt-7 flex items-center justify-between border-t border-[#eaecf0] pt-5">
          <button
            className="btn btn-secondary"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            ← Back
          </button>
          {step < 4 ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep(step + 1)}
            >
              Continue →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={
                busy ||
                Object.values(weights).reduce((a, b) => a + b, 0) !== 100
              }
              onClick={publish}
            >
              {busy ? "Publishing..." : "Publish Challenge"}
            </button>
          )}
        </div>
        {message && (
          <p className="mt-4 rounded-lg bg-[#eff4ff] p-3 text-sm text-[#344054]">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
