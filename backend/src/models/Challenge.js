import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  departmentName: { type: String, required: true },
  problemText: { type: String, required: true },
  requirements: {
    technology: String,
    domain: String,
    requiredAccuracy: String,
    deployment: String,
  },
  templateRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "published", "closed"],
    default: "draft",
  },
  aiMatchAnalysis: {
    model: String,
    generatedAt: Date,
    requirementsSnapshot: mongoose.Schema.Types.Mixed,
    analyzedCount: Number,
    candidateCount: Number,
    matches: [
      {
        startupId: String,
        startupName: String,
        matchScore: Number,
        explanation: String,
      },
    ],
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Challenge", challengeSchema);
