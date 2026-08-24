import { Link } from "react-router-dom";
const flow = [
  "Challenge",
  "AI Matching",
  "Evaluation",
  "Pilot",
  "Impact",
  "Procurement",
  "Scale",
];
export default function Landing() {
  return (
    <div className="hero">
      <nav className="public-nav">
        <Link to="/welcome" className="brand !p-0 no-underline text-[#0b1f3a]">
          <span className="brand-mark text-white">S2</span>
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
        <span className="badge blue">
          ✦ AI-powered public innovation procurement
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
            Government Login →
          </Link>
          <Link className="btn btn-secondary" to="/startup/login">
            Startup Login
          </Link>
          <Link className="btn btn-secondary" to="/explore">
            Explore Challenges
          </Link>
        </div>
        <section className="card">
          <p className="eyebrow text-center">
            One connected innovation lifecycle
          </p>
          <div className="lifecycle">
            {flow.map((x, i) => (
              <div
                className={`life ${i < 2 ? "done" : ""} ${i === 2 ? "active" : ""}`}
                key={x}
              >
                <div className="life-dot">{i < 2 ? "✓" : i + 1}</div>
                {x}
              </div>
            ))}
          </div>
        </section>
        <div className="portal-grid mt-5">
          <section className="portal">
            <span className="text-2xl">🏛</span>
            <h2 className="mt-3 text-lg font-bold text-[#0b1f3a]">
              Government portal
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              Publish challenges, discover verified solutions and manage
              outcome-based pilots through procurement.
            </p>
          </section>
          <section className="portal">
            <span className="text-2xl">↗</span>
            <h2 className="mt-3 text-lg font-bold text-[#0b1f3a]">
              Startup portal
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              Get matched to relevant opportunities and prove impact through
              structured government pilots.
            </p>
          </section>
        </div>
      </main>
      <footer className="public-footer">
        <span>© 2026 Start2Scale · Government innovation procurement</span>
        <Link to="/admin/login">Admin Portal</Link>
      </footer>
    </div>
  );
}
