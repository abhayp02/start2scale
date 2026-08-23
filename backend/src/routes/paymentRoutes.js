import { Router } from "express"; import { paymentsDue, releasePayment } from "../controllers/paymentController.js"; import { authenticate, authorizeRoles } from "../middleware/auth.js";
const router = Router(); router.use(authenticate, authorizeRoles("government", "admin")); router.get("/due", paymentsDue); router.patch("/:id/release", releasePayment); export default router;

