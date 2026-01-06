import mongoose from "mongoose";

const FoodApiSchema = new mongoose.Schema(
  {
    food_code: String,
    food_name: String,
    food_image: String,
    primarysource: String,
    energy_kj: Number,
    energy_kcal: Number,
    carb_g: Number,
    protein_g: Number,
    fat_g: Number,
    fibre_g: Number,
    freesugar_g: Number,
    servings_unit: String
  },
  { strict: false, collection: "foodapi" }
);

export const FoodApi = mongoose.model("FoodApi", FoodApiSchema);
