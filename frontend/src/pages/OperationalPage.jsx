import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const content = {
  "Scale-Up": {
    kpis: [
      ["Solutions Scaled", "0"],
      ["Active Pilots", "0"],
      ["Current Deployment", "Not started"],
      ["Projected Users", "Not calculated"],
      ["Annual Savings", "Not calculated"],
    ],
    items: [
      "Pilot Validated",
      "Scale Recommendation",
      "Budget Approval",
      "Procurement Initiation",
      "Commercial Evaluation",
      "Approval",
      "Contract",
      "Deployment",
    ],
  },
  "Audit Trail": {
    kpis: [
      ["Recorded Actions", "0"],
      ["Users", "1"],
      ["Departments", "1"],
      ["Integrity", "Active"],
    ],
    items: [
      "23 Aug 2026 · Challenge Published",
      "24 Aug · AI Matches Generated",
      "25 Aug · Startup Application Submitted",
      "29 Aug · Eligibility Approved",
      "02 Sep · Evaluation Completed",
      "08 Sep · Pilot Approved",
      "30 Nov · Pilot Completed",
      "05 Dec · Scale Recommendation",
    ],
  },
  Notifications: {
    kpis: [
      ["Unread", "0"],
      ["Action Required", "0"],
      ["Updates", "0"],
      ["Archived", "0"],
    ],
    items: [
      "New AI match recommendations",
      "Application shortlisted",
      "Evaluation pending",
      "Pilot KPI warning",
      "Approval required",
      "Procurement milestone",
    ],
  },
  "Company Profile": {
    kpis: [
      ["Profile Strength", "Not calculated"],
      ["Capabilities", "0"],
      ["Certifications", "0"],
      ["Deployments", "0"],
    ],
    items: [
      "Company Information",
      "Product",
      "Technology",
      "Industry",
      "Team",
      "Certifications",
      "Previous Deployments",
      "Government Projects",
      "Customer Base",
      "Impact Metrics",
      "Funding / Stage",
      "Documents",
    ],
  },
};
export default function OperationalPage({ title }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((response) => setSummary(response.data.metrics))
      .catch(() => setSummary({}));
  }, []);

  const d = content[title] || {
    kpis: [
      ["Open Items", "0"],
      ["Completed", "0"],
      ["Pending Review", "0"],
      ["Account", "Ready"],
    ],
    items: [
      "Overview and activity",
      "Assigned actions",
      "Supporting documents",
      "Approvals and comments",
    ],
  };
  const kpis =
    title === "Scale-Up" && user.role === "government"
      ? [
          ["Solutions Scaled", summary?.scaledPilots ?? "—"],
          ["Active Pilots", summary?.activePilots ?? "—"],
          ["Current Deployment", summary?.scaledPilots ? "In progress" : "Not started"],
          ["Projected Users", "Not calculated"],
          ["Annual Savings", "Not calculated"],
        ]
      : title === "Company Profile" && user.role === "startup"
        ? [
            ["Profile Status", user.startupProfile?.profileStatus || "Incomplete"],
            ["Capabilities", user.startupProfile?.capabilityTags?.length || 0],
            ["Certifications", user.startupProfile?.certifications?.length || 0],
            ["Deployments", user.startupProfile?.previousDeployments?.length || 0],
          ]
        : d.kpis;
  return (
    <main className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Start2Scale workspace</p>
          <h1 className="page-title">{title}</h1>
          <p className="subtitle">
            Secure, traceable operations across the innovation procurement
            lifecycle.
          </p>
        </div>
        <button className="btn btn-primary">＋ New action</button>
      </header>
      <div className="metrics">
        {kpis.map(([a, b]) => (
          <div className="metric" key={a}>
            <div className="metric-label">{a}</div>
            <div className="metric-value">{b}</div>
            <div className="delta">Updated today</div>
          </div>
        ))}
      </div>
      {title === "Company Profile" && user.role === "startup" && (
        <section className="card mt-5">
          <p className="eyebrow">Matching evidence</p>
          <h2 className="mt-2 text-xl font-bold text-[#0b1f3a]">
            {user.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            {user.startupProfile?.productDescription || "Product description is not available."}
          </p>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              ["Domain", user.startupProfile?.domain],
              ["Prototype stage", user.startupProfile?.prototypeStage],
              ["Deployment type", user.startupProfile?.deploymentType],
              ["Team size", user.startupProfile?.teamSize],
              ["Funding stage", user.startupProfile?.fundingStage],
              ["Implementation timeline", user.startupProfile?.implementationWeeks ? `${user.startupProfile.implementationWeeks} weeks` : ""],
              ["Past projects", user.startupProfile?.pastProjects],
              ["Impact evidence", user.startupProfile?.impactMetrics?.join("; ")],
              ["Government projects", user.startupProfile?.governmentProjects?.join("; ") || "No government deployment claimed"],
              ["Customer base", user.startupProfile?.customerBase],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="form-label">{label}</p>
                <p className="text-sm text-[#344054]">{value || "Not provided"}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-[#eaecf0] pt-5">
            <p className="form-label">Capabilities used for recommendations</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(user.startupProfile?.capabilityTags || []).map((capability) => (
                <span className="badge blue" key={capability}>{capability}</span>
              ))}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <p className="form-label">Certifications</p>
              <p className="text-sm text-[#344054]">{user.startupProfile?.certifications?.join(", ") || "Not provided"}</p>
            </div>
            <div>
              <p className="form-label">Security and integration</p>
              <p className="text-sm text-[#344054]">{[...(user.startupProfile?.securityCompliance || []), ...(user.startupProfile?.integrationCapabilities || [])].join(", ") || "Not provided"}</p>
            </div>
          </div>
        </section>
      )}
      <section className="card mt-5">
        <div className="mb-5 flex flex-wrap gap-3">
          <input
            className="form-input max-w-xs"
            placeholder="Search or filter records"
          />
          <button className="btn btn-secondary">Department</button>
          <button className="btn btn-secondary">Date</button>
          <button className="btn btn-secondary">Status</button>
        </div>
        {d.items.map((x, i) => (
          <div className="activity" key={x}>
            <span
              className="dot"
              style={{ background: i < 3 ? "#12b76a" : "#155eef" }}
            ></span>
            <div className="flex-1">
              <b>{x}</b>
              <p className="mt-1 text-xs text-[#667085]">
                Recorded securely with role-based access and complete audit
                history.
              </p>
            </div>
            <span className={`badge ${i < 3 ? "success" : "blue"}`}>
              {i < 3 ? "Complete" : "In progress"}
            </span>
          </div>
        ))}
      </section>
    </main>
  );
}
