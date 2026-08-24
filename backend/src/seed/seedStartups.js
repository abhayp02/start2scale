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

const additionalStartups = [
  ["EcoVision Technologies", "demo@ecovision.demo", "Waste Management", ["Computer Vision", "IoT", "Route Optimization"], "Smart-bin and waste-segregation deployment across 4 municipal zones", "94% waste classification accuracy", "Edge + Cloud", 24, "deployed"],
  ["WasteSense AI", "demo@wastesense.demo", "Waste Management", ["Computer Vision", "IoT Sensors", "Data Analytics"], "Automated material recovery facility pilot for a municipal corporation", "91% material classification accuracy", "Edge + Cloud", 17, "deployed"],
  ["GreenRoute Systems", "demo@greenroute.demo", "Waste Management", ["GPS Analytics", "Route Optimization", "IoT"], "Optimized waste collection routes for 120 vehicles", "22% reduction in collection distance", "Cloud", 14, "deployed"],
  ["CivicBin Technologies", "demo@civicbin.demo", "Waste Management", ["Smart Bins", "IoT", "Mobile Apps"], "Fill-level monitoring prototype across 80 public bins", "89% fill-level prediction accuracy", "Edge + Cloud", 11, "prototype"],
  ["CircularCity Labs", "demo@circularcity.demo", "Waste Management", ["Data Analytics", "Traceability", "Cloud"], "Waste traceability dashboard tested with two recyclers", "86% traceability coverage", "Cloud", 9, "prototype"],
  ["CleanSight Robotics", "demo@cleansight.demo", "Waste Management", ["Robotics", "Computer Vision", "AI"], "Robotic sorting line deployed at one private recovery facility", "93% recyclable identification accuracy", "On-premise", 21, "deployed"],
  ["BioLoop Innovations", "demo@bioloop.demo", "Waste Management", ["Composting IoT", "Predictive Analytics"], "Decentralized composting monitoring at 12 campuses", "30% faster composting cycle", "Edge + Mobile", 8, "prototype"],
  ["SafaiMitra Digital", "demo@safaimitra.demo", "Waste Management", ["Workforce Management", "GIS", "Mobile Apps"], "Sanitation workforce platform used by 1,800 field workers", "96% attendance reporting coverage", "Mobile + Web", 16, "deployed"],
  ["CropGuard Vision", "demo@cropguard.demo", "Agriculture", ["Computer Vision", "Drone Imaging", "AI"], "Pest surveillance across 8,000 acres", "90% pest detection accuracy", "Mobile + Cloud", 15, "deployed"],
  ["MandiPulse", "demo@mandipulse.demo", "Agriculture", ["Price Analytics", "Machine Learning", "Mobile Apps"], "Market-price advisory tested with 6,000 farmers", "84% seven-day trend accuracy", "Cloud", 10, "prototype"],
  ["SoilSense India", "demo@soilsense.demo", "Agriculture", ["IoT Sensors", "Soil Analytics"], "Soil monitoring deployed across 400 farms", "92% sensor data availability", "Edge + Cloud", 13, "deployed"],
  ["IrrigaSmart", "demo@irrigasmart.demo", "Agriculture", ["IoT", "Automation", "Weather Analytics"], "Automated irrigation pilot in three farmer clusters", "28% water savings", "Edge + Mobile", 12, "deployed"],
  ["KisanLedger", "demo@kisanledger.demo", "Agriculture", ["Blockchain", "Traceability", "Mobile Apps"], "Produce traceability prototype for one cooperative", "Not accuracy-based", "Cloud", 7, "prototype"],
  ["CareGrid Health", "demo@caregrid.demo", "Healthcare", ["Telemedicine", "FHIR", "Cloud"], "Telemedicine platform deployed in 14 primary health centres", "98% consultation record availability", "Cloud", 20, "deployed"],
  ["DiagnoVision", "demo@diagnovision.demo", "Healthcare", ["Medical Imaging", "Computer Vision", "AI"], "Radiology triage pilot at two district hospitals", "91% triage sensitivity", "On-premise", 19, "deployed"],
  ["HealthReach IVR", "demo@healthreach.demo", "Healthcare", ["IVR", "NLP", "Regional Languages"], "Maternal-health reminders delivered to 30,000 beneficiaries", "87% successful call completion", "IVR + Cloud", 12, "deployed"],
  ["PharmaTrack", "demo@pharmatrack.demo", "Healthcare", ["Supply Chain", "QR Traceability", "Analytics"], "Medicine stock monitoring in 40 clinics", "25% reduction in stock-outs", "Cloud", 11, "prototype"],
  ["NagarFlow AI", "demo@nagarflow.demo", "Urban Governance", ["Digital Twin", "GIS", "Predictive Analytics"], "Urban service planning pilot for one smart city", "88% incident forecasting accuracy", "Cloud", 18, "deployed"],
  ["StreetWatch", "demo@streetwatch.demo", "Urban Governance", ["Computer Vision", "Edge AI", "GIS"], "Road-defect detection across 600 kilometres", "92% pothole detection accuracy", "Edge + Cloud", 16, "deployed"],
  ["PermitEase", "demo@permitease.demo", "Urban Governance", ["Workflow Automation", "OCR", "eSign"], "Building-permit workflow deployed in two councils", "45% reduction in processing time", "Cloud", 13, "deployed"],
  ["CityAssist", "demo@cityassist.demo", "Urban Governance", ["Chatbot", "NLP", "Grievance Analytics"], "Citizen service assistant supporting five Indian languages", "85% intent classification accuracy", "Web + Mobile", 9, "prototype"],
  ["AquaAlert Systems", "demo@aquaalert.demo", "Water Resources", ["IoT Sensors", "Water Quality", "Alerts"], "Real-time water quality pilot at 25 sampling points", "94% sensor uptime", "Edge + Cloud", 15, "deployed"],
  ["LeakLens AI", "demo@leaklens.demo", "Water Resources", ["Acoustic AI", "Predictive Analytics", "GIS"], "Pipeline leakage pilot across 70 kilometres", "89% leak localization accuracy", "Edge + Cloud", 17, "deployed"],
  ["JalMitra Mobile", "demo@jalmitra.demo", "Water Resources", ["Mobile Apps", "Crowdsourcing", "GIS"], "Community water-source reporting across 90 villages", "Not accuracy-based", "Mobile", 8, "prototype"],
  ["LearnSphere AI", "demo@learnsphere.demo", "Education", ["Adaptive Learning", "NLP", "Analytics"], "Personalized learning pilot with 2,500 students", "16% improvement in assessment outcomes", "Cloud + Mobile", 14, "deployed"],
  ["VidyaVoice", "demo@vidyavoice.demo", "Education", ["ASR", "Regional Languages", "Mobile Apps"], "Voice learning assistant tested in 15 rural schools", "88% speech recognition accuracy", "Mobile", 10, "prototype"],
  ["SchoolOps", "demo@schoolops.demo", "Education", ["Workflow Automation", "Analytics", "Cloud"], "School administration suite deployed across 35 schools", "40% reduction in reporting effort", "Cloud", 12, "deployed"],
  ["DeedDigit AI", "demo@deeddigit.demo", "Land Records", ["OCR", "Document AI", "NLP"], "Property deed extraction tested on 100,000 pages", "93% field extraction accuracy", "On-premise", 16, "deployed"],
  ["MapSetu GIS", "demo@mapsetu.demo", "Land Records", ["GIS", "Satellite Imagery", "Change Detection"], "Parcel change-detection pilot in one district", "87% boundary change detection", "Cloud", 11, "prototype"],
  ["TitleTrace", "demo@titletrace.demo", "Land Records", ["Knowledge Graph", "OCR", "Workflow Automation"], "Land-title verification prototype for legal teams", "84% entity-linking accuracy", "On-premise", 8, "prototype"],
  ["TransitFlow", "demo@transitflow.demo", "Transport", ["Route Optimization", "GPS Analytics", "AI"], "Transit scheduling deployed for 350 buses", "14% improvement in schedule adherence", "Cloud", 18, "deployed"],
  ["RoadSafe Vision", "demo@roadsafe.demo", "Transport", ["Computer Vision", "Edge AI", "Incident Detection"], "Highway incident-detection pilot across 40 cameras", "92% incident detection precision", "Edge + Cloud", 15, "deployed"],
  ["ParkSmart India", "demo@parksmart.demo", "Transport", ["IoT", "Mobile Payments", "Analytics"], "Smart parking prototype across three facilities", "90% occupancy detection accuracy", "Edge + Cloud", 9, "prototype"],
  ["GridWatch AI", "demo@gridwatch.demo", "Energy", ["Predictive Maintenance", "IoT", "AI"], "Transformer monitoring across 120 assets", "88% early-fault detection accuracy", "Edge + Cloud", 17, "deployed"],
  ["SolarScope", "demo@solarscope.demo", "Energy", ["Drone Imaging", "Computer Vision", "Analytics"], "Solar panel inspection pilot across 25 MW capacity", "93% defect detection accuracy", "Cloud", 12, "deployed"],
  ["UrjaMeter", "demo@urjameter.demo", "Energy", ["Smart Metering", "IoT", "Mobile Apps"], "Consumption monitoring prototype for 2,000 households", "97% meter data availability", "Edge + Cloud", 10, "prototype"],
  ["SafeCity Vision", "demo@safecity.demo", "Public Safety", ["Computer Vision", "Video Analytics", "Edge AI"], "Crowd monitoring pilot at three public events", "90% crowd-density estimation accuracy", "Edge + Cloud", 22, "deployed"],
  ["DisasterMesh", "demo@disastermesh.demo", "Public Safety", ["GIS", "Satellite Imagery", "Emergency Alerts"], "Flood response coordination deployed in two districts", "12-minute average alert dissemination", "Cloud + Mobile", 16, "deployed"],
  ["FireWatch IoT", "demo@firewatch.demo", "Public Safety", ["IoT Sensors", "Predictive Analytics", "Alerts"], "Early fire-warning prototype in one industrial zone", "89% anomaly detection accuracy", "Edge + Cloud", 9, "prototype"],
  ["BenefitSetu", "demo@benefitsetu.demo", "Social Welfare", ["Rules Engine", "Data Analytics", "Workflow Automation"], "Benefit eligibility screening pilot for one district", "95% rule execution accuracy", "On-premise", 14, "deployed"],
  ["JanReach", "demo@janreach.demo", "Social Welfare", ["IVR", "NLP", "Regional Languages"], "Scheme-awareness campaigns reaching 70,000 citizens", "83% message comprehension score", "IVR + Mobile", 11, "deployed"],
  ["ForestEye", "demo@foresteye.demo", "Environment", ["Satellite Imagery", "Computer Vision", "GIS"], "Forest change monitoring across 2,000 square kilometres", "91% encroachment detection accuracy", "Cloud", 18, "deployed"],
  ["AirPulse", "demo@airpulse.demo", "Environment", ["IoT Sensors", "Air Quality", "Predictive Analytics"], "Hyperlocal air monitoring across 60 sensors", "94% sensor data availability", "Edge + Cloud", 13, "deployed"],
  ["CourtFlow", "demo@courtflow.demo", "Justice", ["OCR", "NLP", "Workflow Automation"], "Case-document classification prototype for legal services", "88% document classification accuracy", "On-premise", 10, "prototype"],
  ["TaxLens AI", "demo@taxlens.demo", "Revenue", ["Anomaly Detection", "Machine Learning", "Data Analytics"], "Revenue anomaly pilot on anonymized municipal data", "86% risk classification precision", "On-premise", 15, "prototype"],
].map(
  ([name, email, domain, technology, pastProjects, accuracyClaims, deploymentType, teamSize, prototypeStage]) => ({
    name,
    email,
    startupProfile: {
      domain,
      technology,
      pastProjects,
      accuracyClaims,
      deploymentType,
      teamSize,
      isRegisteredEntity: true,
      prototypeStage,
    },
  }),
);

function enrichStartupProfile(startup) {
  const profile = startup.startupProfile;
  const deployed = profile.prototypeStage === "deployed";

  return {
    ...startup,
    startupProfile: {
      ...profile,
      productDescription: `${startup.name} provides ${profile.domain.toLowerCase()} solutions using ${profile.technology.join(", ")}.`,
      capabilityTags: [...new Set([...profile.technology, profile.domain])],
      industriesServed: [profile.domain, "Government"],
      certifications: deployed
        ? ["Startup India Recognized", "ISO 27001 Ready"]
        : ["Startup India Recognized"],
      previousDeployments: [profile.pastProjects],
      governmentProjects: profile.pastProjects.toLowerCase().includes("government") ||
        profile.pastProjects.toLowerCase().includes("district") ||
        profile.pastProjects.toLowerCase().includes("municipal") ||
        profile.pastProjects.toLowerCase().includes("state")
          ? [profile.pastProjects]
          : [],
      customerBase: deployed
        ? "Government departments, public institutions and enterprise customers"
        : "Pilot customers and early adopters",
      impactMetrics: [profile.accuracyClaims],
      fundingStage: profile.teamSize >= 15 ? "Seed / Growth" : "Bootstrapped / Pre-seed",
      integrationCapabilities: ["REST API", "CSV data exchange", "Role-based dashboard"],
      securityCompliance: ["Encryption in transit", "Role-based access control", "India data residency supported"],
      geographicAvailability: ["India", "Remote deployment support"],
      pilotBudgetMin: profile.teamSize >= 15 ? 1000000 : 500000,
      pilotBudgetMax: profile.teamSize >= 15 ? 5000000 : 2500000,
      implementationWeeks: deployed ? 8 : 12,
    },
  };
}

export default async function seedStartups() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const startupCatalog = [...startups, ...additionalStartups].map(
    enrichStartupProfile,
  );
  for (const startup of startupCatalog)
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
    `Seeded ${startupCatalog.length} demo startups. Password for all: ${DEMO_PASSWORD}`,
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
