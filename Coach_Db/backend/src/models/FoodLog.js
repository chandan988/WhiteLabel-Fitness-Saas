import mongoose from "mongoose";

const FoodLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: String,
    meals: Array,
    dailyTotals: Object,
    createdAt: Date,
    updatedAt: Date
  },
  { strict: false, collection: "foodlogs" }
);

export const FoodLog = mongoose.model("FoodLog", FoodLogSchema);
