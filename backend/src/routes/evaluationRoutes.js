import { Router } from "express";
import { applicationEvaluations, getRubric, scoreApplication } from "../controllers/evaluationController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
const router = Router();
router.use(authenticate, authorizeRoles("evaluator", "government", "admin"));
router.get("/rubric", getRubric);
router.get("/application/:applicationId", applicationEvaluations);
router.post("/application/:applicationId", authorizeRoles("evaluator"), scoreApplication);
export default router;

