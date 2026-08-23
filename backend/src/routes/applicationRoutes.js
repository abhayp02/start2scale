import { Router } from "express";
import { apply, challengeApplications, myApplications, runEligibility, shortlist } from "../controllers/applicationController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
const router = Router();
router.use(authenticate);
router.get("/mine", authorizeRoles("startup"), myApplications);
router.get("/challenge/:challengeId", authorizeRoles("government", "evaluator", "admin"), challengeApplications);
router.post("/challenge/:challengeId", authorizeRoles("startup"), apply);
router.patch("/:id/eligibility", authorizeRoles("government", "evaluator", "admin"), runEligibility);
router.patch("/:id/shortlist", authorizeRoles("government", "admin"), shortlist);
export default router;

