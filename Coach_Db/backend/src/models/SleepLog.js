import mongoose from "mongoose";

const SleepLogSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    date: { type: Date, default: Date.now },
    hours: Number,
    quality: {
      type: String,
      enum: ["poor", "fair", "good", "excellent"],
      default: "good"
    },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

SleepLogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const SleepLog = mongoose.model("SleepLog", SleepLogSchema);
