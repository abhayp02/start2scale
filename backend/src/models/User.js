import mongoose from "mongoose";

const startupProfileSchema = new mongoose.Schema(
  {
    domain: String,
    technology: [String],
    pastProjects: String,
    accuracyClaims: String,
    deploymentType: String,
    teamSize: Number,
    isRegisteredEntity: Boolean,
    prototypeStage: {
      type: String,
      enum: ["idea-only", "prototype", "deployed"],
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["government", "startup", "evaluator", "admin"],
    required: true,
  },
  departmentName: String,
  startupProfile: startupProfileSchema,
});

export default mongoose.model("User", userSchema);

