import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";
import { searchFoods, searchWorkouts } from "../services/libraryService.js";

export const searchWorkoutLibraryController = asyncHandler(async (req, res) => {
  logger.info("searchWorkoutLibraryController", { query: req.query.q });
  const workouts = await searchWorkouts({
    query: req.query.q,
    page: req.query.page,
    limit: req.query.limit
  });
  res.json(workouts);
});

export const searchFoodLibraryController = asyncHandler(async (req, res) => {
  logger.info("searchFoodLibraryController", { query: req.query.q });
  const foods = await searchFoods({
    query: req.query.q,
    page: req.query.page,
    limit: req.query.limit
  });
  res.json(foods);
});
