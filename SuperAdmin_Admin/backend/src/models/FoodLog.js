import mongoose from "mongoose";

const FoodLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: Date,
    meals: Array,
    dailyTotals: Object
  },
  { strict: false, collection: "foodlogs" }
);

export const FoodLog = mongoose.model("FoodLog", FoodLogSchema);
