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
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["assigned", "submitted", "declined"],
    default: "assigned",
  },
  assignedAt: { type: Date, default: Date.now },
  dueDate: Date,
  instructions: String,
  conflictDeclared: { type: Boolean, default: false },
  conflictDetails: String,
  submittedAt: Date,
  scores: [{ criterion: String, weight: Number, score: Number }],
  totalScore: Number,
  notes: String,
});

evaluationSchema.index({ applicationId: 1, evaluatorId: 1 }, { unique: true });
export default mongoose.model("Evaluation", evaluationSchema);
