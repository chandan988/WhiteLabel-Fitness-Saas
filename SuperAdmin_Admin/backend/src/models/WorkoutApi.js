import mongoose from "mongoose";

const WorkoutApiSchema = new mongoose.Schema(
  {
    workoutName: String,
    category: String,
    subcategory: String,
    unit: String,
    caloriesPerMin: Number,
    caloriesPerRep: Number,
    typicalRepsPerMin: Number,
    notes: String
  },
  { strict: false, collection: "workoutapis" }
);

export const WorkoutApi = mongoose.model("WorkoutApi", WorkoutApiSchema);
