import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  searchFoodLibraryController,
  searchWorkoutLibraryController
} from "../controllers/libraryController.js";

const router = Router();

router.get(
  "/workouts",
  authenticate,
  authorizeRoles("coach", "superadmin"),
  searchWorkoutLibraryController
);

router.get(
  "/foods",
  authenticate,
  authorizeRoles("coach", "superadmin"),
  searchFoodLibraryController
);

export default router;
