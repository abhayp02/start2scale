import { Router } from "express";
import {
  getAdminOverview,
  getPlatformSettings,
  listAuditLogs,
  listUsers,
  updateTemplate,
  updateUserStatus,
} from "../controllers/adminController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, authorizeRoles("admin"));
router.get("/overview", getAdminOverview);
router.get("/users", listUsers);
router.patch("/users/:userId/status", updateUserStatus);
router.get("/audit-logs", listAuditLogs);
router.get("/settings", getPlatformSettings);
router.patch("/templates/:templateId", updateTemplate);

export default router;
