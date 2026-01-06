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
const normalizeDayOfWeek = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0 || parsed > 6) return null;
  return parsed;
};

const getWeekStart = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return getWeekStart(new Date());
  }
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getWeekEnd = (weekStart) => {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const resolveWeekDays = ({ dayOfWeek, applyToWeek }) => {
  if (applyToWeek) {
    return [0, 1, 2, 3, 4, 5, 6];
  }
  const normalized = normalizeDayOfWeek(dayOfWeek);
  if (normalized !== null) {
    return [normalized];
  }
  return [new Date().getDay()];
};
const getObjectIdDate = (value) => {
  if (!value) return null;
  const hex = value.toString().slice(0, 8);
  if (hex.length < 8) return null;
  const seconds = parseInt(hex, 16);
  if (Number.isNaN(seconds)) return null;
  return new Date(seconds * 1000);
};

const normalizeAssignedAt = (item) => {
  const createdAt = getObjectIdDate(item._id);
  if (!item.assignedAt && createdAt) {
    item.assignedAt = createdAt;
    return;
  }
  if (createdAt && item.assignedAt) {
    const assignedTime = new Date(item.assignedAt).getTime();
    const createdTime = createdAt.getTime();
    if (assignedTime - createdTime > 1000 * 60 * 60) {
      item.assignedAt = createdAt;
    }
  }
  if (item.completedAt && item.assignedAt) {
    const completedTime = new Date(item.completedAt).getTime();
    const assignedTime = new Date(item.assignedAt).getTime();
    if (assignedTime > completedTime) {
      item.assignedAt = item.completedAt;
    }
  }
  if (item.assignedAt && item.dayOfWeek === undefined) {
    item.dayOfWeek = new Date(item.assignedAt).getDay();
  }
};

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
  workoutIds,
  notes,
  duration,
  weekStart,
  dayOfWeek,
  applyToWeek
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

  const ids = Array.isArray(workoutIds)
    ? workoutIds
    : workoutId
      ? [workoutId]
      : [];
  if (!ids.length) {
    throw new Error("Workout selection is required");
  }

  const workouts = await WorkoutApi.find({ _id: { $in: ids } }).lean();
  if (!workouts.length) {
    throw new Error("Workout not found");
  }

  const weekStartDate = getWeekStart(weekStart);
  const weekEndDate = getWeekEnd(weekStartDate);
  const targetDays = resolveWeekDays({ dayOfWeek, applyToWeek });

  const planItems = [];
  const normalizedDuration = toNumber(duration);
  workouts.forEach((workout) => {
    targetDays.forEach((day) => {
      planItems.push({
        workoutId: workout._id?.toString(),
        workoutName: workout.workoutName,
        category: workout.category,
        unit: workout.unit,
        caloriesPerMin: toNumber(workout.caloriesPerMin),
        caloriesPerRep: toNumber(workout.caloriesPerRep),
        duration: normalizedDuration || null,
        dayOfWeek: day,
        assignedAt: new Date(),
        status: "assigned",
        completedAt: null
      });
    });
  });

  const shouldResetPlan =
    client.workoutPlan?.weekStart &&
    new Date(client.workoutPlan.weekStart).toDateString() !==
      weekStartDate.toDateString();
  const existingItems = shouldResetPlan ? [] : client.workoutPlan?.items || [];

  const uniqueItemsMap = new Map(
    existingItems.map((item) => {
      normalizeAssignedAt(item);
      const key = `${item.workoutId}-${item.dayOfWeek ?? "na"}`;
      return [key, item];
    })
  );
  planItems.forEach((item) => {
    const key = `${item.workoutId}-${item.dayOfWeek ?? "na"}`;
    if (uniqueItemsMap.has(key)) {
      const existing = uniqueItemsMap.get(key);
      if (!existing.duration && item.duration) {
        existing.duration = item.duration;
      }
      return;
    }
    uniqueItemsMap.set(key, item);
  });
  const uniqueItems = Array.from(uniqueItemsMap.values());
  const totalDuration = uniqueItems.reduce(
    (sum, item) => sum + (Number(item.duration) || 0),
    0
  );

  client.workoutPlan = {
    name:
      uniqueItems.length > 1
        ? "Custom Plan"
        : uniqueItems[0]?.workoutName || client.workoutPlan?.name,
    duration:
      totalDuration ||
      normalizedDuration ||
      toNumber(workouts[0]?.typicalRepsPerMin) ||
      client.workoutPlan?.duration,
    notes: notes || client.workoutPlan?.notes,
    status: "assigned",
    completedAt: null,
    exercises: client.workoutPlan?.exercises || [],
    weekStart: weekStartDate,
    weekEnd: weekEndDate,
    items: uniqueItems,
    assignedAt: new Date()
  };

  await client.save();
  return client;
};

export const updateWorkoutStatus = async ({
  clientId,
  tenantId,
  status,
  itemId
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
  if (itemId) {
    const item = client.workoutPlan.items?.find(
      (entry) =>
        `${entry._id}` === `${itemId}` || `${entry.workoutId}` === `${itemId}`
    );
    if (!item) {
      throw new Error("Workout item not found");
    }
    item.status = normalized;
    item.completedAt = normalized === "completed" ? new Date() : null;
    const allCompleted = client.workoutPlan.items?.every(
      (entry) => entry.status === "completed"
    );
    client.workoutPlan.status = allCompleted ? "completed" : "assigned";
    client.workoutPlan.completedAt = allCompleted ? new Date() : null;
  } else {
    client.workoutPlan.status = normalized;
    client.workoutPlan.completedAt =
      normalized === "completed" ? new Date() : null;
  }
  await client.save();
  return client;
};

export const assignMealToClient = async ({
  clientId,
  tenantId,
  foodId,
  foodIds,
  mealType,
  notes,
  weekStart,
  dayOfWeek,
  applyToWeek
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

  const ids = Array.isArray(foodIds) ? foodIds : foodId ? [foodId] : [];
  if (!ids.length) {
    throw new Error("Food selection is required");
  }

  const foods = await FoodApi.find({ _id: { $in: ids } }).lean();
  if (!foods.length) {
    throw new Error("Food item not found");
  }

  const normalizedMealType = (mealType || "other").toLowerCase();
  const safeMealType = [
    "breakfast",
    "morning_snack",
    "lunch",
    "evening_snack",
    "dinner",
    "snacks"
  ].includes(normalizedMealType)
    ? normalizedMealType
    : "other";

  const weekStartDate = getWeekStart(weekStart);
  const weekEndDate = getWeekEnd(weekStartDate);
  const targetDays = resolveWeekDays({ dayOfWeek, applyToWeek });

  const planItems = [];
  foods.forEach((food) => {
    targetDays.forEach((day) => {
      planItems.push({
        foodId: food._id?.toString(),
        foodName: food.food_name,
        mealType: safeMealType,
        dayOfWeek: day,
        energyKcal: toNumber(food.energy_kcal),
        carbs: toNumber(food.carb_g),
        protein: toNumber(food.protein_g),
        fat: toNumber(food.fat_g),
        servingsUnit: food.servings_unit,
        imageUrl: food.food_image,
        assignedAt: new Date(),
        status: "assigned",
        completedAt: null
      });
    });
  });

  const shouldResetPlan =
    client.mealPlan?.weekStart &&
    new Date(client.mealPlan.weekStart).toDateString() !==
      weekStartDate.toDateString();
  const existingItems = shouldResetPlan ? [] : client.mealPlan?.items || [];

  const uniqueItemsMap = new Map(
    existingItems.map((item) => {
      normalizeAssignedAt(item);
      const key = `${item.foodId}-${item.mealType}-${item.dayOfWeek ?? "na"}`;
      return [key, item];
    })
  );
  planItems.forEach((item) => {
    const key = `${item.foodId}-${item.mealType}-${item.dayOfWeek ?? "na"}`;
    if (!uniqueItemsMap.has(key)) {
      uniqueItemsMap.set(key, item);
    }
  });
  const uniqueItems = Array.from(uniqueItemsMap.values());
  const totalCalories = uniqueItems.reduce(
    (sum, item) => sum + (Number(item.energyKcal) || 0),
    0
  );

  client.mealPlan = {
    name:
      uniqueItems.length > 1
        ? "Custom Plan"
        : uniqueItems[0]?.foodName || client.mealPlan?.name,
    calories: totalCalories ? `${Math.round(totalCalories)}` : "",
    notes: notes || client.mealPlan?.notes,
    status: "assigned",
    completedAt: null,
    items: uniqueItems,
    weekStart: weekStartDate,
    weekEnd: weekEndDate,
    assignedAt: new Date()
  };

  await client.save();
  return client;
};

export const updateMealStatus = async ({
  clientId,
  tenantId,
  status,
  itemId
}) => {
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
  if (itemId) {
    const item = client.mealPlan.items?.find(
      (entry) => `${entry._id}` === `${itemId}` || `${entry.foodId}` === `${itemId}`
    );
    if (!item) {
      throw new Error("Meal item not found");
    }
    item.status = normalized;
    item.completedAt = normalized === "completed" ? new Date() : null;
    const allCompleted = client.mealPlan.items?.every(
      (entry) => entry.status === "completed"
    );
    client.mealPlan.status = allCompleted ? "completed" : "assigned";
    client.mealPlan.completedAt = allCompleted ? new Date() : null;
  } else {
    client.mealPlan.status = normalized;
    client.mealPlan.completedAt = normalized === "completed" ? new Date() : null;
  }
  await client.save();
  return client;
};
