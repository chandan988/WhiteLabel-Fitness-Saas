import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User.js";
import { generateAccessToken } from "../utils/token.js";
import { env } from "../config/env.js";

export const ensureSuperAdmin = async () => {
  const existing = await User.findOne({ role: "superadmin" });
  if (existing) return existing;
  return User.create({
    firstName: "Super",
    lastName: "Admin",
    email: env.defaultSuperAdmin.email,
    password: env.defaultSuperAdmin.password,
    role: "superadmin"
  });
};

export const loginSuperAdmin = async ({ email, password }) => {
  const user = await User.findOne({ email, role: "superadmin" });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Invalid credentials");
  }
  const token = generateAccessToken({
    id: user._id,
    role: user.role
  });
  return { user, token };
};

export const loginCoach = async ({ email, password }) => {
  const user = await User.findOne({ email, role: "coach" }).populate("tenantId");
  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Invalid credentials");
  }
  const token = generateAccessToken({
    id: user._id,
    role: user.role,
    tenantId: user.tenantId?._id
  });
  return { user, token };
};

export const completeCoachSetup = async ({ coachId, password, profile }) => {
  const coach = await User.findById(coachId);
  if (!coach || coach.role !== "coach") {
    throw new Error("Coach not found");
  }
  if (password) {
    coach.password = password;
    await coach.save();
  }
  coach.profile = { ...coach.profile, ...profile };
  coach.mustResetPassword = false;
  await coach.save();
  return coach;
};

export const generateCoachCredentials = () => {
  const password = crypto.randomBytes(6).toString("base64");
  return { password };
};
