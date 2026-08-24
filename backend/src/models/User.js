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
    companyRegistrationNumber: {
      type: String,
      trim: true,
    },
    profileStatus: {
      type: String,
      enum: ["profile-incomplete", "active", "restricted", "suspended"],
      default: "active",
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
  emailVerified: {
    type: Boolean,
    default: false,
  },
  accountStatus: {
    type: String,
    enum: ["pending-verification", "active", "suspended"],
    default: "active",
  },
  verificationCodeHash: String,
  verificationExpiresAt: Date,
  lastLoginAt: Date,
});

userSchema.index(
  { "startupProfile.companyRegistrationNumber": 1 },
  { unique: true, sparse: true },
);

export default mongoose.model("User", userSchema);
