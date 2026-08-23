import { useEffect, useState } from "react";
import api from "../../services/api.js";

export default function MyChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState("");

  async function loadChallenges() {
    try {
      const response = await api.get("/challenges/mine");
      setChallenges(response.data.challenges);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load challenges.");
    }
  }

  useEffect(() => { loadChallenges(); }, []);

  async function setStatus(id, status) {
    try {
      await api.patch(`/challenges/${id}/status`, { status });
      await loadChallenges();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update challenge.");
    }
  }

  return <main className="p-4"><h1 className="mb-4 text-xl font-semibold">My Challenges</h1>{error && <p role="alert">{error}</p>}<div className="space-y-3">{challenges.map((challenge) => <article className="border p-3" key={challenge._id}><p><strong>{challenge.departmentName}</strong></p><pre className="whitespace-pre-wrap">{challenge.problemText}</pre><p>Status: {challenge.status}</p>{challenge.status === "draft" && <button className="mt-2 border px-3 py-1" onClick={() => setStatus(challenge._id, "published")}>Publish</button>}{challenge.status === "published" && <button className="mt-2 border px-3 py-1" onClick={() => setStatus(challenge._id, "closed")}>Close</button>}</article>)}</div>{!error && challenges.length === 0 && <p>No challenges created.</p>}</main>;
}

