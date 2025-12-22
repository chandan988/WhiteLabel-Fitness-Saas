import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri, { autoIndex: true });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Mongo connection error:", error.message);
    process.exit(1);
  }
};
