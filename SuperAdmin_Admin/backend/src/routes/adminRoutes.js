import { Router } from "express";
import {
  createCoachController,
  deleteCoachController,
  listCoachesController,
  resetCoachPasswordController,
  updateCoachController
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("superadmin"));

router.post("/coaches", createCoachController);
router.get("/coaches", listCoachesController);
router.post("/coaches/:id/reset-password", resetCoachPasswordController);
router.patch("/coaches/:id", updateCoachController);
router.delete("/coaches/:id", deleteCoachController);

export default router;
