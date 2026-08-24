import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import BrandMark from "./BrandMark.jsx";
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
  ["Assigned Applications", "/evaluation/score"],
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

const navSymbols = {
  Overview: "⌂",
  Challenges: "◇",
  "Discover Challenges": "◇",
  "AI Solution Matching": "✦",
  "AI Recommendations": "✦",
  "AI Operations": "✦",
  Applications: "▤",
  "My Applications": "▤",
  "Assigned Applications": "▤",
  Evaluation: "✓",
  Evaluations: "✓",
  Evaluators: "✓",
  "Pilot Programs": "◉",
  Procurement: "▣",
  Contracts: "▣",
  Payments: "₹",
  "Scale-Up": "↗",
  Performance: "▥",
  Analytics: "▥",
  Reports: "▧",
  "Audit Trail": "◷",
  Notifications: "◌",
  Settings: "⚙",
  "Platform Settings": "⚙",
  Documents: "▱",
  "Company Profile": "◎",
  Users: "♙",
  "Government Organizations": "◆",
  Startups: "△",
  Templates: "▦",
};

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const items =
    user.role === "admin"
      ? admin
      : user.role === "startup"
      ? startup
      : user.role === "evaluator"
        ? evaluator
        : gov;
  return (
    <div className={`shell role-${user.role}`}>
      <aside className="sidebar">
        <div className="brand">
          <BrandMark />
          <span>
            <b className="brand-name block">Start2Scale</b>
            <small className="text-[#9fb0c8]">
              {user.role === "admin" ? "Administration" : "Innovation Procurement"}
            </small>
          </span>
        </div>
        <nav className="side-nav">
          <span className="nav-section-label">Workspace</span>
          {items.map(([n, p]) => (
            <NavLink
              end={p === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              to={p}
              key={n}
            >
              <span className="nav-symbol">{navSymbols[n] || "·"}</span>
              <span>{n}</span>
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
          <div className="mobile-brand">
            <BrandMark compact />
            <b>Start2Scale</b>
          </div>
          <div className="topbar-context">
            <div className="search">
              <span>⌕</span>
              <span>Search challenges, startups or pilots...</span>
              <kbd>⌘ K</kbd>
            </div>
            <span className="route-context">
              {items.find(([, path]) => location.pathname.startsWith(path))?.[0] || "Workspace"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge success">● System operational</span>
            <span className="role-chip">{user.role}</span>
            <NavLink to="/notifications" aria-label="Notifications">
              ♢
            </NavLink>
            <span className="avatar">{user.name?.[0]}</span>
          </div>
        </header>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {items.slice(0, 5).map(([name, path]) => (
            <NavLink
              className={({ isActive }) => (isActive ? "active" : "")}
              end={path === "/dashboard" || path === "/admin"}
              key={name}
              to={path}
            >
              {name}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
    </div>
  );
}
