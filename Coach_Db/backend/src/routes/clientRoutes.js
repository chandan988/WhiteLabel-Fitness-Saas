import { Router } from "express";
import {
  createClientController,
  assignMealController,
  assignWorkoutController,
  getClientHealthController,
  getClientController,
  listClientsController,
  updateClientController,
  updateWorkoutStatusController,
  updateMealStatusController
} from "../controllers/clientController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { enforceTenant } from "../middleware/tenantMiddleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("coach", "superadmin"),
  enforceTenant,
  createClientController
);

router.get(
  "/",
  authenticate,
  authorizeRoles("coach", "superadmin"),
  listClientsController
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("coach", "superadmin"),
  getClientController
);

router.get(
  "/:id/health",
  authenticate,
  authorizeRoles("coach", "superadmin"),
  getClientHealthController
);

router.post(
  "/:id/assign-workout",
  authenticate,
  authorizeRoles("coach", "superadmin"),
  assignWorkoutController
);

router.post(
  "/:id/assign-meal",
  authenticate,
  authorizeRoles("coach", "superadmin"),
  assignMealController
);

router.post(
  "/:id/workout-status",
  authenticate,
  authorizeRoles("coach", "superadmin"),
  updateWorkoutStatusController
);

router.post(
  "/:id/meal-status",
  authenticate,
  authorizeRoles("coach", "superadmin"),
  updateMealStatusController
);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("coach", "superadmin"),
  enforceTenant,
  updateClientController
);

export default router;
