import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listWorkouts,
  createWorkout,
  listFoods,
  createFood
} from "../services/adminCatalogService.js";

export const listWorkoutsController = asyncHandler(async (req, res) => {
  const workouts = await listWorkouts({
    search: req.query.search || req.query.q,
    limit: req.query.limit
  });
  res.json(workouts);
});

export const createWorkoutController = asyncHandler(async (req, res) => {
  const workout = await createWorkout(req.body);
  res.status(201).json(workout);
});

export const listFoodsController = asyncHandler(async (req, res) => {
  const foods = await listFoods({
    search: req.query.search || req.query.q,
    limit: req.query.limit
  });
  res.json(foods);
});

export const createFoodController = asyncHandler(async (req, res) => {
  const food = await createFood(req.body);
  res.status(201).json(food);
});
