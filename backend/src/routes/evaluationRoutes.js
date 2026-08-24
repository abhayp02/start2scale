import { Router } from "express";
import {
  assignEvaluator,
  assignedEvaluations,
  applicationEvaluations,
  getRubric,
  listEvaluators,
  scoreApplication,
} from "../controllers/evaluationController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
const router = Router();
router.use(authenticate, authorizeRoles("evaluator", "government", "admin"));
router.get("/rubric", getRubric);
router.get("/evaluators", authorizeRoles("government"), listEvaluators);
router.get("/assigned", authorizeRoles("evaluator"), assignedEvaluations);
router.get("/application/:applicationId", applicationEvaluations);
router.post(
  "/application/:applicationId/assign",
  authorizeRoles("government"),
  assignEvaluator,
);
router.post(
  "/application/:applicationId",
  authorizeRoles("evaluator"),
  scoreApplication,
);
export default router;
