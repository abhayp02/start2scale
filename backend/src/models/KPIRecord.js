import mongoose from "mongoose";
const schema = new mongoose.Schema({
  pilotId: { type: mongoose.Schema.Types.ObjectId, ref: "Pilot", required: true },
  kpiName: String,
  reportedValue: Number,
  source: { type: String, enum: ["startup", "officer", "citizen"], required: true },
  evidenceFile: String,
  reportedDate: { type: Date, default: Date.now },
  verificationStatus: { type: String, enum: ["unverified", "evaluator-confirmed", "disputed"], default: "unverified" },
});
export default mongoose.model("KPIRecord", schema);

