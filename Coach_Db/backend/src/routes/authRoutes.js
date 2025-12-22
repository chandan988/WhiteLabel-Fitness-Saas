import { Router } from "express";
import {
  changePassword,
  googleLogin,
  login,
  updateProfile,
  setPassword,
  signup,
  verifyEmail
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/set-password", setPassword);
router.patch("/profile", authenticate, updateProfile);
router.post("/change-password", authenticate, changePassword);

export default router;
