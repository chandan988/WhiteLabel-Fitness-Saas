import mongoose from "mongoose";

const FollowUpSchema = new mongoose.Schema(
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
  },
  { _id: false }
);

const FacebookLeadSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    leadgenId: { type: String, required: true, index: true },
    formId: String,
    pageId: String,
    adId: String,
    adsetId: String,
    campaignId: String,
    name: String,
    email: String,
    phone: String,
    source: { type: String, default: "facebook" },
    leadStatus: {
      type: String,
      enum: ["new", "hot", "warm", "cold", "converted"],
      default: "new"
    },
    convertedAt: Date,
    convertedClientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    followUps: [FollowUpSchema],
    inquiryDate: { type: Date },
    rawPayload: { type: Object }
  },
  { timestamps: true }
);

FacebookLeadSchema.index({ tenantId: 1, leadgenId: 1 }, { unique: true });

export const FacebookLead = mongoose.model("FacebookLead", FacebookLeadSchema);
