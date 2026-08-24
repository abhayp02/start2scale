import Application from "../models/Application.js";
import Challenge from "../models/Challenge.js";
import Evaluation from "../models/Evaluation.js";
import Payment from "../models/Payment.js";
import Pilot from "../models/Pilot.js";

export async function dashboardSummary(req, res) {
  try {
    if (req.user.role === "government") {
      const challengeIds = await Challenge.find({ createdBy: req.user._id }).distinct("_id");
      const pilotIds = await Pilot.find({ challengeId: { $in: challengeIds } }).distinct("_id");
      const [activeChallenges, applications, activePilots, scaledPilots, payments] =
        await Promise.all([
          Challenge.countDocuments({ _id: { $in: challengeIds }, status: "published" }),
          Application.countDocuments({ challengeId: { $in: challengeIds } }),
          Pilot.countDocuments({ _id: { $in: pilotIds }, status: "active" }),
          Pilot.countDocuments({ _id: { $in: pilotIds }, status: "scaled" }),
          Payment.find({ pilotId: { $in: pilotIds }, status: "pending" }).select("amount"),
        ]);
      return res.json({
        metrics: {
          activeChallenges,
          applications,
          aiMatches: 0,
          activePilots,
          procurementPipeline: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
          scaledPilots,
          estimatedImpact: 0,
        },
      });
    }

    if (req.user.role === "startup") {
      const profileDomain = req.user.startupProfile?.domain;
      const recommendationFilter = {
        status: "published",
        ...(profileDomain
          ? { "requirements.domain": { $regex: profileDomain, $options: "i" } }
          : {}),
      };
      const pilotIds = await Pilot.find({ startupId: req.user._id }).distinct("_id");
      const [recommended, activeApplications, shortlisted, activePilots, contracts, opportunities] =
        await Promise.all([
          Challenge.countDocuments(recommendationFilter),
          Application.countDocuments({ startupId: req.user._id, status: { $in: ["submitted", "eligible"] } }),
          Application.countDocuments({ startupId: req.user._id, status: "shortlisted" }),
          Pilot.countDocuments({ _id: { $in: pilotIds }, status: "active" }),
          Pilot.countDocuments({ _id: { $in: pilotIds }, status: { $in: ["completed", "scaled"] } }),
          Challenge.countDocuments({ status: "published" }),
        ]);
      return res.json({
        metrics: { recommended, activeApplications, shortlisted, activePilots, contracts, opportunities },
      });
    }

    if (req.user.role === "evaluator") {
      const [assigned, pending, submitted, declined] = await Promise.all([
        Evaluation.countDocuments({ evaluatorId: req.user._id }),
        Evaluation.countDocuments({ evaluatorId: req.user._id, status: "assigned" }),
        Evaluation.countDocuments({ evaluatorId: req.user._id, status: "submitted" }),
        Evaluation.countDocuments({ evaluatorId: req.user._id, status: "declined" }),
      ]);
      return res.json({ metrics: { assigned, pending, submitted, declined } });
    }

    return res.status(403).json({ message: "Dashboard is not available for this role" });
  } catch {
    return res.status(500).json({ message: "Failed to load dashboard" });
  }
}
