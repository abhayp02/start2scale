import Pilot from "../models/Pilot.js";
import Grievance from "../models/Grievance.js";
import KPIRecord from "../models/KPIRecord.js";
import Application from "../models/Application.js";
import Challenge from "../models/Challenge.js";
import Evaluation from "../models/Evaluation.js";
import { analyzeKPIProgress } from "../services/aiService.js";

export async function createPilot(req, res) {
  try {
    const { applicationId, district, kpis, startDate, endDate } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: "Application ID is required" });
    }

    const application =
      await Application.findById(applicationId).populate("challengeId");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== "shortlisted") {
      return res.status(400).json({
        message: "Only shortlisted applications can progress to a pilot",
      });
    }

    if (
      req.user.role === "government" &&
      application.challengeId.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const pilot = await Pilot.create({
      challengeId: application.challengeId._id,
      startupId: application.startupId,
      district,
      kpis,
      startDate,
      endDate,
      status: "active",
    });

    return res.status(201).json({ pilot });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A pilot already exists for this startup and challenge",
      });
    }
    return res.status(400).json({ message: error.message });
  }
}
export async function listPilots(req, res) {
  try {
    let filter = {};
    if (req.user.role === "startup") filter = { startupId: req.user._id };
    if (req.user.role === "government") {
      const challengeIds = await Challenge.find({ createdBy: req.user._id }).distinct("_id");
      filter = { challengeId: { $in: challengeIds } };
    }
    if (req.user.role === "evaluator") {
      const applicationIds = await Evaluation.find({ evaluatorId: req.user._id }).distinct("applicationId");
      const applications = await Application.find({ _id: { $in: applicationIds } })
        .select("challengeId startupId");
      filter = {
        $or: applications.map((application) => ({
          challengeId: application.challengeId,
          startupId: application.startupId,
        })),
      };
      if (!applications.length) filter = { _id: null };
    }
    const pilots = await Pilot.find(filter)
      .populate("challengeId", "departmentName problemText")
      .populate("startupId", "name");
    return res.json({ pilots });
  } catch {
    return res.status(500).json({ message: "Failed to load pilots" });
  }
}
export async function getPilot(req, res) {
  try {
    const pilot = await Pilot.findById(req.params.id)
      .populate("challengeId")
      .populate("startupId", "name email startupProfile");
    if (!pilot) return res.status(404).json({ message: "Pilot not found" });
    if (
      req.user.role === "startup" &&
      pilot.startupId._id.toString() !== req.user._id.toString()
    )
      return res.status(403).json({ message: "Access denied" });
    return res.json({ pilot });
  } catch {
    return res.status(500).json({ message: "Failed to load pilot" });
  }
}
export async function updatePilot(req, res) {
  try {
    const pilot = await Pilot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pilot) return res.status(404).json({ message: "Pilot not found" });
    return res.json({ pilot });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
export async function addGrievance(req, res) {
  try {
    const grievance = await Grievance.create({
      ...req.body,
      pilotId: req.params.id,
      loggedBy: req.user._id,
    });
    return res.status(201).json({ grievance });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
export async function listGrievances(req, res) {
  try {
    return res.json({
      grievances: await Grievance.find({ pilotId: req.params.id }).populate(
        "loggedBy",
        "name",
      ),
    });
  } catch {
    return res.status(500).json({ message: "Failed to load grievances" });
  }
}
export async function resolveGrievance(req, res) {
  try {
    const grievance = await Grievance.findByIdAndUpdate(
      req.params.grievanceId,
      { status: "resolved" },
      { new: true },
    );
    if (!grievance)
      return res.status(404).json({ message: "Grievance not found" });
    return res.json({ grievance });
  } catch {
    return res.status(500).json({ message: "Failed to resolve grievance" });
  }
}

export async function getPilotReport(req, res) {
  try {
    const pilot = await Pilot.findById(req.params.id)
      .populate("challengeId")
      .populate("startupId", "name")
      .lean();
    if (!pilot) return res.status(404).json({ message: "Pilot not found" });
    if (
      req.user.role === "startup" &&
      pilot.startupId._id.toString() !== req.user._id.toString()
    )
      return res.status(403).json({ message: "Access denied" });
    const records = await KPIRecord.find({ pilotId: pilot._id }).lean();
    const report = await analyzeKPIProgress(pilot, records);
    return res.json({ pilot, records, report });
  } catch (error) {
    return res.status(502).json({ message: error.message });
  }
}
