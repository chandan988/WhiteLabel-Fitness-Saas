import { DailyActivity } from "../models/DailyActivity.js";
import { StepsLog } from "../models/StepsLog.js";
import { WeightLog } from "../models/WeightLog.js";
import { NutritionLog } from "../models/NutritionLog.js";
import { logger } from "../utils/logger.js";

export const getDashboardSummary = async ({ tenantId }) => {
  logger.info("dashboardService.getDashboardSummary", { tenantId });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const summary = await DailyActivity.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: null,
        caloriesBurned: { $sum: "$caloriesBurned" },
        steps: { $sum: "$steps" },
        caloriesIntake: { $sum: "$caloriesIntake" },
        waterIntake: { $sum: "$waterIntake" },
        sleepHours: { $avg: "$sleepHours" },
        workoutsCompleted: { $sum: "$workoutsCompleted" }
      }
    }
  ]);

  const todayMetrics = await DailyActivity.findOne({
    tenantId,
    date: { $gte: today }
  }).sort({ date: -1 });

  return {
    today: todayMetrics || {},
    totals: summary[0] || {}
  };
};

export const getStepsTrend = async ({ tenantId }) => {
  logger.info("dashboardService.getStepsTrend", { tenantId });
  return StepsLog.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        value: { $sum: "$steps" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

export const getCaloriesTrend = async ({ tenantId }) => {
  logger.info("dashboardService.getCaloriesTrend", { tenantId });
  return DailyActivity.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        value: { $avg: "$caloriesIntake" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

export const getWeightTrend = async ({ tenantId }) => {
  logger.info("dashboardService.getWeightTrend", { tenantId });
  return WeightLog.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        value: { $avg: "$weight" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

export const getNutritionOverview = async ({ tenantId }) => {
  logger.info("dashboardService.getNutritionOverview", { tenantId });
  return NutritionLog.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        calories: { $sum: "$totalCalories" },
        meals: { $sum: { $size: "$meals" } }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};
