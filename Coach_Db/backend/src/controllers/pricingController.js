import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listPricingPlans,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  assignPricingPlan
} from "../services/pricingService.js";
import { logger } from "../utils/logger.js";

export const listPricingPlansController = asyncHandler(async (req, res) => {
  logger.info("pricingController.listPricingPlans", { tenantId: req.user.tenantId });
  const plans = await listPricingPlans({ tenantId: req.user.tenantId });
  res.json(plans);
});

export const createPricingPlanController = asyncHandler(async (req, res) => {
  const plans = await createPricingPlan({
    tenantId: req.user.tenantId,
    payload: req.body
  });
  res.status(201).json(plans);
});

export const updatePricingPlanController = asyncHandler(async (req, res) => {
  const plans = await updatePricingPlan({
    tenantId: req.user.tenantId,
    planId: req.params.id,
    payload: req.body
  });
  res.json(plans);
});

export const deletePricingPlanController = asyncHandler(async (req, res) => {
  const plans = await deletePricingPlan({
    tenantId: req.user.tenantId,
    planId: req.params.id
  });
  res.json(plans);
});

export const assignPricingPlanController = asyncHandler(async (req, res) => {
  const result = await assignPricingPlan({
    tenantId: req.user.tenantId,
    userId: req.body.userId,
    clientId: req.body.clientId,
    planId: req.body.planId,
    tier: req.body.tier,
    endDate: req.body.endDate,
    durationDays: req.body.durationDays
  });
  res.json(result);
});
