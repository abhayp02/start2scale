import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true,
  },
  evaluatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  scores: [{ criterion: String, weight: Number, score: Number }],
  totalScore: Number,
  notes: String,
});

evaluationSchema.index({ applicationId: 1, evaluatorId: 1 }, { unique: true });
export default mongoose.model("Evaluation", evaluationSchema);
