import { logger } from "../utils/logger.js";

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    logger.warn("Authorization denied", { userId: req.user?.id, role: req.user?.role, required: roles });
    return res.status(403).json({ message: "Access denied" });
  }
  logger.info("Authorization success", { userId: req.user.id, role: req.user.role });
  next();
};
