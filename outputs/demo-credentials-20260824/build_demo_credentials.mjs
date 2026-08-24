import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const seedSource = await fs.readFile(
  path.join(projectRoot, "backend/src/seed/seedStartups.js"),
  "utf8",
);

let startupRows = [...seedSource.matchAll(
  /\[\s*"([^"]+)"\s*,\s*"([^"]+@[^"\s]+)"\s*,\s*"([^"]+)"/g,
)]
  .map((match) => ({ name: match[1], email: match[2], domain: match[3] }))
  .filter((startup) => startup.email.endsWith(".demo"))
  .sort((a, b) => a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name));

try {
  const loginResponse = await fetch("http://localhost:5000/api/auth/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "admin@scale2start.demo",
      password: "Demo@1234",
    }),
  });
  const loginData = await loginResponse.json();
  if (loginResponse.ok) {
    const usersResponse = await fetch(
      "http://localhost:5000/api/admin/users?role=startup",
      { headers: { authorization: `Bearer ${loginData.token}` } },
    );
    const usersData = await usersResponse.json();
    if (usersResponse.ok) {
      startupRows = usersData.users
        .filter((user) => user.email.endsWith(".demo"))
        .map((user) => ({
          name: user.name,
          email: user.email,
          domain: user.startupProfile?.domain || "Not specified",
        }))
        .sort((a, b) => a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name));
    }
  }
} catch {
  // The source-derived list remains available when the local API is offline.
}

const governmentUsers = [
  ["Government", "Procurement Officer", "procurement@scale2start.gov.in", "Demo@1234", "Department of Urban Development", "http://localhost:5173/government/login", "Existing populated procurement demo"],
  ["Government", "Agriculture Innovation Officer", "innovation@agriculture.gov.in", "Demo@1234", "Department of Agriculture", "http://localhost:5173/government/login", "Clean government demo account"],
  ["Government", "Health Procurement Officer", "procurement@health.gov.in", "Demo@1234", "Department of Health", "http://localhost:5173/government/login", "Clean government demo account"],
  ["Government", "Revenue Modernization Officer", "modernization@revenue.gov.in", "Demo@1234", "Department of Revenue", "http://localhost:5173/government/login", "Complete land-records and revenue demo profile"],
  ["Government", "Transport Technology Officer", "innovation@transport.gov.in", "Demo@1234", "Department of Transport", "http://localhost:5173/government/login", "Complete transport innovation demo profile"],
  ["Government", "Water Innovation Officer", "innovation@water.gov.in", "Demo@1234", "Department of Water Resources", "http://localhost:5173/government/login", "Complete water-resource innovation demo profile"],
  ["Government", "Education Digital Transformation Officer", "digital@education.gov.in", "Demo@1234", "Department of School Education", "http://localhost:5173/government/login", "Complete education transformation demo profile"],
];

const evaluatorUsers = [
  ["Evaluator", "Ananya Mehta", "ananya.evaluator@scale2start.gov.in", "Demo@1234", "Department of Urban Development", "http://localhost:5173/government/login", "Available for Urban Development assignments"],
  ["Evaluator", "Rohan Verma", "rohan.evaluator@scale2start.gov.in", "Demo@1234", "Department of Urban Development", "http://localhost:5173/government/login", "Available for Urban Development assignments"],
  ["Evaluator", "Meera Iyer", "meera.evaluator@agriculture.gov.in", "Demo@1234", "Department of Agriculture", "http://localhost:5173/government/login", "Available for Agriculture assignments"],
  ["Evaluator", "Dr Arjun Rao", "arjun.evaluator@health.gov.in", "Demo@1234", "Department of Health", "http://localhost:5173/government/login", "Available for Health assignments"],
  ["Evaluator", "Kavita Sharma", "kavita.evaluator@revenue.gov.in", "Demo@1234", "Department of Revenue", "http://localhost:5173/government/login", "Available for Land Records assignments"],
  ["Evaluator", "Vikram Singh", "vikram.evaluator@transport.gov.in", "Demo@1234", "Department of Transport", "http://localhost:5173/government/login", "Available for Transport assignments"],
  ["Evaluator", "Neha Kulkarni", "neha.evaluator@water.gov.in", "Demo@1234", "Department of Water Resources", "http://localhost:5173/government/login", "Water quality, sensors and infrastructure specialist"],
  ["Evaluator", "Sanjay Deshmukh", "sanjay.evaluator@energy.gov.in", "Demo@1234", "Department of Energy", "http://localhost:5173/government/login", "Energy systems and smart-grid specialist"],
  ["Evaluator", "Priya Nair", "priya.evaluator@education.gov.in", "Demo@1234", "Department of School Education", "http://localhost:5173/government/login", "Learning outcomes and accessibility specialist"],
  ["Evaluator", "Farhan Ali", "farhan.evaluator@environment.gov.in", "Demo@1234", "Department of Environment", "http://localhost:5173/government/login", "Environmental monitoring and GIS specialist"],
];

const startupUsers = startupRows.map((startup) => [
  "Startup",
  startup.name,
  startup.email,
  "Demo@1234",
  startup.domain,
  "http://localhost:5173/startup/login",
  "Seeded matching profile",
]);

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Read Me");
const government = workbook.worksheets.add("Government");
const evaluators = workbook.worksheets.add("Evaluators");
const startups = workbook.worksheets.add("Startups");

const colors = {
  navy: "#0B1F3A",
  blue: "#155EEF",
  saffron: "#FF9933",
  green: "#138808",
  surface: "#FFFFFF",
  background: "#F8FAFC",
  border: "#D0D5DD",
  text: "#101828",
  secondary: "#667085",
  warning: "#FFF4E5",
};

function styleCredentialSheet(sheet, title, subtitle, rows, tableName) {
  sheet.showGridLines = false;
  sheet.mergeCells("A1:G1");
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A1:G1").format = {
    fill: colors.navy,
    font: { bold: true, color: "#FFFFFF", size: 18 },
    verticalAlignment: "center",
  };
  sheet.getRange("A1:G1").format.rowHeight = 34;

  sheet.mergeCells("A2:G2");
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange("A2:G2").format = {
    fill: "#EAF2FF",
    font: { color: colors.secondary, italic: true },
    wrapText: true,
    verticalAlignment: "center",
  };
  sheet.getRange("A2:G2").format.rowHeight = 30;

  const headers = [["Role", "Name", "Email / Login ID", "Password", "Department / Domain", "Login URL", "Demo note"]];
  sheet.getRange("A4:G4").values = headers;
  sheet.getRange(`A5:G${rows.length + 4}`).values = rows;

  const table = sheet.tables.add(`A4:G${rows.length + 4}`, true, tableName);
  table.style = "TableStyleMedium2";
  table.showBandedRows = true;
  table.showFilterButton = true;

  sheet.getRange(`D5:D${rows.length + 4}`).format = {
    fill: colors.warning,
    font: { bold: true, color: "#9A3412" },
  };
  sheet.getRange(`A4:G${rows.length + 4}`).format.verticalAlignment = "center";
  sheet.getRange(`A5:G${rows.length + 4}`).format.rowHeight = 24;
  sheet.getRange(`E5:G${rows.length + 4}`).format.wrapText = true;

  const widths = [14, 28, 38, 17, 30, 43, 38];
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, rows.length + 4, 1).format.columnWidth = width;
  });
  sheet.freezePanes.freezeRows(4);
}

styleCredentialSheet(
  government,
  "Scale2Start — Government Demo Credentials",
  "Government accounts use the Government Login portal. These credentials are for local demonstration only.",
  governmentUsers,
  "GovernmentCredentials",
);

styleCredentialSheet(
  evaluators,
  "Scale2Start — Evaluator Demo Credentials",
  "Evaluators use the Government Login portal and receive applications only after assignment by the challenge owner.",
  evaluatorUsers,
  "EvaluatorCredentials",
);

styleCredentialSheet(
  startups,
  "Scale2Start — Startup Demo Credentials",
  "All listed startup profiles are seeded for AI matching and share the demo-only password shown below.",
  startupUsers,
  "StartupCredentials",
);

summary.showGridLines = false;
summary.mergeCells("A1:F1");
summary.getRange("A1").values = [["Scale2Start Demo Login Reference"]];
summary.getRange("A1:F1").format = {
  fill: colors.navy,
  font: { bold: true, color: "#FFFFFF", size: 20 },
  verticalAlignment: "center",
};
summary.getRange("A1:F1").format.rowHeight = 38;

summary.mergeCells("A3:F4");
summary.getRange("A3").values = [[
  "LOCAL DEMO ONLY — Do not reuse these passwords for deployment or production. The workbook contains seeded accounts, not user-created test registrations.",
]];
summary.getRange("A3:F4").format = {
  fill: colors.warning,
  font: { bold: true, color: "#9A3412" },
  wrapText: true,
  verticalAlignment: "center",
  borders: { preset: "outside", style: "thin", color: colors.saffron },
};

summary.getRange("A6:B6").values = [["Account type", "Seeded accounts"]];
summary.getRange("A7:A9").values = [["Government"], ["Evaluator"], ["Startup"]];
summary.getRange("B7").formulas = [["=COUNTA('Government'!A5:A200)"]];
summary.getRange("B8").formulas = [["=COUNTA('Evaluators'!A5:A200)"]];
summary.getRange("B9").formulas = [["=COUNTA('Startups'!A5:A200)"]];
summary.getRange("A6:B9").format.borders = {
  preset: "all",
  style: "thin",
  color: colors.border,
};
summary.getRange("A6:B6").format = {
  fill: colors.blue,
  font: { bold: true, color: "#FFFFFF" },
};
summary.getRange("B7:B9").format = {
  font: { bold: true, color: colors.blue, size: 14 },
  horizontalAlignment: "center",
  numberFormat: "#,##0",
};

summary.getRange("D6:F6").values = [["Portal", "URL", "Who uses it"]];
summary.getRange("D7:F8").values = [
  ["Government Login", "http://localhost:5173/government/login", "Government and evaluator accounts"],
  ["Startup Login", "http://localhost:5173/startup/login", "Startup accounts"],
];
summary.getRange("D6:F8").format.borders = {
  preset: "all",
  style: "thin",
  color: colors.border,
};
summary.getRange("D6:F6").format = {
  fill: colors.green,
  font: { bold: true, color: "#FFFFFF" },
};

summary.mergeCells("A12:F12");
summary.getRange("A12").values = [["Recommended jury demo sequence"]];
summary.getRange("A12:F12").format = {
  fill: "#EAF2FF",
  font: { bold: true, color: colors.navy, size: 14 },
};
summary.getRange("A13:F17").values = [
  ["1", "Login as Procurement Officer", "2", "Create and publish challenge", "3", "Run AI matching"],
  ["4", "Login as a startup and apply", "5", "Run eligibility check", "6", "Assign evaluator"],
  ["7", "Login as assigned evaluator", "8", "Declare no conflict and score", "9", "Government reviews result"],
  ["10", "Shortlist application", "11", "Create pilot", "12", "Demonstrate milestone automation"],
  ["Tip", "Use Department of Urban Development for Ananya Mehta or Rohan Verma.", "", "", "", ""],
];
summary.getRange("A13:F17").format = {
  wrapText: true,
  verticalAlignment: "center",
  borders: { preset: "all", style: "thin", color: colors.border },
};
summary.getRange("A17:F17").format = {
  fill: "#ECFDF3",
  font: { bold: true, color: "#067647" },
};

summary.getRange("A1:F17").format.font = { name: "Aptos" };
summary.getRange("A:A").format.columnWidth = 13;
summary.getRange("B:B").format.columnWidth = 32;
summary.getRange("C:C").format.columnWidth = 13;
summary.getRange("D:D").format.columnWidth = 28;
summary.getRange("E:E").format.columnWidth = 43;
summary.getRange("F:F").format.columnWidth = 34;
summary.getRange("A13:F17").format.rowHeight = 32;
summary.freezePanes.freezeRows(1);

const inspect = await workbook.inspect({
  kind: "table",
  range: "'Read Me'!A1:F17",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 8,
});
console.log(inspect.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

for (const sheetName of ["Read Me", "Government", "Evaluators", "Startups"]) {
  const preview = await workbook.render({
    sheetName,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  await fs.writeFile(
    path.join(import.meta.dirname, `${sheetName.replace(/\s+/g, "-").toLowerCase()}-preview.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(import.meta.dirname, "Scale2Start-Demo-Credentials.xlsx"));

console.log(JSON.stringify({
  government: governmentUsers.length,
  evaluators: evaluatorUsers.length,
  startups: startupUsers.length,
  output: path.join(import.meta.dirname, "Scale2Start-Demo-Credentials.xlsx"),
}));
