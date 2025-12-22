import mongoose from "mongoose";

const WeightLogSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    date: { type: Date, default: Date.now },
    weight: Number,
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

WeightLogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const WeightLog = mongoose.model("WeightLog", WeightLogSchema);
