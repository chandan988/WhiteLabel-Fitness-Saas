import { Router } from "express";
import {
  createTenantController,
  getTenantBySlugController,
  getTenantController,
  updateTenantController
} from "../controllers/tenantController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/slug/:slug", getTenantBySlugController);

router.post(
  "/",
  authenticate,
  authorizeRoles("superadmin"),
  createTenantController
);

router.get("/:id", authenticate, getTenantController);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("superadmin", "coach"),
  updateTenantController
);

export default router;
