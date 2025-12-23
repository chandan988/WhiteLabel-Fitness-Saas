import mongoose from "mongoose";

const WeightEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: Date,
    weight: Number,
    photo: String,
    createdAt: Date,
    updatedAt: Date
  },
  { strict: false, collection: "weights" }
);

export const WeightEntry = mongoose.model("WeightEntry", WeightEntrySchema);
