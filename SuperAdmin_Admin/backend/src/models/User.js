import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const metaFields = {
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" }
};

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "coach", "client"],
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
      services: [String]
    },
    ...metaFields
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", UserSchema);
