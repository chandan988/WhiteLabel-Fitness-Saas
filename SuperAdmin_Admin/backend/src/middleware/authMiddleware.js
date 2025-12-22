import { verifyToken } from "../utils/token.js";
import { User } from "../models/User.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select(
      "firstName lastName email role tenantId mustResetPassword"
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.user = {
      id: user._id.toString(),
      role: user.role,
      tenantId: user.tenantId?.toString(),
      mustResetPassword: user.mustResetPassword,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};
