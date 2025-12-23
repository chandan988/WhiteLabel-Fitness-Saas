import mongoose from "mongoose";

const DailyWorkoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: String,
    dateObj: Date,
    workouts: Array,
    dailyStats: Object,
    createdAt: Date,
    updatedAt: Date
  },
  { strict: false, collection: "dailyworkouts" }
);

export const DailyWorkout = mongoose.model("DailyWorkout", DailyWorkoutSchema);
