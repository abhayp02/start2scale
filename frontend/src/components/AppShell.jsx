import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
const gov = [
  ["Overview", "/dashboard"],
  ["Challenges", "/department/challenges"],
  ["AI Solution Matching", "/matching"],
  ["Applications", "/evaluation/eligibility"],
  ["Evaluation", "/reports"],
  ["Pilot Programs", "/pilots"],
  ["Procurement", "/payments"],
  ["Scale-Up", "/scale-up"],
  ["Analytics", "/analytics"],
  ["Reports", "/reports"],
  ["Audit Trail", "/audit"],
  ["Notifications", "/notifications"],
  ["Settings", "/settings"],
];
const startup = [
  ["Overview", "/dashboard"],
  ["Discover Challenges", "/challenges"],
  ["AI Recommendations", "/recommendations"],
  ["My Applications", "/applications"],
  ["Evaluations", "/evaluation-status"],
  ["Pilot Programs", "/pilots"],
  ["Contracts", "/templates"],
  ["Payments", "/payments-status"],
  ["Performance", "/analytics"],
  ["Documents", "/documents"],
  ["Company Profile", "/company-profile"],
];
const evaluator = [
  ["Overview", "/dashboard"],
  ["Applications", "/evaluation/eligibility"],
  ["Evaluation", "/evaluation/score"],
  ["Pilot Programs", "/pilots"],
  ["Analytics", "/analytics"],
  ["Reports", "/reports"],
  ["Notifications", "/notifications"],
];
const admin = [
  ["Overview", "/admin"],
  ["Users", "/admin/users"],
  ["Government Organizations", "/admin/government"],
  ["Startups", "/admin/startups"],
  ["Evaluators", "/admin/evaluators"],
  ["Challenges", "/admin/challenges"],
  ["AI Operations", "/admin/ai"],
  ["Templates", "/admin/templates"],
  ["Analytics", "/admin/analytics"],
  ["Audit Trail", "/admin/audit"],
  ["Platform Settings", "/admin/settings"],
];
export default function AppShell() {
  const { user, logout } = useAuth();
  const items =
    user.role === "admin"
      ? admin
      : user.role === "startup"
      ? startup
      : user.role === "evaluator"
        ? evaluator
        : gov;
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">S2</span>
          <span>
            <b className="brand-name block">Start2Scale</b>
            <small className="text-[#9fb0c8]">
              {user.role === "admin" ? "Administration" : "Innovation Procurement"}
            </small>
          </span>
        </div>
        <nav className="side-nav">
          {items.map(([n, p], i) => (
            <NavLink
              end={p === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              to={p}
              key={n}
            >
              <span>
                {
                  [
                    "⌂",
                    "◇",
                    "✦",
                    "▤",
                    "✓",
                    "◉",
                    "▣",
                    "↗",
                    "▥",
                    "▧",
                    "◷",
                    "◌",
                    "⚙",
                  ][i]
                }
              </span>
              {n}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <span className="avatar">{user.name?.[0]}</span>
          <span className="min-w-0 flex-1">
            <b className="block truncate text-xs">{user.name}</b>
            <small className="text-[#9fb0c8]">
              {user.departmentName || user.role}
            </small>
          </span>
          <button onClick={logout} aria-label="Log out">
            ↪
          </button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="search">
            ⌕ &nbsp; Search challenges, startups or pilots...
          </div>
          <div className="flex items-center gap-3">
            <span className="badge success">● System operational</span>
            <NavLink to="/notifications" aria-label="Notifications">
              ♢
            </NavLink>
            <span className="avatar">{user.name?.[0]}</span>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
