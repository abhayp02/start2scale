import Payment from "../models/Payment.js";
import Milestone from "../models/Milestone.js";
import Challenge from "../models/Challenge.js";
import Pilot from "../models/Pilot.js";
export async function paymentsDue(req, res) {
  try {
    const filter = { status: "pending" };
    if (req.user.role === "government") {
      const challengeIds = await Challenge.find({ createdBy: req.user._id }).distinct("_id");
      const pilotIds = await Pilot.find({ challengeId: { $in: challengeIds } }).distinct("_id");
      filter.pilotId = { $in: pilotIds };
    }
    const payments = await Payment.find(filter)
      .populate("pilotId")
      .populate("milestoneId");
    return res.json({ payments });
  } catch {
    return res.status(500).json({ message: "Failed to load payments" });
  }
}
export async function releasePayment(req, res) {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === "government") {
      const challengeIds = await Challenge.find({ createdBy: req.user._id }).distinct("_id");
      const pilotIds = await Pilot.find({ challengeId: { $in: challengeIds } }).distinct("_id");
      filter.pilotId = { $in: pilotIds };
    }
    const payment = await Payment.findOneAndUpdate(
      filter,
      { status: "released", releasedDate: new Date() },
      { new: true },
    );
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    await Milestone.findByIdAndUpdate(payment.milestoneId, {
      paymentDue: false,
      paymentStatus: "released",
    });
    return res.json({ payment });
  } catch {
    return res.status(500).json({ message: "Failed to release payment" });
  }
}
