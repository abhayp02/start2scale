const content = {
  "Scale-Up": {
    kpis: [
      ["Current Deployment", "12 Sites"],
      ["Target Deployment", "150 Sites"],
      ["Current Users", "4,280"],
      ["Projected Users", "2.4M"],
      ["Annual Savings", "₹4.8 Cr"],
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
      ["Recorded Actions", "1,284"],
      ["Users", "86"],
      ["Departments", "12"],
      ["Integrity", "Verified"],
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
      ["Unread", "8"],
      ["Action Required", "3"],
      ["Updates", "12"],
      ["Archived", "47"],
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
      ["Profile Strength", "84%"],
      ["Capabilities", "7"],
      ["Certifications", "4"],
      ["Deployments", "12"],
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
  const d = content[title] || {
    kpis: [
      ["Open Items", "12"],
      ["Completed", "38"],
      ["Pending Review", "5"],
      ["Compliance", "100%"],
    ],
    items: [
      "Overview and activity",
      "Assigned actions",
      "Supporting documents",
      "Approvals and comments",
    ],
  };
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
        {d.kpis.map(([a, b]) => (
          <div className="metric" key={a}>
            <div className="metric-label">{a}</div>
            <div className="metric-value">{b}</div>
            <div className="delta">Updated today</div>
          </div>
        ))}
      </div>
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
