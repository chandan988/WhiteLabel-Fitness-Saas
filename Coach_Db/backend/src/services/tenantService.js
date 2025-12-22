import crypto from "crypto";
import { Tenant } from "../models/Tenant.js";
import { logger } from "../utils/logger.js";

const buildSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || `tenant-${Date.now()}`;

export const createTenant = async (payload) => {
  logger.info("tenantService.createTenant", { name: payload.name });
  const safeName = payload.name || "Coach Tenant";
  const slug = payload.slug || buildSlug(safeName);
  const tenant = await Tenant.create({
    ...payload,
    name: safeName,
    slug,
    packageName: payload.packageName || `com.jeevanshaili.${slug}`,
    apiKey: payload.apiKey || crypto.randomBytes(16).toString("hex")
  });
  return tenant;
};

export const getTenantById = async (id) => {
  logger.info("tenantService.getTenantById", { id });
  const tenant = await Tenant.findById(id);
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  return tenant;
};

export const updateTenant = async (id, data) => {
  logger.info("tenantService.updateTenant", { id });
  const tenant = await Tenant.findByIdAndUpdate(id, data, { new: true });
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  return tenant;
};

export const getTenantBySlug = async (slug) => {
  logger.info("tenantService.getTenantBySlug", { slug });
  return Tenant.findOne({ slug });
};

export const getTenantPublicBySlug = async (slug) => {
  logger.info("tenantService.getTenantPublicBySlug", { slug });
  const tenant = await Tenant.findOne({ slug })
    .select(
      "name slug branding profile status packageName domain createdAt updatedAt"
    )
    .lean();
  if (!tenant) {
    return null;
  }
  return {
    id: tenant._id.toString(),
    orgId: tenant.slug,
    name: tenant.name,
    slug: tenant.slug,
    branding: tenant.branding,
    profile: tenant.profile,
    status: tenant.status,
    domain: tenant.domain,
    packageName: tenant.packageName,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt
  };
};
