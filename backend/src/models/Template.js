import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "problem-statement",
      "evaluation-rubric",
      "pilot-agreement",
      "ip-data-clause",
      "cybersecurity-checklist",
      "risk-register",
    ],
    required: true,
    unique: true,
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  fields: [String],
});

export default mongoose.model("Template", templateSchema);

