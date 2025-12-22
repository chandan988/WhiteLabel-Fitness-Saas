import {
  googleAuth,
  loginUser,
  registerUser,
  updateUserProfile,
  changeUserPassword,
  setUserPassword,
  verifyEmailToken
} from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

const sanitizeUser = (user) => {
  if (!user) return null;
  const plain =
    typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete plain.password;
  delete plain.verificationToken;
  delete plain.resetToken;
  return plain;
};

const formatTenant = (tenant) => {
  if (!tenant) return null;
  const plain =
    typeof tenant.toObject === "function" ? tenant.toObject() : { ...tenant };
  return {
    id: plain._id?.toString?.() || plain._id,
    slug: plain.slug,
    name: plain.name,
    branding: plain.branding,
    profile: plain.profile,
    status: plain.status,
    domain: plain.domain,
    packageName: plain.packageName
  };
};

export const signup = asyncHandler(async (req, res) => {
  logger.info("Signup request received", { email: req.body.email, role: req.body.role });
  const user = await registerUser(req.body);
  res.status(201).json({
    message: "Account created. Please verify your email.",
    userId: user._id,
    tenantId: user.tenantId,
    verificationToken: user.verificationToken
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  logger.info("Verifying email token");
  await verifyEmailToken(req.body.token);
  res.json({ message: "Email verified successfully." });
});

export const login = asyncHandler(async (req, res) => {
  logger.info("Login attempt", { email: req.body.email });
  const { accessToken, refreshToken, user, tenant } = await loginUser(req.body);
  res.json({
    user: sanitizeUser(user),
    tenant: formatTenant(tenant),
    tokens: { accessToken, refreshToken }
  });
});

export const googleLogin = asyncHandler(async (req, res) => {
  logger.info("Google login attempt");
  const { accessToken, refreshToken, user } = await googleAuth(req.body);
  res.json({ user, tokens: { accessToken, refreshToken } });
});

export const setPassword = asyncHandler(async (req, res) => {
  logger.info("Password update requested", { email: req.body.email });
  await setUserPassword({
    userId: req.user?.id,
    email: req.body.email,
    password: req.body.password
  });
  res.json({ message: "Password updated" });
});

export const updateProfile = asyncHandler(async (req, res) => {
  logger.info("Profile update requested", { userId: req.user.id });
  const user = await updateUserProfile({
    userId: req.user.id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    avatar: req.body.avatar
  });
  res.json({ message: "Profile updated", user: sanitizeUser(user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  logger.info("Change password requested", { userId: req.user.id });
  await changeUserPassword({
    userId: req.user.id,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword
  });
  res.json({ message: "Password updated" });
});
