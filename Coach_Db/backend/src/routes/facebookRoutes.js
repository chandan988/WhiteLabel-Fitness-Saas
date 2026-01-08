import { Router } from "express";
import {
  disconnectFacebook,
  facebookCallback,
  facebookWebhookReceive,
  facebookWebhookVerify,
  getFacebookAuthUrl,
  getFacebookConnection
} from "../controllers/facebookController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/webhook", facebookWebhookVerify);
router.post("/webhook", facebookWebhookReceive);
router.get("/callback", facebookCallback);

router.use(authenticate, authorizeRoles("coach", "superadmin"));

router.get("/connect", getFacebookAuthUrl);
router.get("/connection", getFacebookConnection);
router.delete("/connection", disconnectFacebook);

export default router;
