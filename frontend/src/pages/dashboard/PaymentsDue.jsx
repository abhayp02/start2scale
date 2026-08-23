import { useEffect, useState } from "react";
import api from "../../services/api.js";
export default function PaymentsDue() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const load = () =>
    api
      .get("/payments/due")
      .then((r) => setItems(r.data.payments))
      .catch((e) => setError(e.response?.data?.message || "Failed to load."));
  useEffect(load, []);
  async function release(id) {
    try {
      await api.patch(`/payments/${id}/release`, {});
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Release failed.");
    }
  }
  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold">Payments Due</h1>
      {error && <p>{error}</p>}
      {items.map((x) => (
        <article className="mt-3 border p-3" key={x._id}>
          <p>
            {x.milestoneId?.title}: INR {x.amount}
          </p>
          <button className="border px-3 py-1" onClick={() => release(x._id)}>
            Mark released
          </button>
        </article>
      ))}
    </main>
  );
}
