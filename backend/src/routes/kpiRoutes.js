import { Router } from "express";
import multer from "multer";
import {
  addKPIRecord,
  downloadEvidence,
  listKPIRecords,
  verifyKPIRecord,
} from "../controllers/kpiController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const acceptedEvidenceTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (acceptedEvidenceTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    const error = new Error("Evidence must be a PDF, JPEG, PNG or WebP file");
    error.status = 400;
    callback(error);
  },
});

const router = Router();
router.use(authenticate);
router.get("/evidence/:fileId", downloadEvidence);
router.get("/pilot/:pilotId", listKPIRecords);
router.post("/pilot/:pilotId", upload.single("evidence"), addKPIRecord);
router.patch("/:id/verify", authorizeRoles("evaluator"), verifyKPIRecord);
export default router;
