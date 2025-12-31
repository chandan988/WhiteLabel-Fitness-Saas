import {
  resolveDailyContent,
  upsertOverride,
  listOverrides,
  updateOverrideById,
  deleteOverrideById
} from "../services/dailyContentService.js";

export const getDailyContentAdmin = async (req, res, next) => {
  try {
    const { date } = req.query;
    const data = await resolveDailyContent(date);
    return res.json({
      success: true,
      dateKey: data.dateKey,
      dayOfYear: data.dayOfYear,
      defaultContent: data.base,
      override: data.override
    });
  } catch (error) {
    return next(error);
  }
};

export const createOverride = async (req, res, next) => {
  try {
    const { dateKey, tipTitle, tipBody, quoteText, quoteAuthor } = req.body;
    if (!dateKey || !tipTitle || !tipBody || !quoteText) {
      return res.status(400).json({
        success: false,
        message: "Date, tip title, tip body, and quote text are required"
      });
    }
    const override = await upsertOverride({
      dateKey,
      tipTitle,
      tipBody,
      quoteText,
      quoteAuthor,
      createdBy: req.user?._id
    });
    return res.json({ success: true, data: override });
  } catch (error) {
    return next(error);
  }
};

export const updateOverride = async (req, res, next) => {
  try {
    const { id } = req.params;
    const override = await updateOverrideById(id, req.body);
    if (!override) {
      return res.status(404).json({
        success: false,
        message: "Override not found"
      });
    }
    return res.json({ success: true, data: override });
  } catch (error) {
    return next(error);
  }
};

export const removeOverride = async (req, res, next) => {
  try {
    const { id } = req.params;
    const override = await deleteOverrideById(id);
    if (!override) {
      return res.status(404).json({
        success: false,
        message: "Override not found"
      });
    }
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const listOverridesAdmin = async (req, res, next) => {
  try {
    const data = await listOverrides();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
