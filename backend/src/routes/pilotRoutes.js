import { Router } from "express";
import { addGrievance, createPilot, getPilot, getPilotReport, listGrievances, listPilots, resolveGrievance, updatePilot } from "../controllers/pilotController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
const router = Router(); router.use(authenticate);
router.get("/", listPilots); router.post("/", authorizeRoles("government", "admin"), createPilot); router.get("/:id/report", getPilotReport); router.get("/:id", getPilot); router.patch("/:id", authorizeRoles("government", "admin"), updatePilot);
router.get("/:id/grievances", authorizeRoles("government", "evaluator", "admin"), listGrievances); router.post("/:id/grievances", addGrievance); router.patch("/:id/grievances/:grievanceId/resolve", authorizeRoles("government", "admin"), resolveGrievance);
export default router;
