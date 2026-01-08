import { Tenant } from "../models/Tenant.js";
import { User } from "../models/User.js";
import { Client } from "../models/Client.js";
import { logger } from "../utils/logger.js";

const DEFAULT_STANDARD = {
  tier: "standard",
  name: "Standard",
  price: 0,
  currency: "INR",
  description: "Free tier",
  features: ["Access to basic workouts", "Community tips"],
  isDefault: true
};

const normalizeTier = (value) =>
  (value || "standard").toString().trim().toLowerCase();

const getPricingPlansArray = (tenant) =>
  Array.isArray(tenant?.pricingPlans) ? tenant.pricingPlans : [];

const saveTenant = async (tenant) => {
  if (!tenant) return;
  if (!tenant.ownerId) {
    await tenant.save({ validateBeforeSave: false });
    return;
  }
  await tenant.save();
};

const ensureStandardPlan = async (tenant) => {
  const plans = getPricingPlansArray(tenant);
  const hasStandard = plans.some((plan) => plan.tier === "standard");
  if (hasStandard) {
    return tenant;
  }
  tenant.pricingPlans = [{ ...DEFAULT_STANDARD }, ...plans];
  await saveTenant(tenant);
  return tenant;
};

const getTenantOrThrow = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  return ensureStandardPlan(tenant);
};

const findPlanByIdOrTier = (tenant, { planId, tier }) => {
  const plans = getPricingPlansArray(tenant);
  if (planId) {
    const match = plans.find(
      (plan) => `${plan._id}` === `${planId}`
    );
    return match || null;
  }
  const normalizedTier = normalizeTier(tier);
  return plans.find((plan) => plan.tier === normalizedTier) || null;
};

const getStandardPlan = (tenant) => {
  const plans = getPricingPlansArray(tenant);
  return plans.find((plan) => plan.tier === "standard") || DEFAULT_STANDARD;
};

export const listPricingPlans = async ({ tenantId }) => {
  logger.info("pricingService.listPricingPlans", { tenantId });
  const tenant = await getTenantOrThrow(tenantId);
  return tenant.pricingPlans;
};

export const createPricingPlan = async ({ tenantId, payload }) => {
  logger.info("pricingService.createPricingPlan", { tenantId });
  const tenant = await getTenantOrThrow(tenantId);
  const tier = normalizeTier(payload.tier);
  if (!["standard", "silver", "gold", "diamond"].includes(tier)) {
    throw new Error("Invalid tier");
  }
  const existing = tenant.pricingPlans.find((plan) => plan.tier === tier);
  if (existing && tier !== "standard") {
    throw new Error("A plan already exists for this tier");
  }
  if (!existing && tenant.pricingPlans.length >= 4) {
    throw new Error("You can only create up to 4 plans");
  }

  if (existing) {
    existing.name = payload.name || existing.name;
    existing.price = Number(payload.price) || 0;
    existing.currency = payload.currency || existing.currency || "INR";
    existing.description = payload.description || existing.description;
    existing.features = payload.features || existing.features || [];
    existing.isDefault = tier === "standard";
  } else {
    tenant.pricingPlans.push({
      tier,
      name: payload.name || tier.toUpperCase(),
      price: Number(payload.price) || 0,
      currency: payload.currency || "INR",
      description: payload.description || "",
      features: payload.features || [],
      isDefault: tier === "standard"
    });
  }

  await saveTenant(tenant);
  return tenant.pricingPlans;
};

export const updatePricingPlan = async ({ tenantId, planId, payload }) => {
  logger.info("pricingService.updatePricingPlan", { tenantId, planId });
  const tenant = await getTenantOrThrow(tenantId);
  const plan = tenant.pricingPlans.id(planId);
  if (!plan) {
    throw new Error("Plan not found");
  }
  const tier = payload.tier ? normalizeTier(payload.tier) : plan.tier;
  if (!["standard", "silver", "gold", "diamond"].includes(tier)) {
    throw new Error("Invalid tier");
  }
  if (tier !== plan.tier) {
    const conflict = tenant.pricingPlans.find(
      (entry) => entry.tier === tier
    );
    if (conflict) {
      throw new Error("Another plan already uses this tier");
    }
    plan.tier = tier;
  }
  if (payload.name !== undefined) plan.name = payload.name;
  if (payload.price !== undefined) plan.price = Number(payload.price) || 0;
  if (payload.currency !== undefined) plan.currency = payload.currency || "INR";
  if (payload.description !== undefined) plan.description = payload.description;
  if (payload.features !== undefined) plan.features = payload.features;
  plan.isDefault = plan.tier === "standard";

  await saveTenant(tenant);
  return tenant.pricingPlans;
};

export const deletePricingPlan = async ({ tenantId, planId }) => {
  logger.info("pricingService.deletePricingPlan", { tenantId, planId });
  const tenant = await getTenantOrThrow(tenantId);
  const plan = tenant.pricingPlans.id(planId);
  if (!plan) {
    throw new Error("Plan not found");
  }
  if (plan.tier === "standard") {
    throw new Error("Standard plan cannot be removed");
  }
  plan.deleteOne();
  await saveTenant(tenant);
  return tenant.pricingPlans;
};

export const assignPricingPlan = async ({
  tenantId,
  userId,
  clientId,
  planId,
  tier,
  endDate,
  durationDays
}) => {
  logger.info("pricingService.assignPricingPlan", { tenantId, userId, clientId });
  const tenant = await getTenantOrThrow(tenantId);
  let targetUserId = userId;

  if (!targetUserId && clientId) {
    const client = await Client.findById(clientId).select("userId tenantId").lean();
    if (!client) {
      throw new Error("Client not found");
    }
    if (`${client.tenantId}` !== `${tenantId}`) {
      throw new Error("Client does not belong to your tenant");
    }
    targetUserId = client.userId;
  }

  if (!targetUserId) {
    throw new Error("User is required");
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    throw new Error("User not found");
  }
  if (`${user.tenantId}` !== `${tenantId}`) {
    throw new Error("User does not belong to your tenant");
  }

  const plan = findPlanByIdOrTier(tenant, { planId, tier });
  if (!plan) {
    throw new Error("Plan not found");
  }

  const assignedAt = new Date();
  let expiresAt = null;
  if (plan.tier !== "standard") {
    if (endDate) {
      const parsed = new Date(endDate);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error("Invalid end date");
      }
      expiresAt = parsed;
    } else if (durationDays) {
      const days = Number(durationDays);
      if (!Number.isFinite(days) || days <= 0) {
        throw new Error("Invalid duration");
      }
      expiresAt = new Date(assignedAt);
      expiresAt.setDate(expiresAt.getDate() + days);
    } else {
      throw new Error("End date or duration is required for paid tiers");
    }
  }

  user.pricingPlan = {
    tier: plan.tier,
    planId: plan._id,
    name: plan.name,
    price: plan.price,
    currency: plan.currency,
    features: plan.features || [],
    assignedAt,
    expiresAt
  };

  await user.save();

  return {
    userId: user._id.toString(),
    pricingPlan: user.pricingPlan
  };
};

export const getEffectivePricingPlan = ({ user, tenant }) => {
  const standard = getStandardPlan(tenant);
  const plan = user.pricingPlan || {};
  if (!plan.tier) {
    return {
      tier: standard.tier,
      name: standard.name,
      price: standard.price,
      currency: standard.currency,
      features: standard.features || [],
      expiresAt: null
    };
  }
  if (plan.expiresAt) {
    const expiry = new Date(plan.expiresAt);
    if (!Number.isNaN(expiry.getTime()) && expiry < new Date()) {
      return {
        tier: standard.tier,
        name: standard.name,
        price: standard.price,
        currency: standard.currency,
        features: standard.features || [],
        expiresAt: null
      };
    }
  }
  return {
    tier: plan.tier,
    name: plan.name,
    price: plan.price,
    currency: plan.currency,
    features: plan.features || [],
    expiresAt: plan.expiresAt || null
  };
};
