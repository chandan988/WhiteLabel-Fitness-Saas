import { Client } from "../models/Client.js";
import { User } from "../models/User.js";
import { Tenant } from "../models/Tenant.js";
import { logger } from "../utils/logger.js";
import { getEffectivePricingPlan } from "./pricingService.js";

const toPricingTenant = (tenant) => ({
  ...(tenant || {}),
  pricingPlans: Array.isArray(tenant?.pricingPlans) ? tenant.pricingPlans : []
});

export const createClient = async (data) => {
  logger.info("clientService.createClient", {
    tenantId: data.tenantId?.toString()
  });
  return Client.create(data);
};

export const getClients = async ({ tenantId }) => {
  const query = tenantId ? { tenantId } : {};
  logger.info("clientService.getClients", { tenantId });
  const clients = await Client.find(query).sort({ createdAt: -1 }).lean();
  if (!clients.length || !tenantId) {
    return clients;
  }

  const userIds = clients
    .map((client) => client.userId)
    .filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } })
    .select("_id pricingPlan tenantId")
    .lean();
  const userMap = new Map(users.map((user) => [`${user._id}`, user]));
  const tenant = await Tenant.findById(tenantId).select("pricingPlans").lean();
  const pricingTenant = toPricingTenant(tenant);

  return clients.map((client) => {
    const user = userMap.get(`${client.userId}`);
    const effectivePlan = user
      ? getEffectivePricingPlan({ user, tenant: pricingTenant })
      : {
          tier: "standard",
          name: "Standard",
          price: 0,
          currency: "INR",
          features: [],
          expiresAt: null
        };
    return {
      ...client,
      pricingTier: effectivePlan.tier,
      pricingPlanName: effectivePlan.name,
      pricingExpiresAt: effectivePlan.expiresAt
    };
  });
};

export const getClientById = async (id) => {
  logger.info("clientService.getClientById", { id });
  const client = await Client.findById(id).lean();
  if (!client) {
    throw new Error("Client not found");
  }
  const user = client.userId
    ? await User.findById(client.userId).select("pricingPlan tenantId").lean()
    : null;
  const tenant = client.tenantId
    ? await Tenant.findById(client.tenantId).select("pricingPlans").lean()
    : null;
  const pricingTenant = toPricingTenant(tenant);
  const effectivePlan =
    user && tenant
      ? getEffectivePricingPlan({ user, tenant: pricingTenant })
      : {
          tier: "standard",
          name: "Standard",
          price: 0,
          currency: "INR",
          features: [],
          expiresAt: null
        };
  return {
    ...client,
    pricingTier: effectivePlan.tier,
    pricingPlanName: effectivePlan.name,
    pricingExpiresAt: effectivePlan.expiresAt
  };
};

export const updateClient = async (id, data) => {
  logger.info("clientService.updateClient", { id });
  const client = await Client.findByIdAndUpdate(id, data, { new: true });
  if (!client) {
    throw new Error("Client not found");
  }
  return client;
};
