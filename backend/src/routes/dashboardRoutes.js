import { Router } from "express";
import { dashboardSummary } from "../controllers/dashboardController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.get(
  "/summary",
  authenticate,
  authorizeRoles("government", "startup", "evaluator"),
  dashboardSummary,
);

export default router;
