import mongoose from "mongoose";

const StepsLogSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    date: { type: Date, default: Date.now },
    steps: Number
  },
  { timestamps: true }
);

export const StepsLog = mongoose.model("StepsLog", StepsLogSchema);
