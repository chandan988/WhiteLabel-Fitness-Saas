import { FoodApi } from "../models/FoodApi.js";
import { WorkoutApi } from "../models/WorkoutApi.js";
import { logger } from "../utils/logger.js";

const parseLimit = (limit) => {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 20;
  }
  return Math.min(parsed, 50);
};

const parsePage = (page) => {
  const parsed = Number(page);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }
  return parsed;
};

export const searchWorkouts = async ({ query, page, limit }) => {
  logger.info("libraryService.searchWorkouts", { query, page, limit });
  const perPage = parseLimit(limit);
  const currentPage = parsePage(page);
  const filters = query
    ? { workoutName: { $regex: query, $options: "i" } }
    : {};

  const workouts = await WorkoutApi.find(filters)
    .select("workoutName category subcategory unit caloriesPerMin caloriesPerRep")
    .sort({ workoutName: 1 })
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .lean();

  return workouts.map((workout) => ({
    id: workout._id?.toString(),
    workoutName: workout.workoutName,
    category: workout.category,
    subcategory: workout.subcategory,
    unit: workout.unit,
    caloriesPerMin: workout.caloriesPerMin,
    caloriesPerRep: workout.caloriesPerRep
  }));
};

export const searchFoods = async ({ query, page, limit }) => {
  logger.info("libraryService.searchFoods", { query, page, limit });
  const perPage = parseLimit(limit);
  const currentPage = parsePage(page);
  const filters = query ? { food_name: { $regex: query, $options: "i" } } : {};

  const foods = await FoodApi.find(filters)
    .select(
      "food_code food_name food_image energy_kcal carb_g protein_g fat_g servings_unit"
    )
    .sort({ food_name: 1 })
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .lean();

  return foods.map((food) => ({
    id: food._id?.toString(),
    foodCode: food.food_code,
    foodName: food.food_name,
    foodImage: food.food_image,
    energyKcal: food.energy_kcal,
    carbs: food.carb_g,
    protein: food.protein_g,
    fat: food.fat_g,
    servingsUnit: food.servings_unit
  }));
};
