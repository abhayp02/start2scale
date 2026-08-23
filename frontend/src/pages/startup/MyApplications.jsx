import { useEffect, useState } from "react";
import api from "../../services/api.js";
export default function MyApplications() {
  const [items, setItems] = useState([]); const [error, setError] = useState("");
  useEffect(() => { api.get("/applications/mine").then((r) => setItems(r.data.applications)).catch((e) => setError(e.response?.data?.message || "Failed to load.")); }, []);
  return <main className="p-4"><h1 className="mb-4 text-xl font-semibold">My Applications</h1>{error && <p>{error}</p>}{items.map((item) => <article className="mb-3 border p-3" key={item._id}><p>{item.challengeId?.departmentName}</p><p>Status: {item.status}</p></article>)}</main>;
}

