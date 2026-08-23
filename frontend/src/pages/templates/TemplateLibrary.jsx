import { useEffect, useState } from "react";
import api from "../../services/api.js";
export default function TemplateLibrary(){const [items,setItems]=useState([]);const [error,setError]=useState("");useEffect(()=>{api.get("/templates").then(r=>setItems(r.data.templates)).catch(e=>setError(e.response?.data?.message||"Failed to load templates."));},[]);return <main className="p-4"><h1 className="text-xl font-semibold">Template Library</h1>{error&&<p>{error}</p>}{items.map(t=><article className="mt-3 border p-3" key={t._id}><h2 className="font-semibold">{t.title}</h2><p>Type: {t.type}</p><p>Fields: {t.fields.join(", ")||"None"}</p><pre className="mt-2 whitespace-pre-wrap">{t.content}</pre></article>)}</main>}

