import { Router } from "express";
import {
  adminLogin,
  getCurrentUser,
  login,
  register,
  updateStartupProfile,
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
router.patch("/me/startup-profile", authenticate, updateStartupProfile);

export default router;
