import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error("API Error", {
    path: req.path,
    method: req.method,
    error: err.message
  });
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};
