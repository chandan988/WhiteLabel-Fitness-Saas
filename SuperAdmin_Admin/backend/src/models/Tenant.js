import mongoose from "mongoose";

const BrandingSchema = new mongoose.Schema(
  {
    appName: { type: String, default: "Coach App" },
    logoUrl: String,
    logoBase64: String,
    primaryColor: { type: String, default: "#0f172a" },
    secondaryColor: { type: String, default: "#38bdf8" }
  },
  { _id: false }
);

const TenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    packageName: { type: String, required: true, unique: true },
    apiKey: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    branding: { type: BrandingSchema, default: () => ({}) },
    profile: {
      businessType: String,
      services: [String],
      description: String
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

export const Tenant = mongoose.model("Tenant", TenantSchema);
