import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import BrandMark from "../../components/BrandMark.jsx";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "government",
  departmentName: "",
  domain: "",
  technology: "",
  pastProjects: "",
  accuracyClaims: "",
  deploymentType: "",
  teamSize: "",
  isRegisteredEntity: false,
  prototypeStage: "idea-only",
  companyRegistrationNumber: "",
  accuracyDeclaration: false,
  website: "",
};

export default function Register() {
  const { register, verifyGovernmentEmail, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const startupPortal = searchParams.get("role") === "startup";
  const [form, setForm] = useState({
    ...emptyForm,
    role: startupPortal ? "startup" : "government",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verification, setVerification] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    setForm({
      ...emptyForm,
      role: startupPortal ? "startup" : "government",
    });
    setError("");
  }, [startupPortal]);

  if (user) return <Navigate to="/dashboard" replace />;

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const details = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: startupPortal ? "startup" : form.role,
    };

    if (details.role === "government") {
      details.departmentName = form.departmentName;
    }

    if (details.role === "startup") {
      details.startupProfile = {
        domain: form.domain,
        technology: form.technology
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        pastProjects: form.pastProjects,
        accuracyClaims: form.accuracyClaims,
        deploymentType: form.deploymentType,
        teamSize: Number(form.teamSize),
        isRegisteredEntity: form.isRegisteredEntity,
        prototypeStage: form.prototypeStage,
        companyRegistrationNumber: form.companyRegistrationNumber,
      };
      details.accuracyDeclaration = form.accuracyDeclaration;
    }

    details.website = form.website;

    try {
      const result = await register(details);
      if (result.verificationRequired) {
        setVerification({ email: result.email, role: details.role });
      } else {
        navigate("/dashboard");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerification(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await verifyGovernmentEmail({
        email: verification.email,
        code: verificationCode,
      });
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  const portalName = startupPortal ? "Startup" : "Government";
  const loginPath = startupPortal ? "/startup/login" : "/government/login";

  if (verification) {
    const prefix = verification.email
      .split("@")[0]
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 3)
      .toLowerCase();
    return (
      <main className="verification-page">
        <section className="verification-card">
          <div className="verification-icon">✓</div>
          <p className="eyebrow text-center">Demo email verification</p>
          <h1 className="page-title text-center">Confirm your official email</h1>
          <p className="subtitle mt-2 text-center">
            A verification code has been generated for <b>{verification.email}</b>.
          </p>
          <div className="demo-code-note">
            <b>Prototype verification</b>
            <span>
              For the demo, enter the first three characters of your email followed
              by <code>123</code>. Your code is <strong>{prefix}123</strong>.
            </span>
          </div>
          <form onSubmit={handleVerification}>
            <label className="form-label">
              Verification code
              <input
                className="form-input verification-input mt-1"
                required
                maxLength="6"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                placeholder="abc123"
              />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="btn btn-primary mt-5 w-full !py-3" disabled={submitting}>
              {submitting ? "Verifying..." : "Verify and continue →"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`auth-page illustrated-auth-page registration-page auth-${startupPortal ? "startup" : "government"}`}
    >
      <section className="auth-brand">
        <div>
          <div className="brand !p-0">
            <BrandMark />
            <b className="brand-name">Start2Scale</b>
          </div>
          <p className="eyebrow !mt-16 !text-[#90b4ff]">
            {startupPortal
              ? "Startup opportunity portal"
              : "Government innovation workspace"}
          </p>
          <h1>
            {startupPortal
              ? "Bring your solution to public-sector challenges."
              : "Create your authorized government workspace."}
          </h1>
          <p className="mt-5 text-[#b9c7d9]">
            {startupPortal
              ? "Build a verified capability profile and receive AI-matched government opportunities."
              : "Government departments and independent evaluators receive purpose-specific access and permissions."}
          </p>
        </div>
      </section>

      <section className="auth-form-wrap !items-start overflow-y-auto py-10">
        <div className="auth-form">
          <div className="auth-tabs">
            <Link
              className={`auth-tab ${!startupPortal ? "active" : ""}`}
              to="/register?role=government"
            >
              Government
            </Link>
            <Link
              className={`auth-tab ${startupPortal ? "active" : ""}`}
              to="/register?role=startup"
            >
              Startup
            </Link>
          </div>

          <p className="eyebrow">{portalName} registration</p>
          <h1 className="page-title">Create your account</h1>
          <p className="subtitle mb-7">
            {startupPortal
              ? "Register an eligible startup or authorized representative."
              : "Register a government department user or evaluator."}
          </p>

          <form onSubmit={handleSubmit}>
            {!startupPortal && (
              <label className="mb-4 block">
                <span className="form-label">Account type</span>
                <select
                  className="form-input"
                  name="role"
                  value={form.role}
                  onChange={updateField}
                >
                  <option value="government">Government department</option>
                  <option value="evaluator">Evaluator</option>
                </select>
              </label>
            )}

            <label className="mb-4 block">
              <span className="form-label">
                {startupPortal ? "Representative name" : "Full name"}
              </span>
              <input
                className="form-input"
                name="name"
                required
                value={form.name}
                onChange={updateField}
              />
            </label>

            <label className="mb-4 block">
              <span className="form-label">
                {startupPortal ? "Official startup email" : "Official email"}
              </span>
              <input
                className="form-input"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={updateField}
              />
            </label>

            <label className="mb-4 block">
              <span className="form-label">Password</span>
              <input
                className="form-input"
                name="password"
                type="password"
                minLength="8"
                required
                value={form.password}
                onChange={updateField}
              />
              <small className="mt-1 block text-[#667085]">
                Use at least 8 characters.
              </small>
            </label>

            {!startupPortal && (
              <label className="mb-4 block">
                <span className="form-label">Department or agency name</span>
                <input
                  className="form-input"
                  name="departmentName"
                  required
                  value={form.departmentName}
                  onChange={updateField}
                  placeholder="e.g. Department of Urban Development"
                />
              </label>
            )}

            {startupPortal && (
              <fieldset className="space-y-4 rounded-xl border border-[#eaecf0] p-4">
                <legend className="px-2 text-sm font-semibold text-[#0b1f3a]">
                  Startup capability profile
                </legend>

                <label className="block">
                  <span className="form-label">Company registration number</span>
                  <input
                    className="form-input"
                    name="companyRegistrationNumber"
                    required
                    value={form.companyRegistrationNumber}
                    onChange={updateField}
                    placeholder="e.g. U72900DL2024PTC123456"
                  />
                </label>

                <label className="block">
                  <span className="form-label">Industry or domain</span>
                  <input
                    className="form-input"
                    name="domain"
                    required
                    value={form.domain}
                    onChange={updateField}
                    placeholder="e.g. Agriculture, Healthcare, Smart Cities"
                  />
                </label>

                <label className="block">
                  <span className="form-label">
                    Technologies and capabilities
                  </span>
                  <input
                    className="form-input"
                    name="technology"
                    required
                    value={form.technology}
                    onChange={updateField}
                    placeholder="AI, Computer Vision, IoT"
                  />
                </label>

                <label className="block">
                  <span className="form-label">Previous deployments</span>
                  <textarea
                    className="form-input"
                    name="pastProjects"
                    rows="3"
                    value={form.pastProjects}
                    onChange={updateField}
                  />
                </label>

                <label className="block">
                  <span className="form-label">Performance claims</span>
                  <textarea
                    className="form-input"
                    name="accuracyClaims"
                    rows="2"
                    value={form.accuracyClaims}
                    onChange={updateField}
                  />
                </label>

                <div className="form-grid">
                  <label>
                    <span className="form-label">Deployment type</span>
                    <input
                      className="form-input"
                      name="deploymentType"
                      value={form.deploymentType}
                      onChange={updateField}
                      placeholder="Cloud, on-premise..."
                    />
                  </label>
                  <label>
                    <span className="form-label">Team size</span>
                    <input
                      className="form-input"
                      name="teamSize"
                      type="number"
                      min="1"
                      required
                      value={form.teamSize}
                      onChange={updateField}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="form-label">Prototype stage</span>
                  <select
                    className="form-input"
                    name="prototypeStage"
                    value={form.prototypeStage}
                    onChange={updateField}
                  >
                    <option value="idea-only">Idea only</option>
                    <option value="prototype">Working prototype</option>
                    <option value="deployed">Deployed solution</option>
                  </select>
                </label>

                <label className="flex items-start gap-2 text-sm text-[#344054]">
                  <input
                    className="mt-1"
                    name="isRegisteredEntity"
                    type="checkbox"
                    checked={form.isRegisteredEntity}
                    onChange={updateField}
                  />
                  The startup is a legally registered entity.
                </label>
                <label className="flex items-start gap-2 text-sm text-[#344054]">
                  <input
                    className="mt-1"
                    name="accuracyDeclaration"
                    type="checkbox"
                    required
                    checked={form.accuracyDeclaration}
                    onChange={updateField}
                  />
                  I confirm that the company and capability information provided is
                  accurate and authorized.
                </label>
              </fieldset>
            )}

            <label className="honeypot" aria-hidden="true">
              Website
              <input
                name="website"
                tabIndex="-1"
                autoComplete="off"
                value={form.website}
                onChange={updateField}
              />
            </label>

            {error && (
              <p
                className="mt-4 rounded-lg bg-[#fef3f2] p-3 text-xs text-[#b42318]"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              className="btn btn-primary mt-5 w-full !py-3"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Creating account..."
                : `Create ${portalName} Account →`}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#667085]">
            Already registered?{" "}
            <Link className="font-semibold text-[#155eef]" to={loginPath}>
              Sign in
            </Link>
          </p>
          <Link
            to="/"
            className="mt-5 block text-center text-xs text-[#667085]"
          >
            ← Back to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
