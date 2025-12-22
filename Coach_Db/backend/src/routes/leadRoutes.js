import { Router } from "express";
import {
  addLeadFollowUpController,
  convertLeadController,
  createLeadController,
  getLeadController,
  listLeadsController,
  revertLeadController,
  updateLeadController
} from "../controllers/leadController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("coach", "superadmin"));

router.get("/", listLeadsController);
router.get("/:id", getLeadController);
router.post("/", createLeadController);
router.patch("/:id", updateLeadController);
router.post("/:id/convert", convertLeadController);
router.post("/clients/:id/revert", revertLeadController);
router.post("/:id/followups", addLeadFollowUpController);

export default router;
