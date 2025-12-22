import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateAccessToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.accessTokenExpiry });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenExpiry
  });

export const verifyToken = (token, type = "access") => {
  const secret = type === "access" ? env.jwtSecret : env.jwtRefreshSecret;
  return jwt.verify(token, secret);
};
