import mongoose from "mongoose";

const WorkoutLibrarySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    duration: Number,
    exercises: [
      {
        name: String,
        sets: Number,
        reps: Number
      }
    ],
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

WorkoutLibrarySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const WorkoutLibrary = mongoose.model(
  "WorkoutLibrary",
  WorkoutLibrarySchema
);
