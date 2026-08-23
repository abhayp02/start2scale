import { useState } from "react";
import api from "../../services/api.js";
export default function EligibilityCheck() {
  const [applicationId, setApplicationId] = useState(""); const [result, setResult] = useState(null); const [error, setError] = useState("");
  async function check(e) { e.preventDefault(); try { const r = await api.patch(`/applications/${applicationId}/eligibility`, {}); setResult(r.data.application); setError(""); } catch (x) { setError(x.response?.data?.message || "Check failed."); } }
  return <main className="p-4"><h1 className="text-xl font-semibold">Eligibility Check</h1><form className="mt-3" onSubmit={check}><input className="border p-2" value={applicationId} onChange={(e) => setApplicationId(e.target.value)} placeholder="Application ID" required /><button className="ml-2 border px-3 py-2">Check</button></form>{result && <pre className="mt-3 whitespace-pre-wrap">{JSON.stringify(result.eligibility, null, 2)}</pre>}{error && <p>{error}</p>}</main>;
}

