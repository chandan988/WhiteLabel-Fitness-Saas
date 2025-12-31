import { resolveDailyContent } from "../services/dailyContentService.js";

export const getDailyContent = async (req, res, next) => {
  try {
    const { date } = req.query;
    const data = await resolveDailyContent(date);
    if (!data.content) {
      return res.status(404).json({
        success: false,
        message: "No daily content available"
      });
    }
    return res.json({ success: true, data: data.content });
  } catch (error) {
    return next(error);
  }
};
