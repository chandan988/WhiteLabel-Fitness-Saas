import { Router } from "express";
import {
  dashboardCaloriesController,
  dashboardNutritionController,
  dashboardStepsController,
  dashboardSummaryController,
  dashboardWeightController
} from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("coach"));

router.get("/summary", dashboardSummaryController);
router.get("/steps", dashboardStepsController);
router.get("/calories", dashboardCaloriesController);
router.get("/weight", dashboardWeightController);
router.get("/nutrition", dashboardNutritionController);

export default router;
