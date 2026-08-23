import Payment from "../models/Payment.js";
import Milestone from "../models/Milestone.js";
export async function paymentsDue(req, res) { try { const payments = await Payment.find({ status: "pending" }).populate("pilotId").populate("milestoneId"); return res.json({ payments }); } catch { return res.status(500).json({ message: "Failed to load payments" }); } }
export async function releasePayment(req, res) { try { const payment = await Payment.findByIdAndUpdate(req.params.id, { status: "released", releasedDate: new Date() }, { new: true }); if (!payment) return res.status(404).json({ message: "Payment not found" }); await Milestone.findByIdAndUpdate(payment.milestoneId, { paymentDue: false, paymentStatus: "released" }); return res.json({ payment }); } catch { return res.status(500).json({ message: "Failed to release payment" }); } }

