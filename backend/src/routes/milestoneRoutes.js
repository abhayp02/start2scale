import { Router } from "express"; import { createMilestone, listMilestones, updateMilestone } from "../controllers/milestoneController.js"; import { authenticate, authorizeRoles } from "../middleware/auth.js";
const router = Router(); router.use(authenticate); router.get("/pilot/:pilotId", listMilestones); router.post("/pilot/:pilotId", authorizeRoles("government", "admin"), createMilestone); router.patch("/:id", updateMilestone); export default router;

