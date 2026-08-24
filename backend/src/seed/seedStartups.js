import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
});

const DEMO_PASSWORD = "Demo@1234";
const startups = [
  [
    "BhuLekh AI",
    "contact@bhulekhai.demo",
    "Land Records",
    ["OCR", "Document AI", "Handwriting Recognition"],
    "Digitized mutation registers for 2 district revenue offices",
    "96% OCR extraction accuracy on printed records",
    "On-premise",
    18,
    true,
    "deployed",
  ],
  [
    "RecordSetu",
    "hello@recordsetu.demo",
    "Land Records",
    ["OCR", "NLP"],
    "Piloted survey map digitization with a state GIS cell",
    "89% accuracy on handwritten registers",
    "Cloud",
    9,
    true,
    "prototype",
  ],
  [
    "AgriVision AI",
    "team@agrivision.demo",
    "Agriculture",
    ["Computer Vision", "IoT"],
    "Crop disease detection deployed for 3 state agri departments",
    "92% disease detection accuracy",
    "Mobile + Web",
    12,
    true,
    "deployed",
  ],
  [
    "KrishiSense",
    "info@krishisense.demo",
    "Agriculture",
    ["Satellite Imagery", "Machine Learning"],
    "Yield prediction pilot with a district agri office",
    "85% yield prediction accuracy",
    "Web",
    6,
    true,
    "prototype",
  ],
  [
    "FarmMitra",
    "connect@farmmitra.demo",
    "Agriculture",
    ["Chatbot", "NLP", "IVR"],
    "Farmer advisory helpline for 2 states, 50,000+ calls handled",
    "Not accuracy-based (advisory service)",
    "IVR + Mobile",
    15,
    true,
    "deployed",
  ],
  [
    "MediScribe AI",
    "contact@mediscribe.demo",
    "Healthcare",
    ["ASR", "Clinical NLP"],
    "Voice-based patient intake pilot at 1 district hospital",
    "90% transcription accuracy across 4 Indian languages",
    "On-premise",
    10,
    true,
    "prototype",
  ],
  [
    "ArogyaLink",
    "team@arogyalink.demo",
    "Healthcare",
    ["OCR", "FHIR Integration"],
    "Digitized discharge summaries for a state health department",
    "88% structured extraction accuracy",
    "Cloud",
    8,
    true,
    "deployed",
  ],
  [
    "SwasthyaKiosk",
    "hello@swasthyakiosk.demo",
    "Healthcare",
    ["Touchscreen Kiosk", "ASR"],
    "Idea-stage, no deployed pilots yet",
    "Not yet benchmarked",
    "Kiosk (offline-capable)",
    4,
    true,
    "idea-only",
  ],
  [
    "UrbanPulse Analytics",
    "info@urbanpulse.demo",
    "Urban Governance",
    ["Computer Vision", "IoT Sensors"],
    "Traffic congestion monitoring pilot in 1 municipal corporation",
    "91% vehicle count accuracy",
    "Edge + Cloud",
    14,
    true,
    "deployed",
  ],
  [
    "CivicVoice",
    "team@civicvoice.demo",
    "Urban Governance",
    ["NLP", "Grievance Analytics"],
    "Grievance categorization tool piloted with 1 municipal corporation",
    "82% correct grievance category classification",
    "Web",
    7,
    true,
    "prototype",
  ],
  [
    "JalRakshak",
    "contact@jalrakshak.demo",
    "Water Resources",
    ["IoT Sensors", "Predictive Analytics"],
    "Groundwater level monitoring for 1 district irrigation department",
    "93% leak detection accuracy",
    "Edge + Cloud",
    11,
    true,
    "deployed",
  ],
  [
    "ShikshaTrack",
    "hello@shikshatrack.demo",
    "Education",
    ["Computer Vision", "Attendance Analytics"],
    "Automated attendance pilot across 20 government schools",
    "95% facial-recognition attendance accuracy",
    "On-premise (school-level)",
    9,
    true,
    "deployed",
  ],
  [
    "PathshalaAI",
    "team@pathshalaai.demo",
    "Education",
    ["NLP", "Adaptive Learning"],
    "Regional-language learning app tested with 500 students",
    "Not accuracy-based (learning outcomes tracked separately)",
    "Mobile",
    13,
    true,
    "prototype",
  ],
  [
    "TransportIQ",
    "info@transportiq.demo",
    "Transport",
    ["GPS Analytics", "Route Optimization"],
    "Bus route optimization pilot for 1 state transport corporation",
    "18% average reduction in idle time (pilot result)",
    "Cloud",
    10,
    true,
    "deployed",
  ],
  [
    "GreenGrid Solutions",
    "contact@greengrid.demo",
    "Energy",
    ["IoT", "Predictive Maintenance"],
    "Smart meter anomaly detection pilot for 1 state electricity board",
    "87% anomaly detection accuracy",
    "Cloud",
    16,
    true,
    "deployed",
  ],
].map(
  ([
    name,
    email,
    domain,
    technology,
    pastProjects,
    accuracyClaims,
    deploymentType,
    teamSize,
    isRegisteredEntity,
    prototypeStage,
  ]) => ({
    name,
    email,
    startupProfile: {
      domain,
      technology,
      pastProjects,
      accuracyClaims,
      deploymentType,
      teamSize,
      isRegisteredEntity,
      prototypeStage,
    },
  }),
);

export default async function seedStartups() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  for (const startup of startups)
    await User.findOneAndUpdate(
      { email: startup.email },
      {
        ...startup,
        passwordHash,
        role: "startup",
        emailVerified: true,
        accountStatus: "active",
      },
      { upsert: true, new: true, runValidators: true },
    );
  console.log(
    `Seeded ${startups.length} demo startups. Password for all: ${DEMO_PASSWORD}`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI is not configured");
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(seedStartups)
    .then(() => mongoose.disconnect())
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
