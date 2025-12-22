import { Router } from "express";
import { listDueFollowUpsController } from "../controllers/leadController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("coach", "superadmin"));

router.get("/due", listDueFollowUpsController);

export default router;
