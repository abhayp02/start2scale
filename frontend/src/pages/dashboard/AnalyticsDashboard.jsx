import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../services/api.js";
export default function AnalyticsDashboard() {
  const [pilotId, setPilotId] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  async function load(e) {
    e.preventDefault();
    try {
      const r = await api.get(`/pilots/${pilotId}/report`);
      setData(r.data);
      setError("");
    } catch (x) {
      setError(x.response?.data?.message || "Report generation failed.");
    }
  }
  const chartData =
    data?.records.map((r) => ({
      name: `${r.kpiName} (${r.source})`,
      value: r.reportedValue,
    })) || [];
  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
      <form className="mt-3" onSubmit={load}>
        <input
          className="border p-2"
          value={pilotId}
          onChange={(e) => setPilotId(e.target.value)}
          placeholder="Pilot ID"
          required
        />
        <button className="ml-2 border px-3 py-2">Generate report</button>
      </form>
      {error && <p>{error}</p>}
      {data && (
        <>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#888888" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <section className="mt-4 border p-3">
            <h2 className="font-semibold">AI Evaluation</h2>
            <p>Status: {data.report.overallStatus}</p>
            <p>{data.report.summary}</p>
            <p>Recommendation: {data.report.recommendation}</p>
            <h3 className="mt-2 font-semibold">Authenticity flags</h3>
            {data.report.authenticityFlags.map((x, i) => (
              <p key={i}>
                {x.kpiName}: {x.issue}
              </p>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
