import mongoose from "mongoose";

const SleepEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: Date,
    sleep_time: Date,
    wake_time: Date
  },
  { strict: false, collection: "sleeps" }
);

export const SleepEntry = mongoose.model("SleepEntry", SleepEntrySchema);
