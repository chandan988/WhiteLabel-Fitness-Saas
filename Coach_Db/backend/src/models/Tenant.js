import mongoose from "mongoose";

const BrandingSchema = new mongoose.Schema(
  {
    appName: { type: String, default: "Coach App" },
    logoUrl: String,
    primaryColor: { type: String, default: "#0f172a" },
    secondaryColor: { type: String, default: "#38bdf8" },
    primaryHoverColor: { type: String, default: "#0b7f71" },
    secondaryHoverColor: { type: String, default: "#0b4f4c" },
    surfaceColor: { type: String, default: "#f8fafc" },
    cardColor: { type: String, default: "#ffffff" },
    textColor: { type: String, default: "#0f172a" },
    mutedTextColor: { type: String, default: "#64748b" },
    borderColor: { type: String, default: "#e2e8f0" },
    buttonTextColor: { type: String, default: "#ffffff" },
    shadowColor: { type: String, default: "#0f172a" }
  },
  { _id: false }
);

const TenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    packageName: { type: String, required: true, unique: true },
    apiKey: { type: String, required: true, unique: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    domain: { type: String },
    branding: { type: BrandingSchema, default: () => ({}) },
    profile: {
      businessType: String,
      services: [String],
      city: String,
      clientLimit: { type: Number, default: 50 },
      description: String
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Tenant = mongoose.model("Tenant", TenantSchema);
