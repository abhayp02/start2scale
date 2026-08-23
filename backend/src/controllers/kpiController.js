import KPIRecord from "../models/KPIRecord.js";
export async function addKPIRecord(req, res) {
  try {
    const source = req.user.role === "startup" ? "startup" : (req.body.source || "officer");
    const record = await KPIRecord.create({ pilotId: req.params.pilotId, kpiName: req.body.kpiName, reportedValue: Number(req.body.reportedValue), source, evidenceFile: req.file ? `/uploads/${req.file.filename}` : undefined });
    return res.status(201).json({ record });
  } catch (e) { return res.status(400).json({ message: e.message }); }
}
export async function listKPIRecords(req, res) { try { return res.json({ records: await KPIRecord.find({ pilotId: req.params.pilotId }).sort({ reportedDate: -1 }) }); } catch { return res.status(500).json({ message: "Failed to load KPI records" }); } }
export async function verifyKPIRecord(req, res) { try { const record = await KPIRecord.findByIdAndUpdate(req.params.id, { verificationStatus: req.body.verificationStatus }, { new: true, runValidators: true }); if (!record) return res.status(404).json({ message: "KPI record not found" }); return res.json({ record }); } catch (e) { return res.status(400).json({ message: e.message }); } }

