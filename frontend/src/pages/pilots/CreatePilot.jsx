import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api.js";

const emptyKpi = { name: "", target: "", unit: "" };

export default function CreatePilot() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [form, setForm] = useState({
    district: "",
    startDate: "",
    endDate: "",
  });
  const [kpis, setKpis] = useState([{ ...emptyKpi }]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/applications/${applicationId}`)
      .then((response) => setApplication(response.data.application))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message ||
            "Failed to load the shortlisted application.",
        ),
      );
  }, [applicationId]);

  function updateKpi(index, field, value) {
    setKpis((current) =>
      current.map((kpi, kpiIndex) =>
        kpiIndex === index ? { ...kpi, [field]: value } : kpi,
      ),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await api.post("/pilots", {
        applicationId,
        ...form,
        kpis: kpis.map((kpi) => ({
          ...kpi,
          target: Number(kpi.target),
        })),
      });

      navigate(`/pilots/${response.data.pilot._id}`);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to create the pilot.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Pilot authorization</p>
          <h1 className="page-title">Set up pilot program</h1>
          <p className="subtitle">
            Convert the shortlisted solution into a measurable, time-bound
            government pilot.
          </p>
        </div>
        <Link className="btn btn-secondary" to="/evaluation/eligibility">
          Cancel
        </Link>
      </header>

      {error && <div className="card mb-5 text-[#b42318]">{error}</div>}

      {application && (
        <form className="card" onSubmit={handleSubmit}>
          <div className="mb-6 rounded-lg bg-[#f5f8ff] p-4">
            <p className="eyebrow">Shortlisted solution</p>
            <h2 className="mt-2 text-lg font-bold text-[#0b1f3a]">
              {application.startupId?.name}
            </h2>
            <p className="mt-1 text-sm text-[#667085]">
              {application.challengeId?.requirements?.domain ||
                application.challengeId?.departmentName}
            </p>
          </div>

          <div className="form-grid">
            <label>
              <span className="form-label">Pilot district</span>
              <input
                className="form-input"
                required
                value={form.district}
                onChange={(event) =>
                  setForm({ ...form, district: event.target.value })
                }
                placeholder="e.g. Jaipur"
              />
            </label>
            <div></div>
            <label>
              <span className="form-label">Start date</span>
              <input
                className="form-input"
                type="date"
                required
                value={form.startDate}
                onChange={(event) =>
                  setForm({ ...form, startDate: event.target.value })
                }
              />
            </label>
            <label>
              <span className="form-label">End date</span>
              <input
                className="form-input"
                type="date"
                required
                min={form.startDate}
                value={form.endDate}
                onChange={(event) =>
                  setForm({ ...form, endDate: event.target.value })
                }
              />
            </label>
          </div>

          <div className="mt-7 border-t border-[#eaecf0] pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title">Success KPIs</h2>
                <p className="mt-1 text-xs text-[#667085]">
                  Set measurable targets that determine pilot success.
                </p>
              </div>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setKpis([...kpis, { ...emptyKpi }])}
              >
                ＋ Add KPI
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {kpis.map((kpi, index) => (
                <div
                  className="grid grid-cols-1 gap-3 rounded-lg border border-[#eaecf0] p-4 md:grid-cols-[1fr_160px_160px_auto]"
                  key={index}
                >
                  <input
                    className="form-input"
                    required
                    value={kpi.name}
                    onChange={(event) =>
                      updateKpi(index, "name", event.target.value)
                    }
                    placeholder="KPI name"
                  />
                  <input
                    className="form-input"
                    type="number"
                    required
                    value={kpi.target}
                    onChange={(event) =>
                      updateKpi(index, "target", event.target.value)
                    }
                    placeholder="Target"
                  />
                  <input
                    className="form-input"
                    required
                    value={kpi.unit}
                    onChange={(event) =>
                      updateKpi(index, "unit", event.target.value)
                    }
                    placeholder="Unit"
                  />
                  <button
                    className="btn btn-secondary"
                    type="button"
                    disabled={kpis.length === 1}
                    onClick={() =>
                      setKpis(kpis.filter((_, kpiIndex) => kpiIndex !== index))
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 flex justify-end border-t border-[#eaecf0] pt-5">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? "Creating pilot..." : "Authorize Pilot →"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
