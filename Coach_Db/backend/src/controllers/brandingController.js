import { getBranding } from "../services/brandingService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export const brandingController = asyncHandler(async (req, res) => {
  const { domain, tenantId, slug } = req.query;
  logger.info("Branding lookup", { domain, tenantId, slug });
  const branding = await getBranding({ domain, tenantId, slug });
  res.json(branding);
});
