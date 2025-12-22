import crypto from "crypto";
import slugify from "slugify";
import { User } from "../models/User.js";
import { Tenant } from "../models/Tenant.js";
import { Client } from "../models/Client.js";
import { generateCoachCredentials } from "./authService.js";

const buildSlug = (name) =>
  slugify(name, { lower: true, strict: true }).slice(0, 40);

const normalizeBranding = (branding = {}) => {
  if (!branding) return {};
  const normalized = { ...branding };
  if (normalized.logoBase64 && !normalized.logoUrl) {
    normalized.logoUrl = normalized.logoBase64;
  }
  return normalized;
};

export const createCoach = async ({ firstName, lastName, email, branding, profile }) => {
  const { password } = generateCoachCredentials();
  const coach = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: "coach",
    mustResetPassword: true
  });

  const businessName = profile?.businessName || `${firstName} ${lastName}`.trim();
  const slug = buildSlug(businessName || email.split("@")[0]);
  const packageName = `com.jeevanshaili.${slug}`;
  const apiKey = crypto.randomBytes(16).toString("hex");

  const tenant = await Tenant.create({
    name: businessName,
    slug,
    packageName,
    apiKey,
    owner: coach._id,
    branding: normalizeBranding(branding),
    profile
  });

  coach.tenantId = tenant._id;
  await coach.save();

  return { coach, tenant, password };
};

export const listCoaches = async () => {
  return Tenant.find()
    .populate("owner", "firstName lastName email status mustResetPassword")
    .lean();
};

export const resetCoachPassword = async (coachId) => {
  const coach = await User.findById(coachId);
  if (!coach || coach.role !== "coach") {
    throw new Error("Coach not found");
  }
  const { password } = generateCoachCredentials();
  coach.password = password;
  coach.mustResetPassword = true;
  await coach.save();
  return { coach, password };
};

export const updateCoach = async (coachId, updates) => {
  const coach = await User.findById(coachId);
  if (!coach || coach.role !== "coach") throw new Error("Coach not found");
  if (updates.firstName) coach.firstName = updates.firstName;
  if (updates.lastName) coach.lastName = updates.lastName;
  if (updates.email) coach.email = updates.email;
  if (updates.profile) {
    coach.profile = { ...coach.profile, ...updates.profile };
  }
  await coach.save();

  if (updates.branding || updates.profile) {
    await Tenant.findByIdAndUpdate(
      coach.tenantId,
      {
        ...(updates.branding ? { branding: normalizeBranding(updates.branding) } : {}),
        ...(updates.profile ? { profile: updates.profile } : {})
      },
      { new: true }
    );
  }

  return coach;
};

export const getCoachProfile = async (coachId) => {
  return User.findById(coachId).select(
    "firstName lastName email profile mustResetPassword"
  );
};

export const getCoachStats = async (tenantId) => {
  const clientCount = await Client.countDocuments({ tenantId });
  return { clientCount };
};

export const deleteCoach = async (coachId) => {
  const coach = await User.findById(coachId);
  if (!coach || coach.role !== "coach") {
    throw new Error("Coach not found");
  }

  const tenant = await Tenant.findById(coach.tenantId);
  if (tenant) {
    await Client.deleteMany({ tenantId: tenant._id });
    await Tenant.findByIdAndDelete(tenant._id);
  }

  await User.findByIdAndDelete(coachId);
  return {
    coachId,
    tenantId: tenant?._id,
    slug: tenant?.slug
  };
};
