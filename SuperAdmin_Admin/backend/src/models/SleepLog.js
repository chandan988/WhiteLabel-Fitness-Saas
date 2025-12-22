import mongoose from "mongoose";

const SleepLogSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    date: { type: Date, default: Date.now },
    hours: Number,
    quality: { type: String, enum: ["poor", "fair", "good", "excellent"], default: "good" }
  },
  { timestamps: true }
);

export const SleepLog = mongoose.model("SleepLog", SleepLogSchema);
