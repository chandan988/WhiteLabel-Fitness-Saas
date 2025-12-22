import mongoose from "mongoose";

const WeightLogSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    date: { type: Date, default: Date.now },
    weight: Number
  },
  { timestamps: true }
);

export const WeightLog = mongoose.model("WeightLog", WeightLogSchema);
