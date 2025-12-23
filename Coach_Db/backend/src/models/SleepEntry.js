import mongoose from "mongoose";

const SleepEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sleep_time: Date,
    wake_time: Date,
    date: Date
  },
  { strict: false, collection: "sleeps" }
);

export const SleepEntry = mongoose.model("SleepEntry", SleepEntrySchema);
