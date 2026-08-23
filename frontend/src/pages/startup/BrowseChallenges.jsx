import { useEffect, useState } from "react";
import api from "../../services/api.js";

export default function BrowseChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/challenges")
      .then((response) => setChallenges(response.data.challenges))
      .catch((requestError) => setError(requestError.response?.data?.message || "Failed to load challenges."));
  }, []);

  return <main className="p-4"><h1 className="mb-4 text-xl font-semibold">Browse Challenges</h1>{error && <p role="alert">{error}</p>}<div className="space-y-3">{challenges.map((challenge) => <article className="border p-3" key={challenge._id}><p><strong>{challenge.departmentName}</strong></p><pre className="whitespace-pre-wrap">{challenge.problemText}</pre></article>)}</div>{!error && challenges.length === 0 && <p>No published challenges.</p>}</main>;
}

