import { Router } from "express";
import {
  assignPricingPlanController,
  createPricingPlanController,
  deletePricingPlanController,
  listPricingPlansController,
  updatePricingPlanController
} from "../controllers/pricingController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("coach", "superadmin"));

router.get("/plans", listPricingPlansController);
router.post("/plans", createPricingPlanController);
router.patch("/plans/:id", updatePricingPlanController);
router.delete("/plans/:id", deletePricingPlanController);

router.post("/assign", assignPricingPlanController);

export default router;
