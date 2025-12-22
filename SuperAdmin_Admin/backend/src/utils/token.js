import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateAccessToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.accessTokenExpiry });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);
