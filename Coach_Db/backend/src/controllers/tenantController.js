import {
  createTenant,
  getTenantById,
  getTenantPublicBySlug,
  updateTenant
} from "../services/tenantService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export const createTenantController = asyncHandler(async (req, res) => {
  logger.info("Creating tenant", { name: req.body.name });
  const tenant = await createTenant({
    ...req.body,
    createdBy: req.user.id
  });
  res.status(201).json(tenant);
});

export const getTenantController = asyncHandler(async (req, res) => {
  logger.info("Fetching tenant", { tenantId: req.params.id });
  const tenant = await getTenantById(req.params.id);
  res.json(tenant);
});

export const updateTenantController = asyncHandler(async (req, res) => {
  logger.info("Updating tenant", { tenantId: req.params.id });
  const tenant = await updateTenant(req.params.id, req.body);
  res.json(tenant);
});

export const getTenantBySlugController = asyncHandler(async (req, res) => {
  logger.info("Public tenant lookup", { slug: req.params.slug });
  const tenant = await getTenantPublicBySlug(req.params.slug);
  if (!tenant) {
    return res.status(404).json({ message: "Organization not found" });
  }
  res.json(tenant);
});
