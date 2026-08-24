import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark.jsx";
const flow = [
  { name: "Challenge", symbol: "◇", detail: "Define the public need" },
  { name: "AI Matching", symbol: "✦", detail: "Discover relevant solutions" },
  { name: "Evaluation", symbol: "✓", detail: "Review evidence and fit" },
  { name: "Pilot", symbol: "◉", detail: "Validate in the field" },
  { name: "Impact", symbol: "↗", detail: "Measure public outcomes" },
  { name: "Procurement", symbol: "▣", detail: "Formalize the solution" },
  { name: "Scale", symbol: "◎", detail: "Expand proven impact" },
];
export default function Landing() {
  return (
    <div className="hero">
      <nav className="public-nav">
        <Link to="/welcome" className="brand !p-0 no-underline text-[#0b1f3a]">
          <BrandMark />
          <b className="brand-name">Start2Scale</b>
        </Link>
        <div className="flex gap-3">
          <Link className="btn btn-secondary" to="/government/login">
            Government Login
          </Link>
          <Link className="btn btn-primary" to="/startup/login">
            Startup Login
          </Link>
        </div>
      </nav>
      <main className="hero-body">
        <div className="hero-copy-column">
          <span className="badge blue">
            <i className="pulse-dot" /> AI-powered public innovation procurement
          </span>
          <h1>
            From Government Challenges to <span>Scalable Innovation</span>
          </h1>
          <p className="hero-copy">
            Connect government challenges with innovative startup solutions
            through AI-powered discovery, pilot programs and outcome-driven
            procurement.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/government/login">
              Government Login <span>→</span>
            </Link>
            <Link className="btn btn-secondary" to="/startup/login">
              Startup Login
            </Link>
            <Link className="hero-text-link" to="/explore">
              Explore live challenges →
            </Link>
          </div>
          <div className="trust-row">
            <span><b>AI-assisted</b> discovery</span>
            <span><b>Human-led</b> decisions</span>
            <span><b>Auditable</b> lifecycle</span>
          </div>
        </div>
        <div className="hero-visual" role="img" aria-label="Government innovation connected to startup solutions">
          <div className="hero-float-card match-float"><small>TOP AI MATCH</small><b>92%</b><span>High confidence</span></div>
          <div className="hero-float-card impact-float"><small>PUBLIC IMPACT</small><b>2.4M</b><span>Projected citizens</span></div>
        </div>
        <section className="card lifecycle-overview">
          <div className="lifecycle-heading">
            <p className="eyebrow">One connected innovation lifecycle</p>
            <p>
              Every government challenge moves through seven connected stages.
            </p>
          </div>
          <div className="lifecycle lifecycle-informational">
            {flow.map((stage, i) => (
              <div className="life" key={stage.name}>
                <span className="stage-number">0{i + 1}</span>
                <div className="life-dot">{stage.symbol}</div>
                <span className="stage-name">{stage.name}</span>
                <small>{stage.detail}</small>
                {i < flow.length - 1 && (
                  <span className="life-connector" aria-hidden="true">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="lifecycle-note">
            AI assists discovery and analysis; authorized officials retain every decision.
          </p>
        </section>
        <div className="portal-grid mt-5">
          <section className="portal">
            <span className="portal-icon government-icon">⌂</span>
            <h2 className="mt-3 text-lg font-bold text-[#0b1f3a]">
              Government portal
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              Publish challenges, discover verified solutions and manage
              outcome-based pilots through procurement.
            </p>
            <Link to="/government/login">Enter government workspace →</Link>
          </section>
          <section className="portal startup-portal">
            <span className="portal-icon startup-icon">↗</span>
            <h2 className="mt-3 text-lg font-bold text-[#0b1f3a]">
              Startup portal
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              Get matched to relevant opportunities and prove impact through
              structured government pilots.
            </p>
            <Link to="/startup/login">Enter startup workspace →</Link>
          </section>
        </div>
      </main>
      <footer className="public-footer">
        <div><b>Start2Scale</b><span>Secure, transparent innovation procurement<br/> Made By Team @Kaustubh💎</span></div>
        <Link className="admin-portal-link" to="/admin/login">
          <span className="admin-link-icon">◇</span>
          <span><small>RESTRICTED ACCESS</small><b>Platform Admin</b></span>
          <i>→</i>
        </Link>
      </footer>
    </div>
  );
}
