import { Router } from "express";
import { getDailyContent } from "../controllers/dailyContentController.js";

const router = Router();

router.get("/daily", getDailyContent);

export default router;
