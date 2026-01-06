import { Router } from "express";
import {
  createCoachController,
  deleteCoachController,
  listCoachesController,
  resetCoachPasswordController,
  updateCoachController
} from "../controllers/adminController.js";
import {
  createOverride,
  getDailyContentAdmin,
  listOverridesAdmin,
  removeOverride,
  updateOverride
} from "../controllers/adminDailyContentController.js";
import {
  getAdminDashboardSummary,
  getAdminStepsTrend,
  getAdminCaloriesTrend,
  getAdminWeightTrend,
  getAdminNutritionOverview
} from "../controllers/adminDashboardController.js";
import {
  createFoodController,
  createWorkoutController,
  listFoodsController,
  listWorkoutsController
} from "../controllers/adminCatalogController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("superadmin"));

router.post("/coaches", createCoachController);
router.get("/coaches", listCoachesController);
router.post("/coaches/:id/reset-password", resetCoachPasswordController);
router.patch("/coaches/:id", updateCoachController);
router.delete("/coaches/:id", deleteCoachController);

router.get("/daily-content", getDailyContentAdmin);
router.get("/daily-content/overrides", listOverridesAdmin);
router.post("/daily-content/override", createOverride);
router.patch("/daily-content/:id", updateOverride);
router.delete("/daily-content/:id", removeOverride);

router.get("/dashboard/summary", getAdminDashboardSummary);
router.get("/dashboard/steps", getAdminStepsTrend);
router.get("/dashboard/calories", getAdminCaloriesTrend);
router.get("/dashboard/weight", getAdminWeightTrend);
router.get("/dashboard/nutrition", getAdminNutritionOverview);

router.get("/workouts", listWorkoutsController);
router.post("/workouts", createWorkoutController);
router.get("/foods", listFoodsController);
router.post("/foods", createFoodController);

export default router;
