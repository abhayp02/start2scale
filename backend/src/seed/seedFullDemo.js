import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import User from "../models/User.js";
import Template from "../models/Template.js";
import Challenge from "../models/Challenge.js";
import Application from "../models/Application.js";
import Evaluation from "../models/Evaluation.js";
import Pilot from "../models/Pilot.js";
import Milestone from "../models/Milestone.js";
import Payment from "../models/Payment.js";
import KPIRecord from "../models/KPIRecord.js";

dotenv.config({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
});

export default async function seedFullDemo() {
  console.log("Seeding rich innovation lifecycle demo data...");

  // 1. Fetch Users
  const urbanGov = await User.findOne({ email: "procurement@scale2start.gov.in" });
  const agriGov = await User.findOne({ email: "innovation@agriculture.gov.in" });
  const healthGov = await User.findOne({ email: "procurement@health.gov.in" });

  const ananyaEval = await User.findOne({ email: "ananya.evaluator@scale2start.gov.in" });
  const rohanEval = await User.findOne({ email: "rohan.evaluator@scale2start.gov.in" });
  const meeraEval = await User.findOne({ email: "meera.evaluator@agriculture.gov.in" });

  const allStartups = await User.find({ role: "startup" });
  const startupMap = {};
  for (const s of allStartups) {
    startupMap[s.email] = s;
  }

  const template = await Template.findOne({ type: "problem-statement" });
  if (!template) {
    console.error("Template not found. Please run seedTemplates first.");
    return;
  }

  // 2. Seed Challenges
  const challengesData = [
    {
      createdBy: urbanGov?._id,
      departmentName: "Department of Urban Development",
      problemText: `Department: Department of Urban Development\nSector: Urban Governance\n\nCurrent Challenge:\nTraffic congestion at 42 major urban intersections causes an estimated 35-minute average delay during peak commute hours. Manual traffic signal timers cannot adapt to real-time vehicle queues.\n\nDesired Outcome:\nDeploy an intelligent, computer vision-based adaptive traffic signal system that dynamically modulates green-light durations based on real-time intersection density.\n\nSuccess Metrics (KPIs):\n20% reduction in average commute delay, 92%+ vehicle count accuracy, 99.5% edge uptime.\n\nPilot Scale: 6 intersections in Indore Smart City Zone\nTimeline: 6 Months\nBudget Ceiling: ₹25,00,000`,
      requirements: {
        technology: "Computer Vision, Edge AI, IoT Sensors",
        domain: "Urban Governance",
        requiredAccuracy: "92%+ vehicle detection accuracy",
        deployment: "Edge + Cloud Hybrid",
      },
      templateRef: template._id,
      status: "published",
      aiMatchAnalysis: {
        model: "gemini-3.7-flash",
        generatedAt: new Date(),
        analyzedCount: 35,
        candidateCount: 6,
        matches: [
          {
            startupId: startupMap["info@urbanpulse.demo"]?._id?.toString() || "",
            startupName: "UrbanPulse Analytics",
            matchScore: 95,
            explanation: "Proven track record in municipal computer vision traffic monitoring with 91% verified vehicle count accuracy.",
          },
          {
            startupId: startupMap["contact@jalrakshak.demo"]?._id?.toString() || "",
            startupName: "JalRakshak",
            matchScore: 72,
            explanation: "Strong edge infrastructure experience with real-time telemetry sensors.",
          },
        ],
      },
    },
    {
      createdBy: urbanGov?._id,
      departmentName: "Department of Urban Development",
      problemText: `Department: Department of Urban Development\nSector: Urban Governance\n\nCurrent Challenge:\nMunicipal grievance portal receives 12,000+ tickets monthly across 18 municipal zones. Over 40% of tickets are miscategorized or routed to incorrect departments, leading to SLA breaches.\n\nDesired Outcome:\nAutomated NLP and Voice AI pipeline to categorize citizen grievances in regional languages, detect urgency, and auto-route to designated ward engineers.\n\nSuccess Metrics (KPIs):\n88%+ categorization accuracy, 50% reduction in first-response time, 90% citizen satisfaction rating.\n\nPilot Scale: Central Grievance Cell (Ward 1 to 5)\nTimeline: 4 Months\nBudget Ceiling: ₹18,00,000`,
      requirements: {
        technology: "NLP, Speech AI, Ticket Analytics",
        domain: "Urban Governance",
        requiredAccuracy: "88% classification accuracy across Hindi & English",
        deployment: "Cloud API",
      },
      templateRef: template._id,
      status: "published",
      aiMatchAnalysis: {
        model: "gemini-3.7-flash",
        generatedAt: new Date(),
        analyzedCount: 28,
        candidateCount: 5,
        matches: [
          {
            startupId: startupMap["team@civicvoice.demo"]?._id?.toString() || "",
            startupName: "CivicVoice",
            matchScore: 92,
            explanation: "Specialized in municipal grievance categorization with 82% benchmarked accuracy across regional civic departments.",
          },
          {
            startupId: startupMap["connect@farmmitra.demo"]?._id?.toString() || "",
            startupName: "FarmMitra",
            matchScore: 75,
            explanation: "Extensive experience in multilingual NLP and conversational voice assistants.",
          },
        ],
      },
    },
    {
      createdBy: urbanGov?._id,
      departmentName: "Department of Urban Development",
      problemText: `Department: Department of Urban Development\nSector: Urban Governance\n\nCurrent Challenge:\nUncoordinated municipal solid waste collection causes high fuel burn and missed pickup spots across commercial wards.\n\nDesired Outcome:\nDynamic route optimization platform using fill-level IoT sensors on primary bins and automated driver route dispatch.\n\nSuccess Metrics (KPIs):\n25% fuel savings, 95%+ timely clearance compliance.\n\nPilot Scale: 2 Commercial Wards\nTimeline: 5 Months\nBudget Ceiling: ₹22,00,000`,
      requirements: {
        technology: "IoT Sensors, Route Optimization, Mobile Dispatch",
        domain: "Urban Governance",
        requiredAccuracy: "95% sensor reporting accuracy",
        deployment: "Cloud + Mobile",
      },
      templateRef: template._id,
      status: "published",
    },
    {
      createdBy: agriGov?._id,
      departmentName: "Department of Agriculture",
      problemText: `Department: Department of Agriculture\nSector: Agriculture\n\nCurrent Challenge:\nEarly-stage fungal blight in cotton and soybean crops causes 25% annual yield loss before extension officers can visit farms.\n\nDesired Outcome:\nAI mobile crop diagnostics system providing hyper-local pest warnings and instant remedy recommendations.\n\nSuccess Metrics (KPIs):\n90%+ early detection accuracy, 15,000+ farmers active.\n\nPilot Scale: 50 Gram Panchayats\nTimeline: 6 Months\nBudget Ceiling: ₹30,00,000`,
      requirements: {
        technology: "Computer Vision, Satellite Imagery, Mobile App",
        domain: "Agriculture",
        requiredAccuracy: "90%+ disease detection accuracy",
        deployment: "Mobile + Web",
      },
      templateRef: template._id,
      status: "published",
    },
  ];

  const createdChallenges = [];
  for (const cData of challengesData) {
    if (!cData.createdBy) continue;
    const ch = await Challenge.findOneAndUpdate(
      { problemText: cData.problemText },
      cData,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    createdChallenges.push(ch);
  }
  console.log(`Seeded ${createdChallenges.length} published challenges.`);

  const trafficChallenge = createdChallenges[0];
  const grievanceChallenge = createdChallenges[1];
  const wasteChallenge = createdChallenges[2];
  const agriChallenge = createdChallenges[3];

  // 3. Seed Applications
  const urbanPulse = startupMap["info@urbanpulse.demo"] || allStartups[0];
  const civicVoice = startupMap["team@civicvoice.demo"] || allStartups[1];
  const agriVision = startupMap["team@agrivision.demo"] || allStartups[2];
  const bhuLekh = startupMap["contact@bhulekhai.demo"] || allStartups[3];
  const jalRakshak = startupMap["contact@jalrakshak.demo"] || allStartups[4];
  const transportIQ = startupMap["info@transportiq.demo"] || allStartups[5];

  const appData = [];
  if (trafficChallenge && urbanPulse) {
    appData.push({
      challengeId: trafficChallenge._id,
      startupId: urbanPulse._id,
      eligibility: { registered: true, sectorMatch: true, hasWorkingPrototype: true, eligible: true },
      status: "shortlisted",
    });
  }
  if (trafficChallenge && jalRakshak) {
    appData.push({
      challengeId: trafficChallenge._id,
      startupId: jalRakshak._id,
      eligibility: { registered: true, sectorMatch: true, hasWorkingPrototype: true, eligible: true },
      status: "eligible",
    });
  }
  if (trafficChallenge && bhuLekh) {
    appData.push({
      challengeId: trafficChallenge._id,
      startupId: bhuLekh._id,
      eligibility: { registered: true, sectorMatch: false, hasWorkingPrototype: true, eligible: false },
      status: "rejected",
    });
  }
  if (grievanceChallenge && civicVoice) {
    appData.push({
      challengeId: grievanceChallenge._id,
      startupId: civicVoice._id,
      eligibility: { registered: true, sectorMatch: true, hasWorkingPrototype: true, eligible: true },
      status: "shortlisted",
    });
  }
  if (wasteChallenge && transportIQ) {
    appData.push({
      challengeId: wasteChallenge._id,
      startupId: transportIQ._id,
      eligibility: { registered: true, sectorMatch: true, hasWorkingPrototype: true, eligible: true },
      status: "eligible",
    });
  }
  if (agriChallenge && agriVision) {
    appData.push({
      challengeId: agriChallenge._id,
      startupId: agriVision._id,
      eligibility: { registered: true, sectorMatch: true, hasWorkingPrototype: true, eligible: true },
      status: "shortlisted",
    });
  }

  const createdApps = [];
  for (const app of appData) {
    const a = await Application.findOneAndUpdate(
      { challengeId: app.challengeId, startupId: app.startupId },
      app,
      { upsert: true, new: true },
    );
    createdApps.push(a);
  }
  console.log(`Seeded ${createdApps.length} applications.`);

  // 4. Seed Evaluations
  const trafficApp = createdApps.find(a => a.challengeId.toString() === trafficChallenge?._id.toString() && a.status === "shortlisted");
  if (trafficApp && ananyaEval && urbanGov) {
    await Evaluation.findOneAndUpdate(
      { applicationId: trafficApp._id, evaluatorId: ananyaEval._id },
      {
        applicationId: trafficApp._id,
        evaluatorId: ananyaEval._id,
        assignedBy: urbanGov._id,
        status: "submitted",
        assignedAt: new Date(Date.now() - 14 * 86400000),
        dueDate: new Date(Date.now() + 10 * 86400000),
        instructions: "Evaluate computer vision edge feasibility, accuracy benchmarks, and data security plan.",
        scores: [
          { criterion: "Technical Fit", weight: 30, score: 9.5 },
          { criterion: "Domain Experience", weight: 20, score: 9 },
          { criterion: "Team Capability", weight: 15, score: 8.5 },
          { criterion: "Cost Reasonableness", weight: 15, score: 8 },
          { criterion: "Data Security Plan", weight: 10, score: 9 },
          { criterion: "Scalability Plan", weight: 10, score: 8.5 },
        ],
        totalScore: 89.5,
        submittedAt: new Date(Date.now() - 4 * 86400000),
        notes: "Field-ready edge architecture with robust vehicle detection algorithms. Passed technical evaluation.",
      },
      { upsert: true, new: true },
    );
  }

  const grievanceApp = createdApps.find(a => a.challengeId.toString() === grievanceChallenge?._id.toString() && a.status === "shortlisted");
  if (grievanceApp && rohanEval && urbanGov) {
    await Evaluation.findOneAndUpdate(
      { applicationId: grievanceApp._id, evaluatorId: rohanEval._id },
      {
        applicationId: grievanceApp._id,
        evaluatorId: rohanEval._id,
        assignedBy: urbanGov._id,
        status: "assigned",
        assignedAt: new Date(Date.now() - 2 * 86400000),
        dueDate: new Date(Date.now() + 5 * 86400000),
        instructions: "Review NLP classification accuracy on regional language tickets.",
      },
      { upsert: true, new: true },
    );
  }
  console.log("Seeded evaluator assignments and scores.");

  // 5. Seed Pilots
  if (trafficChallenge && urbanPulse) {
    const pilot1 = await Pilot.findOneAndUpdate(
      { challengeId: trafficChallenge._id, startupId: urbanPulse._id },
      {
        challengeId: trafficChallenge._id,
        startupId: urbanPulse._id,
        district: "Indore Smart City Zone",
        status: "active",
        startDate: new Date(Date.now() - 45 * 86400000),
        endDate: new Date(Date.now() + 135 * 86400000),
        kpis: [
          { name: "Vehicle Count Accuracy", target: 92, unit: "%" },
          { name: "Average Peak Delay Reduction", target: 20, unit: "%" },
          { name: "Edge Camera Uptime", target: 99.5, unit: "%" },
        ],
      },
      { upsert: true, new: true },
    );

    // Milestones
    const m1 = await Milestone.findOneAndUpdate(
      { pilotId: pilot1._id, title: "Edge Hardware Installation & Camera Feed Calibration" },
      {
        pilotId: pilot1._id,
        title: "Edge Hardware Installation & Camera Feed Calibration",
        dueDate: new Date(Date.now() - 20 * 86400000),
        status: "verified",
        paymentAmount: 800000,
        paymentDue: false,
        paymentStatus: "released",
      },
      { upsert: true, new: true },
    );

    const m2 = await Milestone.findOneAndUpdate(
      { pilotId: pilot1._id, title: "Adaptive Signal Algorithm Live Rollout (6 Intersections)" },
      {
        pilotId: pilot1._id,
        title: "Adaptive Signal Algorithm Live Rollout (6 Intersections)",
        dueDate: new Date(Date.now() + 10 * 86400000),
        status: "completed",
        paymentAmount: 1000000,
        paymentDue: true,
        paymentStatus: "due",
      },
      { upsert: true, new: true },
    );

    const m3 = await Milestone.findOneAndUpdate(
      { pilotId: pilot1._id, title: "Quarterly Performance Audit & Scale-Up Validation" },
      {
        pilotId: pilot1._id,
        title: "Quarterly Performance Audit & Scale-Up Validation",
        dueDate: new Date(Date.now() + 90 * 86400000),
        status: "in-progress",
        paymentAmount: 700000,
        paymentDue: false,
        paymentStatus: "not-due",
      },
      { upsert: true, new: true },
    );

    // Payments
    if (m1) {
      await Payment.findOneAndUpdate(
        { milestoneId: m1._id },
        {
          pilotId: pilot1._id,
          milestoneId: m1._id,
          amount: 800000,
          status: "released",
          releasedDate: new Date(Date.now() - 10 * 86400000),
        },
        { upsert: true, new: true },
      );
    }
    if (m2) {
      await Payment.findOneAndUpdate(
        { milestoneId: m2._id },
        {
          pilotId: pilot1._id,
          milestoneId: m2._id,
          amount: 1000000,
          status: "pending",
        },
        { upsert: true, new: true },
      );
    }

    // KPI Records
    await KPIRecord.findOneAndUpdate(
      { pilotId: pilot1._id, kpiName: "Vehicle Count Accuracy" },
      {
        pilotId: pilot1._id,
        kpiName: "Vehicle Count Accuracy",
        reportedValue: 93.4,
        source: "officer",
        reportedDate: new Date(Date.now() - 5 * 86400000),
        verificationStatus: "evaluator-confirmed",
      },
      { upsert: true, new: true },
    );

    await KPIRecord.findOneAndUpdate(
      { pilotId: pilot1._id, kpiName: "Average Peak Delay Reduction" },
      {
        pilotId: pilot1._id,
        kpiName: "Average Peak Delay Reduction",
        reportedValue: 22.5,
        source: "officer",
        reportedDate: new Date(Date.now() - 3 * 86400000),
        verificationStatus: "evaluator-confirmed",
      },
      { upsert: true, new: true },
    );
  }

  if (grievanceChallenge && civicVoice) {
    const pilot2 = await Pilot.findOneAndUpdate(
      { challengeId: grievanceChallenge._id, startupId: civicVoice._id },
      {
        challengeId: grievanceChallenge._id,
        startupId: civicVoice._id,
        district: "Central Grievance Cell (Ward 1 to 5)",
        status: "active",
        startDate: new Date(Date.now() - 20 * 86400000),
        endDate: new Date(Date.now() + 100 * 86400000),
        kpis: [
          { name: "Categorization Accuracy", target: 88, unit: "%" },
          { name: "First Response Reduction", target: 50, unit: "%" },
        ],
      },
      { upsert: true, new: true },
    );

    const gm1 = await Milestone.findOneAndUpdate(
      { pilotId: pilot2._id, title: "Grievance API Integration & Initial Model Fine-Tuning" },
      {
        pilotId: pilot2._id,
        title: "Grievance API Integration & Initial Model Fine-Tuning",
        dueDate: new Date(Date.now() + 15 * 86400000),
        status: "in-progress",
        paymentAmount: 600000,
        paymentDue: true,
        paymentStatus: "due",
      },
      { upsert: true, new: true },
    );

    if (gm1) {
      await Payment.findOneAndUpdate(
        { milestoneId: gm1._id },
        {
          pilotId: pilot2._id,
          milestoneId: gm1._id,
          amount: 600000,
          status: "pending",
        },
        { upsert: true, new: true },
      );
    }
  }

  console.log("Seeded active pilots with milestones, payments, and KPI telemetry.");
  console.log("Full demo dataset seeded successfully!");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(seedFullDemo)
    .then(() => mongoose.disconnect())
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
