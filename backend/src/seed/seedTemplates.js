import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import Template from "../models/Template.js";

dotenv.config({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
});

const templates = [
  {
    type: "problem-statement",
    title: "Standard Problem Statement Format",
    fields: [
      "departmentName",
      "sector",
      "problemDescription",
      "outcomeGoal",
      "kpiList",
      "pilotScope",
      "pilotDuration",
      "maxBudget",
    ],
    content: `
Department: {{departmentName}}
Sector: {{sector}}

Current Challenge:
{{problemDescription}}

Desired Outcome:
{{outcomeGoal}}

Success Metrics (KPIs):
{{kpiList}}

Pilot Scale: {{pilotScope}}
Timeline: {{pilotDuration}}
Budget Ceiling: {{maxBudget}}
`.trim(),
  },
  {
    type: "evaluation-rubric",
    title: "Standard Evaluation Rubric",
    fields: [],
    content: JSON.stringify(
      {
        criteria: [
          { name: "Technical Fit", weight: 30 },
          { name: "Domain Experience", weight: 20 },
          { name: "Team Capability", weight: 15 },
          { name: "Cost Reasonableness", weight: 15 },
          { name: "Data Security Plan", weight: 10 },
          { name: "Scalability Plan", weight: 10 },
        ],
        scoringScale: "0-10 per criterion, evaluator-assigned",
        totalScoreFormula: "sum(criterion.score * criterion.weight / 10)",
      },
      null,
      2,
    ),
  },
  {
    type: "pilot-agreement",
    title: "Standard Pilot Agreement",
    fields: [
      "departmentName",
      "startupName",
      "pilotScope",
      "pilotDuration",
      "milestoneSummary",
    ],
    content: `
PILOT AGREEMENT

1. PARTIES
This agreement is between {{departmentName}} ("the Department") and
{{startupName}} ("the Startup").

2. SCOPE
This pilot is limited to {{pilotScope}}, for a duration of
{{pilotDuration}}, and does not constitute a commitment to future
procurement beyond successful completion and independent validation of
this pilot.

3. IP OWNERSHIP
Core intellectual property developed prior to this engagement remains the
sole property of {{startupName}}. Any customization or adaptation built
specifically for {{departmentName}} during this pilot is jointly owned.
The Department retains a perpetual, royalty-free license to use pilot
outputs for internal government purposes.

4. DATA OWNERSHIP
All citizen and government data processed during this pilot remains the
exclusive property of {{departmentName}}. The Startup may not use this
data for any purpose outside this engagement without prior written
consent from the Department.

5. DATA DELETION
The Startup must delete all Department-provided data within 30 days of
pilot conclusion, unless the pilot is scaled into production, in which
case a separate data retention agreement applies.

6. MILESTONES AND PAYMENT
{{milestoneSummary}}

7. TERMINATION
Either party may terminate this pilot with 15 days' written notice if
independent validation determines the pilot is off-track against agreed
KPIs.
`.trim(),
  },
  {
    type: "ip-data-clause",
    title: "Standalone IP & Data Ownership Clause",
    fields: ["departmentName", "startupName"],
    content: `
IP & DATA OWNERSHIP CLAUSE

Intellectual Property: Core IP pre-existing this engagement remains the
property of {{startupName}}. Joint ownership applies only to
customizations built specifically for {{departmentName}} under this
pilot.

Data Ownership: All data generated or processed under this engagement,
including citizen data, remains the sole property of {{departmentName}}.
{{startupName}} is granted a limited, revocable license to process this
data solely for the purposes of this pilot.

Data Localization: All data must be stored and processed within India
unless explicitly waived in writing by {{departmentName}}.

Data Deletion: Upon pilot conclusion or termination, {{startupName}}
must delete all Department data within 30 days and provide written
confirmation of deletion.
`.trim(),
  },
  {
    type: "cybersecurity-checklist",
    title: "Standard Cybersecurity Checklist",
    fields: [],
    content: JSON.stringify(
      {
        checklist: [
          {
            item: "Data encrypted at rest and in transit",
            requiresProof: true,
          },
          {
            item: "Role-based access control implemented",
            requiresProof: true,
          },
          {
            item: "No citizen data stored outside India (data localization)",
            requiresProof: true,
          },
          {
            item: "Vulnerability assessment completed before go-live",
            requiresProof: true,
          },
          {
            item: "Incident response contact designated",
            requiresProof: false,
          },
        ],
      },
      null,
      2,
    ),
  },
  {
    type: "risk-register",
    title: "Standard Risk Register",
    fields: ["pilotName"],
    content: JSON.stringify(
      {
        pilotNamePlaceholder: "{{pilotName}}",
        risks: [
          {
            category: "Technical",
            risk: "Accuracy below target",
            mitigation: "",
          },
          {
            category: "Financial",
            risk: "Cost overrun at scale",
            mitigation: "",
          },
          { category: "Data", risk: "Citizen data breach", mitigation: "" },
          {
            category: "Adoption",
            risk: "Low rural/end-user uptake",
            mitigation: "",
          },
        ],
      },
      null,
      2,
    ),
  },
];

export default async function seedTemplates() {
  for (const template of templates) {
    await Template.findOneAndUpdate({ type: template.type }, template, {
      upsert: true,
      new: true,
    });
  }
  console.log(`Seeded ${templates.length} templates.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI is not configured");
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(seedTemplates)
    .then(() => mongoose.disconnect())
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
