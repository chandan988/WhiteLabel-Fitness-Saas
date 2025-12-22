import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import brandingRoutes from "./routes/brandingRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import followUpRoutes from "./routes/followUpRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL?.split(",") || ["http://localhost:5173"],
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/tenants", tenantRoutes);
app.use("/clients", clientRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/branding", brandingRoutes);
app.use("/leads", leadRoutes);
app.use("/followups", followUpRoutes);

app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(env.port, () => {
      logger.info(`API listening on port ${env.port}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB", { error: err.message });
  });
