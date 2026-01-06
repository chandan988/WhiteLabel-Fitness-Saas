import mongoose from "mongoose";

const StepsEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: String,
    totalSteps: Number,
    stepRecords: Array,
    calories: Number,
    distanceMeters: Number,
    goalSteps: Number,
    moveMinutes: Number
  },
  { strict: false, collection: "steps" }
);

export const StepsEntry = mongoose.model("StepsEntry", StepsEntrySchema);
