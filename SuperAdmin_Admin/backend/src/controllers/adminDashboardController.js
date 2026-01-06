import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getGlobalDashboardSummary,
  getGlobalStepsTrend,
  getGlobalCaloriesTrend,
  getGlobalWeightTrend,
  getGlobalNutritionOverview
} from "../services/adminDashboardService.js";

export const getAdminDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await getGlobalDashboardSummary();
  res.json(summary);
});

export const getAdminStepsTrend = asyncHandler(async (req, res) => {
  const data = await getGlobalStepsTrend();
  res.json(data);
});

export const getAdminCaloriesTrend = asyncHandler(async (req, res) => {
  const data = await getGlobalCaloriesTrend();
  res.json(data);
});

export const getAdminWeightTrend = asyncHandler(async (req, res) => {
  const data = await getGlobalWeightTrend();
  res.json(data);
});

export const getAdminNutritionOverview = asyncHandler(async (req, res) => {
  const data = await getGlobalNutritionOverview();
  res.json(data);
});
