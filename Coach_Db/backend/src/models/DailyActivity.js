import mongoose from "mongoose";

const DailyActivitySchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    date: { type: Date, default: Date.now },
    caloriesBurned: Number,
    steps: Number,
    caloriesIntake: Number,
    waterIntake: Number,
    sleepHours: Number,
    workoutsCompleted: Number,
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

DailyActivitySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const DailyActivity = mongoose.model(
  "DailyActivity",
  DailyActivitySchema
);
