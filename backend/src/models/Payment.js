import mongoose from "mongoose";
const schema = new mongoose.Schema({
  pilotId: { type: mongoose.Schema.Types.ObjectId, ref: "Pilot", required: true },
  milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Milestone", required: true, unique: true },
  amount: Number,
  status: { type: String, enum: ["pending", "released"], default: "pending" },
  releasedDate: Date,
});
export default mongoose.model("Payment", schema);

