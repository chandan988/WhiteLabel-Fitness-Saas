import mongoose from "mongoose";

const NutritionLogSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    date: { type: Date, default: Date.now },
    meals: [
      {
        name: String,
        calories: Number,
        macros: {
          protein: Number,
          carbs: Number,
          fats: Number
        }
      }
    ],
    totalCalories: Number,
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

NutritionLogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const NutritionLog = mongoose.model("NutritionLog", NutritionLogSchema);
