import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
export default function MilestoneTracker() {
  const { pilotId } = useParams();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const load = () =>
    api
      .get(`/milestones/pilot/${pilotId}`)
      .then((r) => setItems(r.data.milestones))
      .catch((e) => setError(e.response?.data?.message || "Failed to load."));
  useEffect(() => {
    load();
  }, [pilotId]);
  async function status(id, value) {
    try {
      await api.patch(`/milestones/${id}`, { status: value });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Update failed.");
    }
  }
  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold">Milestones</h1>
      {error && <p>{error}</p>}
      {items.map((x) => (
        <article className="mt-3 border p-3" key={x._id}>
          <p>{x.title}</p>
          <p>
            {x.status} · Payment: {x.paymentStatus}
          </p>
          <button
            className="border px-2 py-1"
            onClick={() => status(x._id, "completed")}
          >
            Complete
          </button>
          {["government", "evaluator"].includes(user.role) && (
            <button
              className="ml-2 border px-2 py-1"
              onClick={() => status(x._id, "verified")}
            >
              Verify
            </button>
          )}
        </article>
      ))}
    </main>
  );
}
