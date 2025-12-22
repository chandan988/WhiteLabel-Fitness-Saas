import cron from "node-cron";
import { env } from "../config/env.js";
import { DailyActivity } from "../models/DailyActivity.js";

export const startMobileSyncJob = () => {
  cron.schedule(`*/${env.mobileSyncIntervalMinutes} * * * *`, async () => {
    console.log("Running mobile data sync placeholder", new Date().toISOString());
    await DailyActivity.exists(); // touch collection to keep connection warm
  });
};
