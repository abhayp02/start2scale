import Milestone from "../models/Milestone.js";
import Payment from "../models/Payment.js";
export async function listMilestones(req, res) { try { return res.json({ milestones: await Milestone.find({ pilotId: req.params.pilotId }).sort({ dueDate: 1 }) }); } catch { return res.status(500).json({ message: "Failed to load milestones" }); } }
export async function createMilestone(req, res) { try { const milestone = await Milestone.create({ ...req.body, pilotId: req.params.pilotId }); return res.status(201).json({ milestone }); } catch (e) { return res.status(400).json({ message: e.message }); } }
export async function updateMilestone(req, res) {
  try {
    const milestone = await Milestone.findById(req.params.id); if (!milestone) return res.status(404).json({ message: "Milestone not found" });
    if (req.body.status === "verified" && !["government", "evaluator"].includes(req.user.role)) return res.status(403).json({ message: "Only government or evaluator users can verify milestones" });
    if (req.body.status) milestone.status = req.body.status;
    if (req.body.status === "verified") {
      milestone.paymentDue = true; milestone.paymentStatus = "due";
      await Payment.findOneAndUpdate({ milestoneId: milestone._id }, { pilotId: milestone.pilotId, milestoneId: milestone._id, amount: milestone.paymentAmount, status: "pending" }, { upsert: true, new: true });
    }
    await milestone.save(); return res.json({ milestone });
  } catch (e) { return res.status(400).json({ message: e.message }); }
}

