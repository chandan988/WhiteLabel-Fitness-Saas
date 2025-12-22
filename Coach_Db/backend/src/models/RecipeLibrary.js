import mongoose from "mongoose";

const RecipeLibrarySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    calories: Number,
    macros: {
      protein: Number,
      carbs: Number,
      fats: Number
    },
    ingredients: [String],
    instructions: String,
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

RecipeLibrarySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const RecipeLibrary = mongoose.model(
  "RecipeLibrary",
  RecipeLibrarySchema
);
