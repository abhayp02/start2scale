import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api.js";
export default function KPIUpdate() {
  const { pilotId } = useParams();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [source, setSource] = useState("officer");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  async function submit(e) {
    e.preventDefault();
    const data = new FormData();
    data.append("kpiName", name);
    data.append("reportedValue", value);
    data.append("source", source);
    if (file) data.append("evidence", file);
    try {
      await api.upload(`/kpis/pilot/${pilotId}`, data);
      setMessage("KPI update saved.");
    } catch (x) {
      setMessage(x.response?.data?.message || "Upload failed.");
    }
  }
  return (
    <main className="max-w-md p-4">
      <h1 className="text-xl font-semibold">KPI Update</h1>
      <form className="mt-3 space-y-3" onSubmit={submit}>
        <input
          className="block w-full border p-2"
          placeholder="KPI name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="block w-full border p-2"
          type="number"
          placeholder="Reported value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
        <select
          className="block w-full border p-2"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="officer">Officer</option>
          <option value="citizen">Citizen</option>
        </select>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button className="border px-3 py-2">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
