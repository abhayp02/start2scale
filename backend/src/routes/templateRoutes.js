import { Router } from "express";
import {
  generateContract,
  listTemplates,
} from "../controllers/templateController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
const router = Router();
router.use(authenticate);
router.get("/", listTemplates);
router.post(
  "/generate",
  authorizeRoles("government", "admin"),
  generateContract,
);
export default router;
