import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import coachRoutes from "./routes/coachRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import { ensureSuperAdmin } from "./services/authService.js";
import contentRoutes from "./routes/contentRoutes.js";
import { ensureDailyContentSeeded } from "./services/dailyContentService.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { startMobileSyncJob } from "./jobs/syncMobileData.js";

const app = express();

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
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/content", contentRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDB();
  await ensureSuperAdmin();
  await ensureDailyContentSeeded();
  startMobileSyncJob();
  app.listen(env.port, () => {
    console.log(`API ready on ${env.port}`);
  });
};

start();
