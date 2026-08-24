import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
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

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const app = express();
const port = process.env.PORT || 5000;

const localFrontendUrls = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const configuredFrontendUrls = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);
const allowedOrigins = new Set([
  ...localFrontendUrls,
  ...configuredFrontendUrls,
]);

function checkOrigin(origin, callback) {
  if (!origin || allowedOrigins.has(origin)) {
    callback(null, true);
    return;
  }

  const error = new Error("This website is not allowed to access the API");
  error.status = 403;
  callback(error);
}

app.disable("x-powered-by");
app.use(
  cors({
    origin: checkOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);
app.use(express.json({ limit: "1mb" }));
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
app.use("/uploads", express.static(path.resolve(process.cwd(), "../uploads")));

app.get("/api/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "degraded",
    database: databaseConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.use(notFound);
app.use(errorHandler);

let server;

async function startServer() {
  try {
    await connectDB();
    server = app.listen(port, "0.0.0.0", () => {
      console.log(`Start2Scale API listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Closing Start2Scale API...`);

  const forceExitTimer = setTimeout(() => process.exit(1), 10_000);
  forceExitTimer.unref();

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await mongoose.disconnect();
  process.exit(0);
}

if (process.env.NODE_ENV !== "test") {
  startServer();
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

export default app;
