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
    productDescription: String,
    capabilityTags: [String],
    industriesServed: [String],
    certifications: [String],
    previousDeployments: [String],
    governmentProjects: [String],
    customerBase: String,
    impactMetrics: [String],
    fundingStage: String,
    integrationCapabilities: [String],
    securityCompliance: [String],
    geographicAvailability: [String],
    pilotBudgetMin: Number,
    pilotBudgetMax: Number,
    implementationWeeks: Number,
  },
  { _id: false },
);

const governmentProfileSchema = new mongoose.Schema(
  {
    organizationType: String,
    ministry: String,
    jurisdiction: String,
    contactDesignation: String,
    procurementFocus: [String],
    activePrograms: [String],
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
  governmentProfile: governmentProfileSchema,
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
