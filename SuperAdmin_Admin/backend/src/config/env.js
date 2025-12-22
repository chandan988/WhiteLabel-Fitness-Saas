import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 6000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/coach_admin",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "30d",
  defaultSuperAdmin: {
    email: process.env.DEFAULT_SUPERADMIN_EMAIL || "owner@example.com",
    password: process.env.DEFAULT_SUPERADMIN_PASSWORD || "Owner@123"
  },
  mobileSyncIntervalMinutes:
    Number(process.env.MOBILE_SYNC_INTERVAL_MINUTES) || 30
};
