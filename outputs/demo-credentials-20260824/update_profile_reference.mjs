import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = path.join(import.meta.dirname, "Scale2Start-Demo-Credentials.xlsx");
const sourcePath = path.resolve(import.meta.dirname, "../../backend/src/seed/seedStartups.js");
const source = await fs.readFile(sourcePath, "utf8");
const emails = [...source.matchAll(/"([^"]+@[^"\s]+\.demo)"/g)]
  .map((match) => match[1])
  .filter((email, index, all) => all.indexOf(email) === index);

async function login(email) {
  const response = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "Demo@1234" }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`${email}: ${data.message || "Login failed"}`);
  return data.user;
}

const startupUsers = [];
for (let index = 0; index < emails.length; index += 10) {
  startupUsers.push(...(await Promise.all(emails.slice(index, index + 10).map(login))));
}

const governmentEmails = [
  "procurement@scale2start.gov.in",
  "innovation@agriculture.gov.in",
  "procurement@health.gov.in",
];
const governmentUsers = await Promise.all(governmentEmails.map(login));

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const governmentSheet = workbook.worksheets.add("Government Profiles");
const startupSheet = workbook.worksheets.add("Startup Profiles");

const navy = "#0B1F3A";
const blue = "#155EEF";
const lightBlue = "#EAF2FF";
const border = "#D0D5DD";

function addTitle(sheet, title, subtitle, lastColumn) {
  sheet.showGridLines = false;
  sheet.mergeCells(`A1:${lastColumn}1`);
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${lastColumn}1`).format = {
    fill: navy,
    font: { bold: true, color: "#FFFFFF", size: 18 },
    verticalAlignment: "center",
  };
  sheet.getRange(`A1:${lastColumn}1`).format.rowHeight = 36;
  sheet.mergeCells(`A2:${lastColumn}2`);
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${lastColumn}2`).format = {
    fill: lightBlue,
    font: { color: "#475467", italic: true },
    wrapText: true,
    verticalAlignment: "center",
  };
  sheet.getRange(`A2:${lastColumn}2`).format.rowHeight = 30;
}

addTitle(
  governmentSheet,
  "Scale2Start — Government Organization Profiles",
  "Organization information used to provide context for challenges and procurement workflows.",
  "I",
);

const governmentRows = governmentUsers.map((user) => [
  user.name,
  user.email,
  user.departmentName,
  user.governmentProfile?.organizationType || "",
  user.governmentProfile?.ministry || "",
  user.governmentProfile?.jurisdiction || "",
  user.governmentProfile?.contactDesignation || "",
  user.governmentProfile?.procurementFocus?.join(", ") || "",
  user.governmentProfile?.activePrograms?.join(", ") || "",
]);
governmentSheet.getRange("A4:I4").values = [[
  "Name", "Email", "Department", "Organization Type", "Ministry", "Jurisdiction",
  "Designation", "Procurement Focus", "Active Programs",
]];
governmentSheet.getRange(`A5:I${governmentRows.length + 4}`).values = governmentRows;
const governmentTable = governmentSheet.tables.add(
  `A4:I${governmentRows.length + 4}`,
  true,
  "GovernmentProfileTable",
);
governmentTable.style = "TableStyleMedium2";
governmentSheet.getRange(`A4:I${governmentRows.length + 4}`).format.wrapText = true;
governmentSheet.getRange(`A5:I${governmentRows.length + 4}`).format.rowHeight = 46;
[24, 36, 32, 27, 25, 32, 24, 45, 45].forEach((width, column) => {
  governmentSheet.getRangeByIndexes(0, column, governmentRows.length + 4, 1).format.columnWidth = width;
});
governmentSheet.freezePanes.freezeRows(4);

addTitle(
  startupSheet,
  "Scale2Start — Startup Matching Profiles",
  "These structured fields are used for capability recommendations and government-side AI candidate ranking.",
  "L",
);

const startupRows = startupUsers
  .sort((left, right) =>
    (left.startupProfile?.domain || "").localeCompare(right.startupProfile?.domain || "") ||
    left.name.localeCompare(right.name),
  )
  .map((user) => {
    const profile = user.startupProfile || {};
    const budget = profile.pilotBudgetMin || profile.pilotBudgetMax
      ? `₹${Number(profile.pilotBudgetMin || 0).toLocaleString("en-IN")} – ₹${Number(profile.pilotBudgetMax || 0).toLocaleString("en-IN")}`
      : "";
    return [
      user.name,
      user.email,
      profile.domain || "",
      profile.productDescription || "",
      profile.capabilityTags?.join(", ") || "",
      profile.prototypeStage || "",
      profile.certifications?.join(", ") || "",
      profile.governmentProjects?.join("; ") || "No government project claimed",
      profile.impactMetrics?.join("; ") || "",
      [...(profile.integrationCapabilities || []), ...(profile.securityCompliance || [])].join(", "),
      budget,
      profile.implementationWeeks ? `${profile.implementationWeeks} weeks` : "",
    ];
  });

startupSheet.getRange("A4:L4").values = [[
  "Startup", "Email", "Domain", "Product Description", "Capability Tags",
  "Stage", "Certifications", "Government Experience", "Impact Evidence",
  "Integration & Security", "Pilot Budget", "Implementation",
]];
startupSheet.getRange(`A5:L${startupRows.length + 4}`).values = startupRows;
const startupTable = startupSheet.tables.add(
  `A4:L${startupRows.length + 4}`,
  true,
  "StartupProfileTable",
);
startupTable.style = "TableStyleMedium2";
startupSheet.getRange(`A4:L${startupRows.length + 4}`).format.wrapText = true;
startupSheet.getRange(`A5:L${startupRows.length + 4}`).format.rowHeight = 58;
[25, 34, 22, 48, 42, 16, 35, 48, 34, 48, 24, 18].forEach((width, column) => {
  startupSheet.getRangeByIndexes(0, column, startupRows.length + 4, 1).format.columnWidth = width;
});
startupSheet.freezePanes.freezeRows(4);
startupSheet.freezePanes.freezeColumns(2);

const readMe = workbook.worksheets.getItem("Read Me");
readMe.mergeCells("A19:F19");
readMe.getRange("A19").values = [["Profile evidence reference added"]];
readMe.getRange("A19:F19").format = {
  fill: lightBlue,
  font: { bold: true, color: navy, size: 14 },
};
readMe.mergeCells("A20:F21");
readMe.getRange("A20").values = [[
  "Use Government Profiles and Startup Profiles to inspect the structured information now used for relevance filtering, recommendation explanations and AI candidate ranking.",
]];
readMe.getRange("A20:F21").format = {
  wrapText: true,
  verticalAlignment: "center",
  borders: { preset: "outside", style: "thin", color: border },
};

const inspection = await workbook.inspect({
  kind: "table",
  range: "'Startup Profiles'!A1:L12",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 12,
});
console.log(inspection.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

for (const sheetName of [
  "Read Me",
  "Government",
  "Evaluators",
  "Startups",
  "Government Profiles",
  "Startup Profiles",
]) {
  const preview = await workbook.render({
    sheetName,
    autoCrop: "all",
    scale: 0.8,
    format: "png",
  });
  await fs.writeFile(
    path.join(import.meta.dirname, `updated-${sheetName.replace(/\s+/g, "-").toLowerCase()}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(workbookPath);
console.log(JSON.stringify({ output: workbookPath, governmentProfiles: governmentRows.length, startupProfiles: startupRows.length }));
