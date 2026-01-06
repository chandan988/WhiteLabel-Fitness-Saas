import { MobileUser } from "../models/MobileUser.js";
import { StepsEntry } from "../models/StepsEntry.js";
import { FoodLog } from "../models/FoodLog.js";
import { WeightEntry } from "../models/WeightEntry.js";
import { WaterEntry } from "../models/WaterEntry.js";
import { SleepEntry } from "../models/SleepEntry.js";
import { DailyWorkout } from "../models/DailyWorkout.js";

const toDateKey = (date) => date.toISOString().slice(0, 10);

const getAllClientUserIds = async () => {
  const users = await MobileUser.find({
    tenantId: { $exists: true, $ne: null }
  })
    .select("_id")
    .lean();
  return users.map((user) => user._id);
};

export const getGlobalDashboardSummary = async () => {
  const userIds = await getAllClientUserIds();
  if (!userIds.length) {
    return { today: {}, totals: {} };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayKey = toDateKey(today);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekKey = toDateKey(weekStart);

  const [stepsToday, foodToday, waterToday, sleepToday, workoutToday] =
    await Promise.all([
      StepsEntry.aggregate([
        { $match: { userId: { $in: userIds }, date: todayKey } },
        { $group: { _id: null, value: { $sum: "$totalSteps" } } }
      ]),
      FoodLog.aggregate([
        { $match: { user: { $in: userIds } } },
        {
          $addFields: {
            dateKey: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: { $ifNull: ["$date", "$createdAt"] }
              }
            }
          }
        },
        { $match: { dateKey: todayKey } },
        { $group: { _id: null, value: { $sum: "$dailyTotals.calories" } } }
      ]),
      WaterEntry.aggregate([
        { $match: { userId: { $in: userIds }, date: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, value: { $sum: "$amount" } } }
      ]),
      SleepEntry.aggregate([
        {
          $match: {
            userId: { $in: userIds },
            $or: [
              { date: { $gte: today, $lt: tomorrow } },
              { sleep_time: { $gte: today, $lt: tomorrow } }
            ]
          }
        },
        {
          $project: {
            hours: {
              $divide: [
                { $subtract: ["$wake_time", "$sleep_time"] },
                1000 * 60 * 60
              ]
            }
          }
        },
        { $group: { _id: null, value: { $avg: "$hours" } } }
      ]),
      DailyWorkout.aggregate([
        {
          $match: {
            userId: { $in: userIds },
            $or: [
              { date: todayKey },
              { dateObj: { $gte: today, $lt: tomorrow } }
            ]
          }
        },
        {
          $project: {
            calories: {
              $ifNull: ["$dailyStats.calories", "$dailyStats.caloriesBurned"]
            },
            sessions: { $size: { $ifNull: ["$workouts", []] } }
          }
        },
        {
          $group: {
            _id: null,
            caloriesBurned: { $sum: "$calories" },
            workoutsCompleted: { $sum: "$sessions" }
          }
        }
      ])
    ]);

  const [stepsWeek, foodWeek, waterWeek, sleepWeek, workoutWeek] =
    await Promise.all([
      StepsEntry.aggregate([
        { $match: { userId: { $in: userIds }, date: { $gte: weekKey } } },
        { $group: { _id: null, value: { $sum: "$totalSteps" } } }
      ]),
      FoodLog.aggregate([
        { $match: { user: { $in: userIds } } },
        {
          $addFields: {
            dateKey: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: { $ifNull: ["$date", "$createdAt"] }
              }
            }
          }
        },
        { $match: { dateKey: { $gte: weekKey } } },
        { $group: { _id: null, value: { $sum: "$dailyTotals.calories" } } }
      ]),
      WaterEntry.aggregate([
        { $match: { userId: { $in: userIds }, date: { $gte: weekStart, $lt: tomorrow } } },
        { $group: { _id: null, value: { $sum: "$amount" } } }
      ]),
      SleepEntry.aggregate([
        {
          $match: {
            userId: { $in: userIds },
            $or: [
              { date: { $gte: weekStart, $lt: tomorrow } },
              { sleep_time: { $gte: weekStart, $lt: tomorrow } }
            ]
          }
        },
        {
          $project: {
            hours: {
              $divide: [
                { $subtract: ["$wake_time", "$sleep_time"] },
                1000 * 60 * 60
              ]
            }
          }
        },
        { $group: { _id: null, value: { $avg: "$hours" } } }
      ]),
      DailyWorkout.aggregate([
        {
          $match: {
            userId: { $in: userIds },
            $or: [
              { dateObj: { $gte: weekStart, $lt: tomorrow } },
              { date: { $gte: weekKey } }
            ]
          }
        },
        {
          $project: {
            calories: {
              $ifNull: ["$dailyStats.calories", "$dailyStats.caloriesBurned"]
            },
            sessions: { $size: { $ifNull: ["$workouts", []] } }
          }
        },
        {
          $group: {
            _id: null,
            caloriesBurned: { $sum: "$calories" },
            workoutsCompleted: { $sum: "$sessions" }
          }
        }
      ])
    ]);

  return {
    today: {
      caloriesBurned: workoutToday[0]?.caloriesBurned || 0,
      steps: stepsToday[0]?.value || 0,
      caloriesIntake: foodToday[0]?.value || 0,
      waterIntake: waterToday[0]?.value || 0,
      sleepHours: Math.round((sleepToday[0]?.value || 0) * 10) / 10,
      workoutsCompleted: workoutToday[0]?.workoutsCompleted || 0
    },
    totals: {
      caloriesBurned: workoutWeek[0]?.caloriesBurned || 0,
      steps: stepsWeek[0]?.value || 0,
      caloriesIntake: foodWeek[0]?.value || 0,
      waterIntake: waterWeek[0]?.value || 0,
      sleepHours: Math.round((sleepWeek[0]?.value || 0) * 10) / 10,
      workoutsCompleted: workoutWeek[0]?.workoutsCompleted || 0
    }
  };
};

export const getGlobalStepsTrend = async () => {
  const userIds = await getAllClientUserIds();
  if (!userIds.length) return [];
  return StepsEntry.aggregate([
    { $match: { userId: { $in: userIds } } },
    { $group: { _id: "$date", value: { $sum: "$totalSteps" } } },
    { $sort: { _id: 1 } }
  ]);
};

export const getGlobalCaloriesTrend = async () => {
  const userIds = await getAllClientUserIds();
  if (!userIds.length) return [];
  return FoodLog.aggregate([
    { $match: { user: { $in: userIds } } },
    {
      $addFields: {
        dateKey: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: { $ifNull: ["$date", "$createdAt"] }
          }
        }
      }
    },
    { $group: { _id: "$dateKey", value: { $sum: "$dailyTotals.calories" } } },
    { $sort: { _id: 1 } }
  ]);
};

export const getGlobalWeightTrend = async () => {
  const userIds = await getAllClientUserIds();
  if (!userIds.length) return [];
  return WeightEntry.aggregate([
    { $match: { userId: { $in: userIds } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        value: { $avg: "$weight" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

export const getGlobalNutritionOverview = async () => {
  const userIds = await getAllClientUserIds();
  if (!userIds.length) return [];
  return FoodLog.aggregate([
    { $match: { user: { $in: userIds } } },
    {
      $addFields: {
        dateKey: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: { $ifNull: ["$date", "$createdAt"] }
          }
        }
      }
    },
    {
      $group: {
        _id: "$dateKey",
        calories: { $sum: "$dailyTotals.calories" },
        meals: { $sum: { $size: "$meals" } }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};
