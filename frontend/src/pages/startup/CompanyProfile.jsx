import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const listFields = [
  ["technology", "Technology", "Computer Vision, IoT, Data Analytics"],
  ["capabilityTags", "Capability tags", "AI, Smart Cities, CleanTech"],
  ["industriesServed", "Industries served", "Government, Urban Governance"],
  ["certifications", "Certifications", "Startup India Recognized, ISO 27001"],
  ["previousDeployments", "Previous deployments", "Municipal pilot across 12 sites"],
  ["governmentProjects", "Government projects", "District-level technology pilot"],
  ["impactMetrics", "Impact evidence", "24% cost reduction, 92% accuracy"],
  ["integrationCapabilities", "Integration capabilities", "REST API, SSO, CSV exchange"],
  ["securityCompliance", "Security compliance", "Encryption, RBAC, India data residency"],
  ["geographicAvailability", "Geographic availability", "Pan India, Tier-2 cities"],
];

const textFields = [
  ["domain", "Primary domain", "Waste Management"],
  ["deploymentType", "Deployment model", "Edge + India-region Cloud"],
  ["fundingStage", "Funding stage", "Seed"],
  ["customerBase", "Customer base", "Municipal corporations and public institutions"],
  ["pastProjects", "Past-project summary", "Summarize the most relevant implementation"],
  ["accuracyClaims", "Performance claims", "State measurable, evidence-backed results"],
];

function listValue(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function splitList(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export default function CompanyProfile() {
  const { user, updateCurrentUser } = useAuth();
  const profile = user.startupProfile || {};
  const [form, setForm] = useState(() => ({
    ...profile,
    technology: listValue(profile.technology),
    capabilityTags: listValue(profile.capabilityTags),
    industriesServed: listValue(profile.industriesServed),
    certifications: listValue(profile.certifications),
    previousDeployments: listValue(profile.previousDeployments),
    governmentProjects: listValue(profile.governmentProjects),
    impactMetrics: listValue(profile.impactMetrics),
    integrationCapabilities: listValue(profile.integrationCapabilities),
    securityCompliance: listValue(profile.securityCompliance),
    geographicAvailability: listValue(profile.geographicAvailability),
    prototypeStage: profile.prototypeStage || "prototype",
    isRegisteredEntity: profile.isRegisteredEntity ?? true,
  }));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const completion = useMemo(() => {
    const checks = [
      form.domain,
      form.productDescription,
      form.technology,
      form.capabilityTags,
      form.pastProjects,
      form.impactMetrics,
      form.certifications,
      form.securityCompliance,
      form.geographicAvailability,
      form.teamSize,
    ];
    return Math.round((checks.filter((value) => String(value || "").trim()).length / checks.length) * 100);
  }, [form]);

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const startupProfile = { ...form };
      for (const [field] of listFields) startupProfile[field] = splitList(form[field] || "");
      const response = await api.patch("/auth/me/startup-profile", { startupProfile });
      updateCurrentUser(response.data.user);
      setMessage("Company profile saved. Updated evidence will now support future AI matching.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update company profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page startup-profile-page">
      <header className="page-head startup-profile-head">
        <div>
          <p className="eyebrow">Startup matching identity</p>
          <h1 className="page-title">Company profile</h1>
          <p className="subtitle">Maintain the structured evidence used to recommend your solution to government challenges.</p>
        </div>
        <div className="profile-completion">
          <b>{completion}%</b>
          <span>Profile strength</span>
          <div className="progress"><i style={{ width: `${completion}%` }} /></div>
        </div>
      </header>

      <form onSubmit={submit} className="startup-profile-layout">
        <div className="profile-form-column">
          <section className="card profile-section">
            <div className="profile-section-head"><span>01</span><div><h2>Solution foundation</h2><p>Describe what you offer and where it fits.</p></div></div>
            <label className="form-label" htmlFor="productDescription">Product description</label>
            <textarea id="productDescription" className="form-input" name="productDescription" rows="4" value={form.productDescription || ""} onChange={change} required />
            <div className="form-grid mt-5">
              {textFields.map(([name, label, placeholder]) => (
                <label key={name}><span className="form-label">{label}</span><input className="form-input" name={name} value={form[name] || ""} onChange={change} placeholder={placeholder} required={["domain", "deploymentType"].includes(name)} /></label>
              ))}
            </div>
          </section>

          <section className="card profile-section">
            <div className="profile-section-head"><span>02</span><div><h2>Capabilities and evidence</h2><p>Use comma-separated entries so matching can compare individual signals.</p></div></div>
            <div className="form-grid">
              {listFields.map(([name, label, placeholder]) => (
                <label key={name}><span className="form-label">{label}</span><textarea className="form-input" name={name} rows="3" value={form[name] || ""} onChange={change} placeholder={placeholder} required={name === "technology"} /></label>
              ))}
            </div>
          </section>

          <section className="card profile-section">
            <div className="profile-section-head"><span>03</span><div><h2>Delivery readiness</h2><p>Define practical pilot capacity and implementation constraints.</p></div></div>
            <div className="form-grid">
              <label><span className="form-label">Prototype stage</span><select className="form-input" name="prototypeStage" value={form.prototypeStage} onChange={change}><option value="idea-only">Idea only</option><option value="prototype">Working prototype</option><option value="deployed">Deployed solution</option></select></label>
              <label><span className="form-label">Team size</span><input className="form-input" type="number" min="1" name="teamSize" value={form.teamSize || ""} onChange={change} /></label>
              <label><span className="form-label">Minimum pilot budget (INR)</span><input className="form-input" type="number" min="0" name="pilotBudgetMin" value={form.pilotBudgetMin || ""} onChange={change} /></label>
              <label><span className="form-label">Maximum pilot budget (INR)</span><input className="form-input" type="number" min="0" name="pilotBudgetMax" value={form.pilotBudgetMax || ""} onChange={change} /></label>
              <label><span className="form-label">Implementation timeline (weeks)</span><input className="form-input" type="number" min="1" name="implementationWeeks" value={form.implementationWeeks || ""} onChange={change} /></label>
              <label className="profile-check"><input type="checkbox" name="isRegisteredEntity" checked={Boolean(form.isRegisteredEntity)} onChange={change} /><span><b>Registered legal entity</b><small>Confirm the organization is formally registered.</small></span></label>
            </div>
          </section>

          {error && <div className="form-error">{error}</div>}
          {message && <div className="profile-success">{message}</div>}
          <div className="profile-actions"><Link className="btn btn-secondary" to="/dashboard">Return to dashboard</Link><button className="btn btn-primary" disabled={saving}>{saving ? "Saving profile…" : "Save company profile"}</button></div>
        </div>

        <aside className="profile-guidance">
          <section className="profile-guidance-card"><span>✦ MATCHING GUIDANCE</span><h2>What improves relevance?</h2>{["Specific technologies rather than broad claims", "Verified deployment and government-project evidence", "Measurable impact metrics", "Clear security and integration readiness", "Realistic pilot budget and timeline"].map((item) => <p key={item}>✓ {item}</p>)}</section>
          <section className="card"><p className="form-label">Decision boundary</p><p className="text-xs leading-5 text-[#667085]">Profile data helps AI recommend your startup. It never guarantees shortlisting, pilot selection or procurement.</p></section>
        </aside>
      </form>
    </main>
  );
}
