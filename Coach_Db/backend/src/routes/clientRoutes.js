import { Router } from "express";
import {
  createClientController,
  getClientController,
  listClientsController,
  updateClientController
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

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("coach", "superadmin"),
  enforceTenant,
  updateClientController
);

export default router;
