import mongoose from "mongoose";

const MobileUserSchema = new mongoose.Schema({}, { strict: false, collection: "users" });

export const MobileUser = mongoose.model("MobileUser", MobileUserSchema);
