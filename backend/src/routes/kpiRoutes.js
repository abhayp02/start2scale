import { Router } from "express";
import multer from "multer";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  addKPIRecord,
  listKPIRecords,
  verifyKPIRecord,
} from "../controllers/kpiController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const uploadsDir = fileURLToPath(new URL("../../../uploads", import.meta.url));
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) =>
      cb(
        null,
        `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
      ),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});
const router = Router();
router.use(authenticate);
router.get("/pilot/:pilotId", listKPIRecords);
router.post("/pilot/:pilotId", upload.single("evidence"), addKPIRecord);
router.patch("/:id/verify", authorizeRoles("evaluator"), verifyKPIRecord);
export default router;
