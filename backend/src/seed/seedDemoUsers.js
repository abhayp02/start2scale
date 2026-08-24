import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import User from "../models/User.js";

dotenv.config({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
});

const DEMO_PASSWORD = "Demo@1234";

const demoUsers = [
  {
    name: "Procurement Officer",
    email: "procurement@scale2start.gov.in",
    role: "government",
    departmentName: "Department of Urban Development",
    governmentProfile: {
      organizationType: "State Government Department",
      ministry: "Urban Development",
      jurisdiction: "Statewide urban local bodies",
      contactDesignation: "Procurement Officer",
      procurementFocus: ["Smart Cities", "Waste Management", "Urban Mobility", "Citizen Services"],
      activePrograms: ["Smart Waste Management", "Municipal Digital Transformation"],
    },
  },
  {
    name: "Agriculture Innovation Officer",
    email: "innovation@agriculture.gov.in",
    role: "government",
    departmentName: "Department of Agriculture",
    governmentProfile: {
      organizationType: "State Government Department",
      ministry: "Agriculture and Farmer Welfare",
      jurisdiction: "Statewide rural and agricultural programs",
      contactDesignation: "Innovation Officer",
      procurementFocus: ["Precision Agriculture", "Farmer Advisory", "Crop Monitoring"],
      activePrograms: ["Digital Agriculture Mission", "Farmer Service Modernization"],
    },
  },
  {
    name: "Health Procurement Officer",
    email: "procurement@health.gov.in",
    role: "government",
    departmentName: "Department of Health",
    governmentProfile: {
      organizationType: "State Government Department",
      ministry: "Health and Family Welfare",
      jurisdiction: "Public hospitals and primary health centres",
      contactDesignation: "Procurement Officer",
      procurementFocus: ["Digital Health", "Telemedicine", "Hospital Automation"],
      activePrograms: ["District Health Digitization", "Connected Primary Care"],
    },
  },
  {
    name: "Ananya Mehta",
    email: "ananya.evaluator@scale2start.gov.in",
    role: "evaluator",
    departmentName: "Department of Urban Development",
  },
  {
    name: "Rohan Verma",
    email: "rohan.evaluator@scale2start.gov.in",
    role: "evaluator",
    departmentName: "Department of Urban Development",
  },
  {
    name: "Meera Iyer",
    email: "meera.evaluator@agriculture.gov.in",
    role: "evaluator",
    departmentName: "Department of Agriculture",
  },
  {
    name: "Dr Arjun Rao",
    email: "arjun.evaluator@health.gov.in",
    role: "evaluator",
    departmentName: "Department of Health",
  },
];

export default async function seedDemoUsers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const user of demoUsers) {
    await User.findOneAndUpdate(
      { email: user.email },
      {
        ...user,
        passwordHash,
        emailVerified: true,
        accountStatus: "active",
      },
      { upsert: true, new: true, runValidators: true },
    );
  }

  console.log(
    `Seeded ${demoUsers.length} government and evaluator demo users. Password for all: ${DEMO_PASSWORD}`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(seedDemoUsers)
    .then(() => mongoose.disconnect())
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
