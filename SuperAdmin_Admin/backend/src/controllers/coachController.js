import { asyncHandler } from "../utils/asyncHandler.js";
import { getCoachProfile, getCoachStats } from "../services/coachService.js";
import { Tenant } from "../models/Tenant.js";

export const coachProfileController = asyncHandler(async (req, res) => {
  const profile = await getCoachProfile(req.user.id);
  res.json(profile);
});

export const coachBrandingController = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.user.tenantId).select("branding apiKey packageName name");
  res.json(tenant);
});

export const coachStatsController = asyncHandler(async (req, res) => {
  const stats = await getCoachStats(req.user.tenantId);
  res.json(stats);
});
