import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const initialForm = {
  name: "", email: "", password: "", role: "startup", departmentName: "",
  domain: "", technology: "", pastProjects: "", accuracyClaims: "",
  deploymentType: "", teamSize: "", isRegisteredEntity: false, prototypeStage: "idea-only",
};

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const details = { name: form.name, email: form.email, password: form.password, role: form.role };
    if (form.role === "government") details.departmentName = form.departmentName;
    if (form.role === "startup") {
      details.startupProfile = {
        domain: form.domain,
        technology: form.technology.split(",").map((item) => item.trim()).filter(Boolean),
        pastProjects: form.pastProjects,
        accuracyClaims: form.accuracyClaims,
        deploymentType: form.deploymentType,
        teamSize: Number(form.teamSize),
        isRegisteredEntity: form.isRegisteredEntity,
        prototypeStage: form.prototypeStage,
      };
    }
    try {
      await register(details);
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-xl p-4">
      <h1 className="mb-4 text-xl font-semibold">Register</h1>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block">Name<input className="mt-1 block w-full border p-2" name="name" required value={form.name} onChange={updateField} /></label>
        <label className="block">Email<input className="mt-1 block w-full border p-2" name="email" type="email" required value={form.email} onChange={updateField} /></label>
        <label className="block">Password<input className="mt-1 block w-full border p-2" name="password" type="password" minLength="8" required value={form.password} onChange={updateField} /></label>
        <label className="block">Role<select className="mt-1 block w-full border p-2" name="role" value={form.role} onChange={updateField}><option value="startup">Startup</option><option value="government">Government</option><option value="evaluator">Evaluator</option><option value="admin">Admin</option></select></label>
        {form.role === "government" && <label className="block">Department name<input className="mt-1 block w-full border p-2" name="departmentName" required value={form.departmentName} onChange={updateField} /></label>}
        {form.role === "startup" && (
          <fieldset className="space-y-3 border p-3">
            <legend>Startup profile</legend>
            <label className="block">Domain<input className="mt-1 block w-full border p-2" name="domain" value={form.domain} onChange={updateField} /></label>
            <label className="block">Technologies (comma-separated)<input className="mt-1 block w-full border p-2" name="technology" value={form.technology} onChange={updateField} /></label>
            <label className="block">Past projects<textarea className="mt-1 block w-full border p-2" name="pastProjects" value={form.pastProjects} onChange={updateField} /></label>
            <label className="block">Accuracy claims<textarea className="mt-1 block w-full border p-2" name="accuracyClaims" value={form.accuracyClaims} onChange={updateField} /></label>
            <label className="block">Deployment type<input className="mt-1 block w-full border p-2" name="deploymentType" value={form.deploymentType} onChange={updateField} /></label>
            <label className="block">Team size<input className="mt-1 block w-full border p-2" name="teamSize" type="number" min="0" value={form.teamSize} onChange={updateField} /></label>
            <label className="block">Prototype stage<select className="mt-1 block w-full border p-2" name="prototypeStage" value={form.prototypeStage} onChange={updateField}><option value="idea-only">Idea only</option><option value="prototype">Prototype</option><option value="deployed">Deployed</option></select></label>
            <label className="block"><input className="mr-2" name="isRegisteredEntity" type="checkbox" checked={form.isRegisteredEntity} onChange={updateField} />Registered entity</label>
          </fieldset>
        )}
        {error && <p role="alert">{error}</p>}
        <button className="border px-3 py-2" type="submit" disabled={submitting}>{submitting ? "Registering..." : "Register"}</button>
      </form>
      <p className="mt-4">Already registered? <Link className="underline" to="/login">Log in</Link></p>
    </main>
  );
}

