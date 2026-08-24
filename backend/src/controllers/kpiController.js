import KPIRecord from "../models/KPIRecord.js";
import {
  deleteEvidence,
  findEvidence,
  openEvidenceStream,
  storeEvidence,
} from "../services/fileStorage.js";

export async function addKPIRecord(req, res) {
  let uploadedFileId;

  try {
    const source =
      req.user.role === "startup" ? "startup" : req.body.source || "officer";

    if (req.file) {
      uploadedFileId = await storeEvidence(req.file, req.user.id);
    }

    const record = await KPIRecord.create({
      pilotId: req.params.pilotId,
      kpiName: req.body.kpiName,
      reportedValue: Number(req.body.reportedValue),
      source,
      evidenceFile: uploadedFileId
        ? `/api/kpis/evidence/${uploadedFileId}`
        : undefined,
    });
    return res.status(201).json({ record });
  } catch (e) {
    if (uploadedFileId) await deleteEvidence(uploadedFileId);
    return res.status(400).json({ message: e.message });
  }
}

export async function listKPIRecords(req, res) {
  try {
    return res.json({
      records: await KPIRecord.find({ pilotId: req.params.pilotId }).sort({
        reportedDate: -1,
      }),
    });
  } catch {
    return res.status(500).json({ message: "Failed to load KPI records" });
  }
}

export async function downloadEvidence(req, res) {
  try {
    const file = await findEvidence(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: "Evidence file not found" });
    }

    res.setHeader(
      "Content-Type",
      file.metadata?.contentType || "application/octet-stream",
    );
    res.setHeader("Content-Length", file.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.filename.replace(/["\r\n]/g, "_")}"`,
    );

    const downloadStream = openEvidenceStream(req.params.fileId);
    downloadStream.on("error", () => {
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to download evidence file" });
      } else {
        res.destroy();
      }
    });
    return downloadStream.pipe(res);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function verifyKPIRecord(req, res) {
  try {
    const record = await KPIRecord.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: req.body.verificationStatus },
      { new: true, runValidators: true },
    );
    if (!record)
      return res.status(404).json({ message: "KPI record not found" });
    return res.json({ record });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}
