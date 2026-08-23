import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api.js";
export default function Apply() {
  const { challengeId } = useParams(); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function submit() { try { await api.post(`/applications/challenge/${challengeId}`, {}); setMessage("Application submitted."); setError(""); } catch (e) { setError(e.response?.data?.message || "Submission failed."); } }
  return <main className="p-4"><h1 className="text-xl font-semibold">Apply</h1><p>Submit your startup profile for this challenge.</p><button className="mt-3 border px-3 py-2" onClick={submit}>Submit application</button>{message && <p>{message}</p>}{error && <p role="alert">{error}</p>}</main>;
}

