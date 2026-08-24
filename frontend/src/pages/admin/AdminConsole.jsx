import { useEffect, useMemo, useState } from "react";
import api from "../../services/api.js";

const viewCopy = {
  users: ["User management", "Control access across every platform role."],
  government: ["Government organizations", "Review department accounts and official access."],
  startups: ["Startup oversight", "Monitor company profiles and prevent duplicate or abusive access."],
  evaluators: ["Evaluator management", "Review evaluator assignments and account standing."],
};

function LoadingPanel() {
  return <div className="admin-empty">Loading secure platform data…</div>;
}

function EmptyPanel({ children }) {
  return <div className="admin-empty">{children}</div>;
}

export default function AdminConsole({ view = "overview" }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [action, setAction] = useState("");

  const role = useMemo(
    () => ({ government: "government", startups: "startup", evaluators: "evaluator" })[view],
    [view],
  );

  async function load() {
    setError("");
    try {
      if (view === "overview") {
        setData((await api.get("/admin/overview")).data);
      } else if (["users", "government", "startups", "evaluators"].includes(view)) {
        const params = new URLSearchParams();
        if (role) params.set("role", role);
        if (status) params.set("status", status);
        if (search) params.set("search", search);
        setData((await api.get(`/admin/users?${params}`)).data);
      } else if (view === "audit") {
        const params = new URLSearchParams();
        if (action) params.set("action", action);
        setData((await api.get(`/admin/audit-logs?${params}`)).data);
      } else if (view === "settings") {
        setData((await api.get("/admin/settings")).data);
      } else {
        setData((await api.get("/admin/overview")).data);
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    setData(null);
    load();
  }, [view, role]);

  async function changeStatus(user) {
    const nextStatus = user.accountStatus === "suspended" ? "active" : "suspended";
    try {
      await api.patch(`/admin/users/${user._id}/status`, { accountStatus: nextStatus });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (error) return <main className="page"><div className="form-error">{error}</div></main>;
  if (!data) return <main className="page"><LoadingPanel /></main>;

  if (view === "overview") return <AdminOverview data={data} />;
  if (["users", "government", "startups", "evaluators"].includes(view)) {
    const [title, subtitle] = viewCopy[view];
    return (
      <main className="page">
        <header className="page-head">
          <div>
            <p className="eyebrow">Access governance</p>
            <h1 className="page-title">{title}</h1>
            <p className="subtitle">{subtitle}</p>
          </div>
          <span className="badge blue">{data.users.length} accounts</span>
        </header>
        <section className="card admin-toolbar">
          <input
            className="form-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email or department"
          />
          <select className="form-input" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="pending-verification">Pending verification</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="btn btn-primary" onClick={load}>Apply filters</button>
        </section>
        <section className="card mt-5 overflow-x-auto !p-0">
          <table className="admin-table">
            <thead><tr><th>User</th><th>Role</th><th>Organization</th><th>Verification</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {data.users.map((item) => (
                <tr key={item._id}>
                  <td><b>{item.name}</b><small>{item.email}</small></td>
                  <td className="capitalize">{item.role}</td>
                  <td>{item.departmentName || item.startupProfile?.domain || "—"}</td>
                  <td><span className={`badge ${item.emailVerified ? "success" : "warning"}`}>{item.emailVerified ? "Verified" : "Pending"}</span></td>
                  <td><span className={`badge ${item.accountStatus === "active" ? "success" : item.accountStatus === "suspended" ? "danger" : "warning"}`}>{item.accountStatus}</span></td>
                  <td>{item.role === "admin" ? <span className="text-xs text-[#98a2b3]">Protected</span> : <button className={`btn ${item.accountStatus === "suspended" ? "btn-primary" : "btn-danger"}`} onClick={() => changeStatus(item)}>{item.accountStatus === "suspended" ? "Restore" : "Suspend"}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.users.length && <EmptyPanel>No accounts match these filters.</EmptyPanel>}
        </section>
      </main>
    );
  }
  if (view === "audit") return <AuditView data={data} action={action} setAction={setAction} load={load} />;
  if (view === "settings") return <SettingsView data={data} />;
  return <OperationsView view={view} data={data} />;
}

function AdminOverview({ data }) {
  const metrics = [
    ["Total users", data.metrics.totalUsers],
    ["Government users", data.metrics.governmentUsers],
    ["Registered startups", data.metrics.startups],
    ["Evaluators", data.metrics.evaluators],
    ["Challenges", data.metrics.challenges],
    ["Applications", data.metrics.applications],
    ["Pilots", data.metrics.pilots],
  ];
  return (
    <main className="page dashboard-page">
      <header className="page-head">
        <div><p className="eyebrow">Platform control centre</p><h1 className="page-title">Administration overview</h1><p className="subtitle">Monitor access, integrity and operational health across Start2Scale.</p></div>
        <span className="badge success">● All core services operational</span>
      </header>
      <div className="metrics">{metrics.map(([label, value]) => <div className="metric" key={label}><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="delta">Live platform record</div></div>)}</div>
      <div className="grid2">
        <section className="card"><div className="card-title">Recent security and platform activity</div>{data.recentActivity.map((log) => <div className="activity" key={log._id}><span className="dot" /><div><b>{log.action.replaceAll("_", " ")}</b><p className="text-[#667085]">{log.userId?.name || log.details?.email || "System"} · {new Date(log.timestamp).toLocaleString()}</p></div></div>)}{!data.recentActivity.length && <EmptyPanel>No audit events yet.</EmptyPanel>}</section>
        <section className="admin-health-card"><p className="eyebrow !text-[#90b4ff]">Governance controls</p><h2>Platform integrity at a glance</h2><div className="health-line"><span>Government domain verification</span><b>Enabled</b></div><div className="health-line"><span>Startup anti-spam controls</span><b>4 active</b></div><div className="health-line"><span>Immutable audit recording</span><b>Enabled</b></div><div className="health-line"><span>Admin self-registration</span><b>Blocked</b></div></section>
      </div>
    </main>
  );
}

function AuditView({ data, action, setAction, load }) {
  return <main className="page"><header className="page-head"><div><p className="eyebrow">Accountability</p><h1 className="page-title">Audit trail</h1><p className="subtitle">Read-only history of security and platform actions.</p></div><span className="badge blue">{data.logs.length} events</span></header><section className="card admin-toolbar"><input className="form-input" value={action} onChange={(event) => setAction(event.target.value)} placeholder="Filter by action" /><button className="btn btn-primary" onClick={load}>Apply filter</button></section><section className="card mt-5 overflow-x-auto !p-0"><table className="admin-table"><thead><tr><th>Date and time</th><th>Action</th><th>User</th><th>Role</th><th>Details</th></tr></thead><tbody>{data.logs.map((log) => <tr key={log._id}><td>{new Date(log.timestamp).toLocaleString()}</td><td><b>{log.action.replaceAll("_", " ")}</b></td><td>{log.userId?.name || log.details?.email || "System"}</td><td className="capitalize">{log.userId?.role || "—"}</td><td><code className="audit-detail">{JSON.stringify(log.details)}</code></td></tr>)}</tbody></table></section></main>;
}

function SettingsView({ data }) {
  return <main className="page"><header className="page-head"><div><p className="eyebrow">Configuration</p><h1 className="page-title">Platform settings</h1><p className="subtitle">Security and service configuration with secrets safely hidden.</p></div></header><div className="grid2"><section className="card"><div className="card-title">Government access</div><p className="subtitle mt-2">Approved email domains</p><div className="tag-list mt-4">{data.governmentEmailDomains.map((domain) => <span className="cap-tag" key={domain}>@{domain}</span>)}</div><div className="setting-row"><span>Verification mode</span><b>{data.verificationMode}</b></div><div className="setting-row"><span>Registration limit</span><b>{data.registrationLimit}</b></div></section><section className="card"><div className="card-title">AI service</div><div className="setting-row"><span>Provider</span><b>{data.aiProvider}</b></div><div className="setting-row"><span>Model</span><b>{data.aiModel}</b></div><div className="setting-row"><span>API configuration</span><span className={`badge ${data.aiConfigured ? "success" : "danger"}`}>{data.aiConfigured ? "Configured" : "Missing"}</span></div><p className="mt-4 text-xs text-[#667085]">API keys are never returned to the browser.</p></section></div><section className="card mt-5"><div className="card-title">Startup registration protection</div><div className="protection-grid">{data.startupProtection.map((item) => <div className="protection-item" key={item}><span>✓</span><b>{item}</b></div>)}</div></section></main>;
}

function OperationsView({ view, data }) {
  const content = {
    challenges: ["Challenge oversight", "Monitor challenge publication and platform quality.", [["Published challenges", data.metrics.challenges], ["Applications received", data.metrics.applications], ["Active pilots", data.metrics.pilots]]],
    ai: ["AI operations", "Monitor recommendation health without changing procurement scores.", [["Provider", "Gemini"], ["Human decision authority", "Required"], ["Match auditability", "Enabled"]]],
    templates: ["Template governance", "Standard procurement templates remain centrally controlled and auditable.", [["Standard templates", 6], ["AI-fillable templates", 2], ["Change logging", "Enabled"]]],
    analytics: ["Platform analytics", "Cross-platform adoption and procurement activity.", [["Challenges", data.metrics.challenges], ["Applications", data.metrics.applications], ["Pilots", data.metrics.pilots]]],
  }[view];
  return <main className="page"><header className="page-head"><div><p className="eyebrow">Platform operations</p><h1 className="page-title">{content[0]}</h1><p className="subtitle">{content[1]}</p></div></header><div className="metrics">{content[2].map(([label, value]) => <div className="metric" key={label}><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="delta">Platform-wide visibility</div></div>)}</div><section className="card mt-5"><div className="card-title">Administrator boundary</div><p className="subtitle mt-3 leading-6">Administrators maintain access, integrity and platform configuration. Evaluation scores, shortlisting, pilot approval, payments and procurement decisions remain controlled by authorized government roles.</p></section></main>;
}
