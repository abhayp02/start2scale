import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import pilotRoutes from "./routes/pilotRoutes.js";
import milestoneRoutes from "./routes/milestoneRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import kpiRoutes from "./routes/kpiRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import path from "node:path";

import fs from "node:fs";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const app = express();
const port = process.env.PORT || 5000;

const uploadsDir = fileURLToPath(new URL("../../uploads", import.meta.url));
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/pilots", pilotRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/kpis", kpiRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Start2Scale API listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
