import "dotenv/config";
import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

