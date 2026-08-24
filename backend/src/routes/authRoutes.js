import { Router } from "express";
import {
  adminLogin,
  getCurrentUser,
  login,
  register,
  verifyGovernmentEmail,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { registrationGuard } from "../middleware/registrationGuard.js";

const router = Router();

router.post("/register", registrationGuard, register);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.post("/verify-government-email", verifyGovernmentEmail);
router.get("/me", authenticate, getCurrentUser);

export default router;
