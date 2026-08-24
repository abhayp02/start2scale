import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });

const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || "admin@scale2start.demo";
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || "Demo@1234";

export default async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    {
      name: "Platform Administrator",
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: "admin",
      emailVerified: true,
      accountStatus: "active",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.log(`Admin ready: ${ADMIN_EMAIL}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(seedAdmin)
    .then(() => mongoose.disconnect())
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
