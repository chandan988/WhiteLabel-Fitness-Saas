import mongoose from "mongoose";

const StepsLogSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    date: { type: Date, default: Date.now },
    steps: Number,
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

StepsLogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const StepsLog = mongoose.model("StepsLog", StepsLogSchema);
