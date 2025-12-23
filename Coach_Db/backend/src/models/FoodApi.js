import mongoose from "mongoose";

const FoodApiSchema = new mongoose.Schema(
  {
    food_code: String,
    food_name: String,
    food_image: String,
    energy_kcal: Number,
    carb_g: Number,
    protein_g: Number,
    fat_g: Number,
    servings_unit: String
  },
  { strict: false, collection: "foodapi" }
);

export const FoodApi = mongoose.model("FoodApi", FoodApiSchema);
