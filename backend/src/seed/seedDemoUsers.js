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
    name: "Revenue Modernization Officer",
    email: "modernization@revenue.gov.in",
    role: "government",
    departmentName: "Department of Revenue",
    governmentProfile: {
      organizationType: "State Government Department",
      ministry: "Revenue and Disaster Management",
      jurisdiction: "District revenue offices and statewide land administration",
      contactDesignation: "Director, Revenue Modernization",
      procurementFocus: ["Land Records", "Document Digitization", "GIS", "Citizen Service Delivery"],
      activePrograms: ["Digital Land Records Modernization", "Mutation Workflow Reform", "Revenue Records Quality Mission"],
    },
  },
  {
    name: "Transport Technology Officer",
    email: "innovation@transport.gov.in",
    role: "government",
    departmentName: "Department of Transport",
    governmentProfile: {
      organizationType: "State Government Department",
      ministry: "Transport and Road Safety",
      jurisdiction: "State transport undertakings, regional transport offices and public roads",
      contactDesignation: "Joint Director, Transport Technology",
      procurementFocus: ["Public Transport", "Road Safety", "Fleet Analytics", "Intelligent Traffic Systems"],
      activePrograms: ["Integrated Mobility Mission", "Safe Roads Analytics", "Digital Fleet Operations"],
    },
  },
  {
    name: "Water Innovation Officer",
    email: "innovation@water.gov.in",
    role: "government",
    departmentName: "Department of Water Resources",
    governmentProfile: {
      organizationType: "State Government Department",
      ministry: "Water Resources and Public Health Engineering",
      jurisdiction: "Urban water utilities, rural supply schemes and irrigation networks",
      contactDesignation: "Chief Innovation and Monitoring Officer",
      procurementFocus: ["Water Quality", "Leak Detection", "IoT Monitoring", "Resource Planning"],
      activePrograms: ["Jal Monitoring Grid", "Non-Revenue Water Reduction", "Rural Water Quality Assurance"],
    },
  },
  {
    name: "Education Digital Transformation Officer",
    email: "digital@education.gov.in",
    role: "government",
    departmentName: "Department of School Education",
    governmentProfile: {
      organizationType: "State Government Department",
      ministry: "Education",
      jurisdiction: "Government schools, district education offices and teacher training institutes",
      contactDesignation: "Director, Digital Education",
      procurementFocus: ["Learning Analytics", "School Operations", "Regional Language Technology", "Teacher Enablement"],
      activePrograms: ["Connected Classroom Mission", "Learning Outcome Analytics", "School Administration Modernization"],
    },
  },
  {
    name: "Ananya Mehta",
    email: "ananya.evaluator@scale2start.gov.in",
    role: "evaluator",
    departmentName: "Department of Urban Development",
    evaluatorProfile: {
      expertiseDomains: ["Urban Governance", "Waste Management", "Smart Cities"],
      professionalCertifications: ["Public Procurement", "Urban Innovation Evaluation"],
      yearsOfExperience: 11,
      currentCapacity: 6,
      bio: "Urban technology evaluator specializing in municipal deployments and measurable citizen outcomes.",
    },
  },
  {
    name: "Rohan Verma",
    email: "rohan.evaluator@scale2start.gov.in",
    role: "evaluator",
    departmentName: "Department of Urban Development",
    evaluatorProfile: {
      expertiseDomains: ["Transport", "IoT", "Urban Governance"],
      professionalCertifications: ["Government e-Marketplace", "Technology Risk Assessment"],
      yearsOfExperience: 9,
      currentCapacity: 5,
      bio: "Technical evaluator focused on interoperable urban platforms, IoT deployments and operational scalability.",
    },
  },
  {
    name: "Meera Iyer",
    email: "meera.evaluator@agriculture.gov.in",
    role: "evaluator",
    departmentName: "Department of Agriculture",
    evaluatorProfile: {
      expertiseDomains: ["Agriculture", "Remote Sensing", "Farmer Services"],
      professionalCertifications: ["Agricultural Extension", "Impact Evaluation"],
      yearsOfExperience: 12,
      currentCapacity: 4,
      bio: "Agriculture innovation specialist experienced in rural pilots and farmer-centric technology assessment.",
    },
  },
  {
    name: "Dr Arjun Rao",
    email: "arjun.evaluator@health.gov.in",
    role: "evaluator",
    departmentName: "Department of Health",
    evaluatorProfile: {
      expertiseDomains: ["Healthcare", "Digital Health", "Data Privacy"],
      professionalCertifications: ["Digital Health Standards", "Clinical Data Governance"],
      yearsOfExperience: 14,
      currentCapacity: 4,
      bio: "Public health evaluator specializing in clinical workflows, interoperability and responsible health-data use.",
    },
  },
  {
    name: "Kavita Sharma",
    email: "kavita.evaluator@revenue.gov.in",
    role: "evaluator",
    departmentName: "Department of Revenue",
    evaluatorProfile: {
      expertiseDomains: ["Land Records", "OCR", "GIS"],
      professionalCertifications: ["Records Management", "Information Security"],
      yearsOfExperience: 10,
      currentCapacity: 5,
      bio: "Land administration evaluator experienced in record digitization, geospatial systems and data quality.",
    },
  },
  {
    name: "Vikram Singh",
    email: "vikram.evaluator@transport.gov.in",
    role: "evaluator",
    departmentName: "Department of Transport",
    evaluatorProfile: {
      expertiseDomains: ["Transport", "Route Optimization", "Road Safety"],
      professionalCertifications: ["Transport Planning", "Public Procurement"],
      yearsOfExperience: 13,
      currentCapacity: 6,
      bio: "Transport systems evaluator focused on fleet operations, road safety and scalable mobility technology.",
    },
  },
  {
    name: "Neha Kulkarni",
    email: "neha.evaluator@water.gov.in",
    role: "evaluator",
    departmentName: "Department of Water Resources",
    evaluatorProfile: {
      expertiseDomains: ["Water Resources", "IoT Sensors", "Water Quality", "Hydraulic Systems"],
      professionalCertifications: ["Water Quality Management", "IoT Systems Assessment", "Public Procurement"],
      yearsOfExperience: 12,
      currentCapacity: 5,
      bio: "Water infrastructure evaluator with experience validating sensor networks, leakage analytics and rural water-quality pilots.",
    },
  },
  {
    name: "Sanjay Deshmukh",
    email: "sanjay.evaluator@energy.gov.in",
    role: "evaluator",
    departmentName: "Department of Energy",
    evaluatorProfile: {
      expertiseDomains: ["Energy", "Smart Metering", "Predictive Maintenance", "Grid Analytics"],
      professionalCertifications: ["Energy Management", "Electrical Safety", "Technology Risk Assessment"],
      yearsOfExperience: 15,
      currentCapacity: 4,
      bio: "Power-sector evaluator focused on distribution reliability, metering systems, asset health and measurable energy savings.",
    },
  },
  {
    name: "Priya Nair",
    email: "priya.evaluator@education.gov.in",
    role: "evaluator",
    departmentName: "Department of School Education",
    evaluatorProfile: {
      expertiseDomains: ["Education", "Learning Analytics", "Regional Languages", "Accessibility"],
      professionalCertifications: ["Education Impact Evaluation", "Digital Accessibility", "Child Data Protection"],
      yearsOfExperience: 10,
      currentCapacity: 6,
      bio: "Education technology evaluator experienced in learning-outcome measurement, inclusive design and school-scale deployments.",
    },
  },
  {
    name: "Farhan Ali",
    email: "farhan.evaluator@environment.gov.in",
    role: "evaluator",
    departmentName: "Department of Environment",
    evaluatorProfile: {
      expertiseDomains: ["Environment", "Remote Sensing", "Air Quality", "Climate Analytics"],
      professionalCertifications: ["Environmental Impact Assessment", "GIS Analysis", "Remote Sensing Applications"],
      yearsOfExperience: 11,
      currentCapacity: 5,
      bio: "Environmental evaluator specializing in geospatial evidence, monitoring networks and outcome verification for climate-tech pilots.",
    },
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
