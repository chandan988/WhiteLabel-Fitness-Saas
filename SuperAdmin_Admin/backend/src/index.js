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
import { errorHandler } from "./middleware/errorMiddleware.js";
import { startMobileSyncJob } from "./jobs/syncMobileData.js";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/coach", coachRoutes);
app.use("/clients", clientRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDB();
  await ensureSuperAdmin();
  startMobileSyncJob();
  app.listen(env.port, () => {
    console.log(`API ready on ${env.port}`);
  });
};

start();
