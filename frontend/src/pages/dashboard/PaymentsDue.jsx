import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";

export default function PaymentsDue() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/payments/due");
      setItems(response.data.payments || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to load payments.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function release(id) {
    try {
      await api.patch(`/payments/${id}/release`, {});
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Release failed.");
    }
  }

  return (
    <main className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Procurement operations</p>
          <h1 className="page-title">Payments Due</h1>
          <p className="subtitle">
            Release milestone payments after the required verification is
            complete.
          </p>
        </div>
      </header>

      {loading && <div className="card text-[#667085]">Loading payments…</div>}

      {error && <div className="card text-[#b42318]">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <section className="card text-center">
          <span className="badge success">All clear</span>
          <h2 className="mt-4 text-lg font-bold text-[#0b1f3a]">
            No payments are currently due
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#667085]">
            A payment will appear here automatically when an authorized
            evaluator or government officer verifies a payable milestone.
          </p>
          <Link className="btn btn-secondary mt-5" to="/pilots">
            View pilot programs
          </Link>
        </section>
      )}

      {items.map((x) => (
        <article className="card mt-4" key={x._id}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="badge warning">Payment pending</span>
              <h2 className="mt-3 text-lg font-bold text-[#0b1f3a]">
                {x.milestoneId?.title || "Verified milestone"}
              </h2>
              <p className="mt-1 text-sm text-[#667085]">
                {x.pilotId?.district || "Pilot program"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#0b1f3a]">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(x.amount || 0)}
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => release(x._id)}
              >
                Mark released
              </button>
            </div>
          </div>
        </article>
      ))}
    </main>
  );
}
