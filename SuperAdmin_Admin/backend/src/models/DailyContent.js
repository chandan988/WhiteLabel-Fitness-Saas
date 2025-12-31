import mongoose from "mongoose";

const DailyContentSchema = new mongoose.Schema(
  {
    dayOfYear: { type: Number },
    dateKey: { type: String },
    tipTitle: { type: String, required: true },
    tipBody: { type: String, required: true },
    quoteText: { type: String, required: true },
    quoteAuthor: { type: String },
    isOverride: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

DailyContentSchema.index({ dayOfYear: 1, isOverride: 1 });
DailyContentSchema.index({ dateKey: 1, isOverride: 1 });

export const DailyContent = mongoose.model("DailyContent", DailyContentSchema);
