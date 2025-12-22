import { Router } from "express";
import {
  coachBrandingController,
  coachProfileController,
  coachStatsController
} from "../controllers/coachController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("coach"));

router.get("/profile", coachProfileController);
router.get("/branding", coachBrandingController);
router.get("/stats", coachStatsController);

export default router;
