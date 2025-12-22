import { Tenant } from "../models/Tenant.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const fallbackBrand = () => ({
  logoUrl: env.defaultBrandLogo,
  primaryColor: "#0d9488",
  secondaryColor: "#115e59",
  appName: env.defaultBrandName
});

export const getBranding = async ({ tenantId, domain, slug }) => {
  logger.info("brandingService.getBranding", { tenantId, domain, slug });
  let tenant = null;
  if (tenantId) {
    tenant = await Tenant.findById(tenantId).lean();
  } else if (slug) {
    tenant = await Tenant.findOne({ slug }).lean();
  } else if (domain) {
    tenant = await Tenant.findOne({ domain }).lean();
  }
  if (!tenant) {
    logger.warn("No tenant branding found", { tenantId, domain, slug });
    return fallbackBrand();
  }
  const branding = tenant.branding || {};
  return {
    logoUrl: branding.logoUrl || env.defaultBrandLogo,
    primaryColor: branding.primaryColor || "#0d9488",
    secondaryColor: branding.secondaryColor || "#115e59",
    appName: branding.appName || tenant.name || env.defaultBrandName
  };
};
