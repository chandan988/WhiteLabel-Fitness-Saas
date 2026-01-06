import { WorkoutApi } from "../models/WorkoutApi.js";
import { FoodApi } from "../models/FoodApi.js";

const normalizeSearch = (value) => (value ? value.trim() : "");

export const listWorkouts = async ({ search, limit = 100 }) => {
  const q = normalizeSearch(search);
  const query = q
    ? {
        $or: [
          { workoutName: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } },
          { subcategory: { $regex: q, $options: "i" } }
        ]
      }
    : {};
  return WorkoutApi.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 100, 500))
    .lean();
};

export const createWorkout = async (payload) => {
  const workout = new WorkoutApi({
    workoutName: payload.workoutName,
    category: payload.category,
    subcategory: payload.subcategory || null,
    unit: payload.unit,
    caloriesPerMin: payload.caloriesPerMin,
    caloriesPerRep: payload.caloriesPerRep,
    typicalRepsPerMin: payload.typicalRepsPerMin,
    notes: payload.notes || null
  });
  return workout.save();
};

export const listFoods = async ({ search, limit = 100 }) => {
  const q = normalizeSearch(search);
  const query = q
    ? {
        $or: [
          { food_name: { $regex: q, $options: "i" } },
          { food_code: { $regex: q, $options: "i" } },
          { primarysource: { $regex: q, $options: "i" } }
        ]
      }
    : {};
  return FoodApi.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 100, 500))
    .lean();
};

export const createFood = async (payload) => {
  const food = new FoodApi({
    food_code: payload.food_code,
    food_name: payload.food_name,
    food_image: payload.food_image || "",
    primarysource: payload.primarysource || "manual",
    energy_kj: payload.energy_kj,
    energy_kcal: payload.energy_kcal,
    carb_g: payload.carb_g,
    protein_g: payload.protein_g,
    fat_g: payload.fat_g,
    fibre_g: payload.fibre_g,
    freesugar_g: payload.freesugar_g,
    servings_unit: payload.servings_unit
  });
  return food.save();
};
