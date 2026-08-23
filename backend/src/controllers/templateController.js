import Template from "../models/Template.js";
import { fillTemplate } from "../services/aiService.js";

export async function listTemplates(req, res) {
  try { return res.json({ templates: await Template.find().sort({ type: 1 }) }); }
  catch { return res.status(500).json({ message: "Failed to load templates" }); }
}

export async function generateContract(req, res) {
  try {
    const { type, data } = req.body;
    if (!["pilot-agreement", "ip-data-clause"].includes(type)) return res.status(400).json({ message: "Only pilot-agreement and ip-data-clause templates can be AI-filled" });
    const template = await Template.findOne({ type });
    if (!template) return res.status(404).json({ message: "Template not found" });
    const missing = template.fields.filter((field) => data?.[field] === undefined || data[field] === "");
    if (missing.length) return res.status(400).json({ message: `Missing required field(s): ${missing.join(", ")}` });
    const content = await fillTemplate(template.content, data);
    return res.json({ type, title: template.title, content });
  } catch (error) { return res.status(502).json({ message: error.message }); }
}

