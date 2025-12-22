import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    goals: [String],
    tags: [String],
    mealPlan: {
      name: String,
      calories: String,
      notes: String,
      assignedAt: Date
    },
    workoutPlan: {
      name: String,
      duration: Number,
      exercises: [
        {
          name: String,
          sets: Number,
          reps: Number
        }
      ],
      assignedAt: Date
    },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Client = mongoose.model("Client", ClientSchema);
