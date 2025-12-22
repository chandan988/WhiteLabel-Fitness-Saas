import mongoose from "mongoose";

const DailyActivitySchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    date: { type: Date, default: Date.now },
    caloriesBurned: Number,
    caloriesIntake: Number,
    waterIntake: Number,
    sleepHours: Number,
    workoutsCompleted: Number
  },
  { timestamps: true }
);

export const DailyActivity = mongoose.model("DailyActivity", DailyActivitySchema);
