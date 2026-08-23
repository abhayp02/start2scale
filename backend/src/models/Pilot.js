import mongoose from "mongoose";
const schema = new mongoose.Schema({
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true,
  },
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  district: String,
  kpis: [{ name: String, target: Number, unit: String }],
  status: {
    type: String,
    enum: ["active", "completed", "scaled", "terminated"],
    default: "active",
  },
  startDate: Date,
  endDate: Date,
});
export default mongoose.model("Pilot", schema);
