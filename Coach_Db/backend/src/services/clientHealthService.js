import { Client } from "../models/Client.js";
import { User } from "../models/User.js";
import { DailyWorkout } from "../models/DailyWorkout.js";
import { FoodLog } from "../models/FoodLog.js";
import { SleepEntry } from "../models/SleepEntry.js";
import { StepsEntry } from "../models/StepsEntry.js";
import { WaterEntry } from "../models/WaterEntry.js";
import { WeightEntry } from "../models/WeightEntry.js";
import { WorkoutApi } from "../models/WorkoutApi.js";
import { FoodApi } from "../models/FoodApi.js";
import { logger } from "../utils/logger.js";

const toNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

const getUserIdForClient = async (client) => {
  if (client.userId) {
    return client.userId;
  }
  if (!client.email) {
    return null;
  }
  const user = await User.findOne({ email: client.email })
    .select("_id")
    .lean();
  if (!user?._id) {
    return null;
  }
  client.userId = user._id;
  await client.save();
  return user._id;
};

const getLatestSleepHours = (sleepEntry) => {
  if (!sleepEntry?.sleep_time || !sleepEntry?.wake_time) {
    return null;
  }
  const start = new Date(sleepEntry.sleep_time).getTime();
  const end = new Date(sleepEntry.wake_time).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return null;
  }
  const hours = (end - start) / (1000 * 60 * 60);
  return Math.round(hours * 10) / 10;
};

export const getClientHealth = async ({ clientId, tenantId, limit }) => {
  logger.info("clientHealthService.getClientHealth", { clientId, tenantId });
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error("Client not found");
  }
  if (`${client.tenantId}` !== `${tenantId}`) {
    throw new Error("You cannot access this client");
  }

  const userId = await getUserIdForClient(client);
  if (!userId) {
    return {
      clientId: client._id.toString(),
      userId: null,
      summary: {},
      logs: {
        workouts: [],
        foods: [],
        sleeps: [],
        steps: [],
        waters: [],
        weights: []
      }
    };
  }

  const take = Number.isFinite(Number(limit)) ? Math.min(Number(limit), 60) : 45;

  const [workouts, foods, sleeps, steps, waters, weights] = await Promise.all([
    DailyWorkout.find({ userId })
      .sort({ dateObj: -1, date: -1 })
      .limit(take)
      .lean(),
    FoodLog.find({ user: userId })
      .sort({ createdAt: -1, date: -1 })
      .limit(take)
      .lean(),
    SleepEntry.find({ userId })
      .sort({ date: -1, sleep_time: -1 })
      .limit(take)
      .lean(),
    StepsEntry.find({ userId })
      .sort({ date: -1 })
      .limit(take)
      .lean(),
    WaterEntry.find({ userId })
      .sort({ date: -1 })
      .limit(take)
      .lean(),
    WeightEntry.find({ userId })
      .sort({ date: -1 })
      .limit(take)
      .lean()
  ]);

  const latestWeight = weights?.[0]?.weight ?? null;
  const latestSteps = steps?.[0]?.totalSteps ?? null;
  const latestWater = waters?.[0]?.amount ?? null;
  const latestSleep = getLatestSleepHours(sleeps?.[0]);
  const latestFood = foods?.[0]?.dailyTotals || null;
  const latestWorkoutCount = workouts?.[0]?.workouts?.length ?? null;

  return {
    clientId: client._id.toString(),
    userId: userId.toString(),
    summary: {
      latestWeight,
      latestSteps,
      latestWater,
      latestSleep,
      latestFood,
      latestWorkoutCount
    },
    logs: {
      workouts,
      foods,
      sleeps,
      steps,
      waters,
      weights
    }
  };
};

export const assignWorkoutToClient = async ({
  clientId,
  tenantId,
  workoutId,
  notes,
  duration
}) => {
  logger.info("clientHealthService.assignWorkoutToClient", {
    clientId,
    tenantId,
    workoutId
  });
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error("Client not found");
  }
  if (`${client.tenantId}` !== `${tenantId}`) {
    throw new Error("You cannot update this client");
  }

  const workout = await WorkoutApi.findById(workoutId).lean();
  if (!workout) {
    throw new Error("Workout not found");
  }

  const planItem = {
    workoutId: workout._id?.toString(),
    workoutName: workout.workoutName,
    category: workout.category,
    unit: workout.unit,
    caloriesPerMin: toNumber(workout.caloriesPerMin),
    caloriesPerRep: toNumber(workout.caloriesPerRep)
  };

  client.workoutPlan = {
    name: workout.workoutName,
    duration:
      toNumber(duration) ||
      toNumber(workout.typicalRepsPerMin) ||
      client.workoutPlan?.duration,
    notes: notes || client.workoutPlan?.notes,
    status: "assigned",
    completedAt: null,
    items: [planItem],
    assignedAt: new Date()
  };

  await client.save();
  return client;
};

export const updateWorkoutStatus = async ({
  clientId,
  tenantId,
  status
}) => {
  logger.info("clientHealthService.updateWorkoutStatus", {
    clientId,
    tenantId,
    status
  });
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error("Client not found");
  }
  if (`${client.tenantId}` !== `${tenantId}`) {
    throw new Error("You cannot update this client");
  }
  if (!client.workoutPlan?.name) {
    throw new Error("No workout plan assigned");
  }
  const normalized = status === "completed" ? "completed" : "assigned";
  client.workoutPlan.status = normalized;
  client.workoutPlan.completedAt =
    normalized === "completed" ? new Date() : null;
  await client.save();
  return client;
};

export const assignMealToClient = async ({
  clientId,
  tenantId,
  foodId,
  notes
}) => {
  logger.info("clientHealthService.assignMealToClient", {
    clientId,
    tenantId,
    foodId
  });
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error("Client not found");
  }
  if (`${client.tenantId}` !== `${tenantId}`) {
    throw new Error("You cannot update this client");
  }

  const food = await FoodApi.findById(foodId).lean();
  if (!food) {
    throw new Error("Food item not found");
  }

  const planItem = {
    foodId: food._id?.toString(),
    foodName: food.food_name,
    energyKcal: toNumber(food.energy_kcal),
    carbs: toNumber(food.carb_g),
    protein: toNumber(food.protein_g),
    fat: toNumber(food.fat_g),
    servingsUnit: food.servings_unit,
    imageUrl: food.food_image
  };

  client.mealPlan = {
    name: food.food_name,
    calories: `${toNumber(food.energy_kcal) || ""}`,
    notes: notes || client.mealPlan?.notes,
    status: "assigned",
    completedAt: null,
    items: [planItem],
    assignedAt: new Date()
  };

  await client.save();
  return client;
};

export const updateMealStatus = async ({ clientId, tenantId, status }) => {
  logger.info("clientHealthService.updateMealStatus", {
    clientId,
    tenantId,
    status
  });
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error("Client not found");
  }
  if (`${client.tenantId}` !== `${tenantId}`) {
    throw new Error("You cannot update this client");
  }
  if (!client.mealPlan?.name) {
    throw new Error("No meal plan assigned");
  }
  const normalized = status === "completed" ? "completed" : "assigned";
  client.mealPlan.status = normalized;
  client.mealPlan.completedAt = normalized === "completed" ? new Date() : null;
  await client.save();
  return client;
};
