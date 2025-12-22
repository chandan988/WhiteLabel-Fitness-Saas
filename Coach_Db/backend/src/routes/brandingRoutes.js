import { Router } from "express";
import { brandingController } from "../controllers/brandingController.js";

const router = Router();

router.get("/", brandingController);

export default router;
