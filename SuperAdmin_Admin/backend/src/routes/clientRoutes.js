import { Router } from "express";
import {
  createClientController,
  listClientsController,
  updateClientController
} from "../controllers/clientController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("coach", "superadmin"));

router.get("/", listClientsController);
router.post("/", createClientController);
router.patch("/:id", updateClientController);

export default router;
