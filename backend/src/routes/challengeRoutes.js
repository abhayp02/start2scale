import { Router } from "express";
import { browseChallenges, createChallenge, getMyChallenges, getStartupMatches, updateChallengeStatus } from "../controllers/challengeController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.get("/", authorizeRoles("startup", "evaluator", "admin"), browseChallenges);
router.get("/mine", authorizeRoles("government"), getMyChallenges);
router.post("/", authorizeRoles("government"), createChallenge);
router.get("/:id/matches", authorizeRoles("government"), getStartupMatches);
router.patch("/:id/status", authorizeRoles("government"), updateChallengeStatus);

export default router;
