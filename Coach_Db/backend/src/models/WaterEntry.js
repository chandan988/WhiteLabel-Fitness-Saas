import mongoose from "mongoose";

const WaterEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    date: Date
  },
  { strict: false, collection: "waters" }
);

export const WaterEntry = mongoose.model("WaterEntry", WaterEntrySchema);
