import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true },
  startupId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eligibility: {
    registered: Boolean,
    sectorMatch: Boolean,
    hasWorkingPrototype: Boolean,
    eligible: Boolean,
  },
  status: { type: String, enum: ["submitted", "eligible", "rejected", "shortlisted"], default: "submitted" },
});

applicationSchema.index({ challengeId: 1, startupId: 1 }, { unique: true });
export default mongoose.model("Application", applicationSchema);

