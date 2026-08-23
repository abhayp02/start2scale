import Application from "../models/Application.js";
import Challenge from "../models/Challenge.js";
import { checkEligibility } from "../middleware/eligibility.js";

export async function apply(req, res) {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.challengeId, status: "published" });
    if (!challenge) return res.status(404).json({ message: "Published challenge not found" });
    const application = await Application.create({ challengeId: challenge._id, startupId: req.user._id });
    return res.status(201).json({ application });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You have already applied to this challenge" });
    return res.status(500).json({ message: "Failed to submit application" });
  }
}

export async function myApplications(req, res) {
  try {
    const applications = await Application.find({ startupId: req.user._id }).populate("challengeId").sort({ _id: -1 });
    return res.json({ applications });
  } catch { return res.status(500).json({ message: "Failed to load applications" }); }
}

export async function challengeApplications(req, res) {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.challengeId, createdBy: req.user._id });
    if (!challenge && req.user.role === "government") return res.status(404).json({ message: "Challenge not found" });
    const applications = await Application.find({ challengeId: req.params.challengeId }).populate("startupId", "name email startupProfile");
    return res.json({ applications });
  } catch { return res.status(500).json({ message: "Failed to load applications" }); }
}

export async function runEligibility(req, res) {
  try {
    const application = await Application.findById(req.params.id).populate("startupId").populate("challengeId");
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (req.user.role === "government" && application.challengeId.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Access denied" });
    application.eligibility = checkEligibility(application.startupId, application.challengeId);
    application.status = application.eligibility.eligible ? "eligible" : "rejected";
    await application.save();
    return res.json({ application });
  } catch { return res.status(500).json({ message: "Eligibility check failed" }); }
}

export async function shortlist(req, res) {
  try {
    const application = await Application.findById(req.params.id).populate("challengeId");
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (req.user.role === "government" && application.challengeId.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Access denied" });
    if (application.status !== "eligible") return res.status(400).json({ message: "Only eligible applications can be shortlisted" });
    application.status = "shortlisted";
    await application.save();
    return res.json({ application });
  } catch { return res.status(500).json({ message: "Failed to shortlist application" }); }
}

