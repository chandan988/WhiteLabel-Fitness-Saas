import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";
import { sendTransactionalEmail } from "../utils/email.js";
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/token.js";
import { env } from "../config/env.js";
import { Tenant } from "../models/Tenant.js";
import { logger } from "../utils/logger.js";

const googleClient = new OAuth2Client(env.googleClientId);
const buildSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || `coach-${Date.now()}`;

export const registerUser = async ({
  firstName,
  lastName,
  email,
  role = "coach",
  tenantId,
  services,
  businessName,
  businessType,
  city,
  clientCount,
  createdBy
}) => {
  logger.info("Registering user", { email, role });
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Account already exists");
  }
  const verificationToken = crypto.randomBytes(24).toString("hex");
  const user = await User.create({
    firstName,
    lastName,
    email,
    role,
    mustResetPassword: role === "coach",
    tenantId,
    createdBy,
    profile: { services, businessName, city, clientCount },
    verificationToken
  });

  let tenant;
  if (role === "coach") {
    logger.info("Creating tenant during signup", { email });
    const safeName = businessName || `${firstName} ${lastName} Coaching`;
    const slug = buildSlug(safeName || email.split("@")[0]);
    tenant = await Tenant.create({
      name: safeName,
      slug,
      packageName: `com.jeevanshaili.${slug}`,
      apiKey: crypto.randomBytes(16).toString("hex"),
      ownerId: user._id,
      branding: {
        appName: safeName,
        logoUrl: env.defaultBrandLogo,
        primaryColor: "#0f172a",
        secondaryColor: "#38bdf8",
        primaryHoverColor: "#0b7f71",
        secondaryHoverColor: "#0b4f4c",
        sidebarColor: "#115e59",
        surfaceColor: "#f8fafc",
        cardColor: "#ffffff",
        textColor: "#0f172a",
        mutedTextColor: "#64748b",
        borderColor: "#e2e8f0",
        buttonTextColor: "#ffffff",
        shadowColor: "#0f172a"
      },
      profile: {
        businessType: businessType || "Coaching",
        services,
        city,
        clientLimit: clientCount || 50
      },
      createdBy
    });
    user.tenantId = tenant._id;
    await user.save();
  }

  logger.info("Sending verification email", { email });
  await sendTransactionalEmail({
    to: email,
    subject: `Verify your ${env.defaultBrandName} account`,
    html: `<p>Welcome ${firstName},</p><p>Verify your email by using this token:</p><p><b>${verificationToken}</b></p>`
  });

  return user;
};

export const verifyEmailToken = async (token) => {
  logger.info("verifyEmailToken invoked");
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    throw new Error("Invalid verification token");
  }
  user.emailVerified = true;
  user.verificationToken = undefined;
  await user.save();
  return user;
};

export const loginUser = async ({ email, password, orgId }) => {
  logger.info("loginUser invoked", { email, orgId });
  const user = await User.findOne({ email }).populate("tenantId");
  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Invalid credentials");
  }
  if (!user.emailVerified) {
    throw new Error("Please verify your email first");
  }

  let tenantDoc = user.tenantId;
  if (user.role === "coach") {
    if (!orgId) {
      throw new Error("Organization ID is required");
    }
    if (!tenantDoc || tenantDoc.slug !== orgId) {
      tenantDoc = await Tenant.findOne({ slug: orgId });
    }
    if (!tenantDoc) {
      throw new Error("Organization not found");
    }
    if (
      !user.tenantId ||
      `${tenantDoc._id}` !== `${user.tenantId._id || user.tenantId}`
    ) {
      throw new Error("You do not belong to this organization");
    }
  }

  if (!user.tenantId && tenantDoc?._id) {
    user.tenantId = tenantDoc._id;
  }

  logger.info("loginUser success", { email, role: user.role });
  const payload = {
    id: user._id,
    role: user.role,
    tenantId: user.tenantId?._id || user.tenantId
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { user, tenant: tenantDoc, accessToken, refreshToken };
};

export const googleAuth = async ({ idToken }) => {
  if (!idToken) {
    throw new Error("Google token is required");
  }
  if (!env.googleClientId) {
    throw new Error("Google client ID is not configured");
  }
  logger.info("googleAuth verification started");
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId
  });
  const profile = ticket.getPayload();
  const email = profile.email;
  let user = await User.findOne({ email });
  if (!user) {
    logger.info("Creating new user from Google profile", { email });
    user = await User.create({
      firstName: profile.given_name,
      lastName: profile.family_name || "",
      email,
      googleId: profile.sub,
      emailVerified: true,
      provider: "google"
    });
  } else if (!user.googleId) {
    user.googleId = profile.sub;
    user.provider = "google";
    user.emailVerified = true;
    await user.save();
  }
  logger.info("googleAuth success", { email });
  const payload = {
    id: user._id,
    role: user.role,
    tenantId: user.tenantId
  };
  return {
    user,
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

export const setUserPassword = async ({ userId, email, password }) => {
  logger.info("setUserPassword invoked", { userId, email });
  const query = userId ? { _id: userId } : { email };
  const user = await User.findOne(query);
  if (!user) {
    throw new Error("User not found");
  }
  user.password = password;
  await user.save();
  return user;
};

export const updateUserProfile = async ({
  userId,
  firstName,
  lastName,
  avatar
}) => {
  logger.info("updateUserProfile invoked", { userId });
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (firstName || lastName) {
    user.name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }
  if (avatar !== undefined) {
    user.profile = { ...(user.profile || {}), avatar };
  }
  await user.save();
  return User.findById(userId).select(
    "firstName lastName email role profile tenantId mustResetPassword"
  );
};

export const changeUserPassword = async ({
  userId,
  currentPassword,
  newPassword
}) => {
  logger.info("changeUserPassword invoked", { userId });
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const match = await user.comparePassword(currentPassword);
  if (!match) {
    throw new Error("Current password is incorrect");
  }
  user.password = newPassword;
  user.mustResetPassword = false;
  await user.save();
  return user;
};
