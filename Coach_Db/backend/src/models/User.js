import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    name: String,
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["superadmin", "coach", "client", "consumer"],
      default: "client"
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    },
    mustResetPassword: { type: Boolean, default: false },
    profile: {
      businessName: String,
      city: String,
      clientCount: Number,
      services: [String],
      avatar: String
    },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: String,
    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetToken: String,
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    followUps: [
      {
        asked: String,
        response: String,
        status: {
          type: String,
          enum: ["hot", "warm", "cold"],
          default: "warm"
        },
        callbackAt: { type: Date },
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
      }
    ],
    leadStatus: {
      type: String,
      enum: ["new", "hot", "warm", "cold"],
      default: "new"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", UserSchema);
