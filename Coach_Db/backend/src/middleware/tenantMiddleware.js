import { logger } from "../utils/logger.js";

export const enforceTenant = (req, res, next) => {
  const tenantFromRoute =
    req.params.tenantId ||
    req.body.tenantId ||
    req.query.tenantId ||
    req.headers["x-tenant-id"];

  if (req.user.role === "superadmin") {
    return next();
  }

  if (!tenantFromRoute || `${tenantFromRoute}` !== `${req.user.tenantId}`) {
    logger.warn("Tenant enforcement failed", {
      tenantFromRoute,
      userTenant: req.user.tenantId
    });
    return res
      .status(403)
      .json({ message: "Tenant mismatch. Access denied." });
  }
  req.tenantId = req.user.tenantId;
  logger.info("Tenant enforcement success", { tenantId: req.tenantId });
  next();
};
