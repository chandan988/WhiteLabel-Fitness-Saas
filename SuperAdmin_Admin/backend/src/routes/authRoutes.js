import { Router } from "express";
import {
  coachLogin,
  coachSetup,
  superAdminLogin
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/superadmin/login", superAdminLogin);
router.post("/coach/login", coachLogin);
router.post(
  "/coach/setup",
  authenticate,
  authorizeRoles("coach"),
  coachSetup
);

export default router;
