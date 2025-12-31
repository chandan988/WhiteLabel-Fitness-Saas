import { DailyContent } from "../models/DailyContent.js";
import {
  buildDefaultDailyContent,
  getDayOfYear,
  toDateKey
} from "../utils/dailyContentSeed.js";

export const ensureDailyContentSeeded = async () => {
  const count = await DailyContent.countDocuments({ isOverride: false });
  if (count >= 365) {
    return;
  }
  await DailyContent.deleteMany({ isOverride: false });
  await DailyContent.insertMany(buildDefaultDailyContent());
};

export const resolveDailyContent = async (dateValue) => {
  const dateKey = toDateKey(dateValue);
  const dayOfYear = getDayOfYear(dateValue);
  const override = await DailyContent.findOne({
    dateKey,
    isOverride: true
  }).lean();
  const base = await DailyContent.findOne({
    dayOfYear,
    isOverride: false
  }).lean();
  return {
    dateKey,
    dayOfYear,
    override,
    base,
    content: override || base
  };
};

export const upsertOverride = async ({
  dateKey,
  tipTitle,
  tipBody,
  quoteText,
  quoteAuthor,
  createdBy
}) =>
  DailyContent.findOneAndUpdate(
    { dateKey, isOverride: true },
    {
      dateKey,
      isOverride: true,
      tipTitle,
      tipBody,
      quoteText,
      quoteAuthor,
      createdBy
    },
    { new: true, upsert: true }
  );

export const listOverrides = async () =>
  DailyContent.find({ isOverride: true }).sort({ dateKey: 1 }).lean();

export const updateOverrideById = async (id, updates) =>
  DailyContent.findOneAndUpdate({ _id: id }, updates, { new: true });

export const deleteOverrideById = async (id) =>
  DailyContent.findOneAndDelete({ _id: id });
