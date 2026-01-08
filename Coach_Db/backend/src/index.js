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
import facebookRoutes from "./routes/facebookRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import pricingRoutes from "./routes/pricingRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { logger } from "./utils/logger.js";


const app = express();
const API_BASE = "/api";

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With"
    ]
  })
);

app.options("*", cors());

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));


app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get(`${API_BASE}/health`, (req, res) => res.json({ status: "ok" }));

app.use(`${API_BASE}/auth`, authRoutes);
app.use(`${API_BASE}/tenants`, tenantRoutes);
app.use(`${API_BASE}/clients`, clientRoutes);
app.use(`${API_BASE}/dashboard`, dashboardRoutes);
app.use(`${API_BASE}/branding`, brandingRoutes);
app.use(`${API_BASE}/leads`, leadRoutes);
app.use(`${API_BASE}/followups`, followUpRoutes);
app.use(`${API_BASE}/facebook`, facebookRoutes);
app.use(`${API_BASE}/library`, libraryRoutes);
app.use(`${API_BASE}/pricing`, pricingRoutes);

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
