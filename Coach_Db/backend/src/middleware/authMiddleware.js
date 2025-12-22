import { verifyToken } from "../utils/token.js";
import { User } from "../models/User.js";
import { logger } from "../utils/logger.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : req.cookies?.accessToken;

  if (!token) {
    logger.warn("Authentication failed: missing token");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token, "access");
    req.user = decoded;
    const dbUser = await User.findById(decoded.id)
      .select("role tenantId firstName lastName email mustResetPassword status")
      .lean();
    if (!dbUser) {
      logger.warn("Authentication failed: user not found", { userId: decoded.id });
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.user = { ...req.user, ...dbUser, id: dbUser._id?.toString() };
    logger.info("Authentication success", { userId: req.user.id });
    next();
  } catch (error) {
    logger.error("Authentication failed: token invalid", { error: error.message });
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};
