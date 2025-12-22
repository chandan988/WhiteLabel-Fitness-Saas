import {
  getCaloriesTrend,
  getDashboardSummary,
  getNutritionOverview,
  getStepsTrend,
  getWeightTrend
} from "../services/dashboardService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export const dashboardSummaryController = asyncHandler(async (req, res) => {
  logger.info("Fetching dashboard summary", { tenantId: req.user.tenantId });
  const data = await getDashboardSummary({ tenantId: req.user.tenantId });
  res.json(data);
});

export const dashboardStepsController = asyncHandler(async (req, res) => {
  logger.info("Fetching dashboard steps", { tenantId: req.user.tenantId });
  const data = await getStepsTrend({ tenantId: req.user.tenantId });
  res.json(data);
});

export const dashboardCaloriesController = asyncHandler(async (req, res) => {
  logger.info("Fetching dashboard calories", { tenantId: req.user.tenantId });
  const data = await getCaloriesTrend({ tenantId: req.user.tenantId });
  res.json(data);
});

export const dashboardWeightController = asyncHandler(async (req, res) => {
  logger.info("Fetching dashboard weight", { tenantId: req.user.tenantId });
  const data = await getWeightTrend({ tenantId: req.user.tenantId });
  res.json(data);
});

export const dashboardNutritionController = asyncHandler(async (req, res) => {
  logger.info("Fetching dashboard nutrition", { tenantId: req.user.tenantId });
  const data = await getNutritionOverview({ tenantId: req.user.tenantId });
  res.json(data);
});
