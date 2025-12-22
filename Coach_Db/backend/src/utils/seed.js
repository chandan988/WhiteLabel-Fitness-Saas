import mongoose from "mongoose";
import crypto from "crypto";
import { connectDB } from "../config/db.js";
import { Tenant } from "../models/Tenant.js";
import { User } from "../models/User.js";
import { Client } from "../models/Client.js";
import { DailyActivity } from "../models/DailyActivity.js";
import { StepsLog } from "../models/StepsLog.js";
import { WeightLog } from "../models/WeightLog.js";

const buildSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || `tenant-${Date.now()}`;

const seed = async () => {
  await connectDB();
  await Promise.all([
    Tenant.deleteMany(),
    User.deleteMany(),
    Client.deleteMany(),
    DailyActivity.deleteMany(),
    StepsLog.deleteMany(),
    WeightLog.deleteMany()
  ]);

  const superAdmin = await User.create({
    firstName: "Owner",
    lastName: "Admin",
    email: "owner@example.com",
    password: "Owner@123",
    role: "superadmin",
    emailVerified: true
  });

  const slug = buildSlug("Jeevanshaili Fitness");
  const coachUser = await User.create({
    firstName: "Priyansh",
    lastName: "Coach",
    email: "coach@example.com",
    password: "Coach@123",
    role: "coach",
    mustResetPassword: false,
    emailVerified: true
  });

  const tenant = await Tenant.create({
    name: "Jeevanshaili Fitness",
    slug,
    packageName: `com.jeevanshaili.${slug}`,
    apiKey: crypto.randomBytes(16).toString("hex"),
    ownerId: coachUser._id,
    domain: "app.jeevanshaili.com",
    branding: {
      appName: "Jeevanshaili",
      logoUrl: "https://placehold.co/160x40?text=Jeevanshaili",
      primaryColor: "#1A8E5F",
      secondaryColor: "#0F4A2E"
    },
    profile: {
      businessType: "Nutrition + Workout",
      services: ["Nutrition Coaching", "Workout Planning"],
      city: "Mumbai",
      clientLimit: 100
    },
    createdBy: superAdmin._id,
    status: "active"
  });

  coachUser.tenantId = tenant._id;
  await coachUser.save();

  const client = await Client.create({
    firstName: "Aashish",
    lastName: "Tiwari",
    email: "client@example.com",
    tenantId: tenant._id,
    createdBy: coachUser._id
  });

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    await DailyActivity.create({
      clientId: client._id,
      tenantId: tenant._id,
      createdBy: coachUser._id,
      date,
      caloriesBurned: 500 + i * 20,
      steps: 7000 + i * 500,
      caloriesIntake: 1800 + i * 50,
      waterIntake: 3 + i * 0.1,
      sleepHours: 7 - i * 0.1,
      workoutsCompleted: 1
    });
    await StepsLog.create({
      clientId: client._id,
      tenantId: tenant._id,
      createdBy: coachUser._id,
      date,
      steps: 7000 + i * 400
    });
    await WeightLog.create({
      clientId: client._id,
      tenantId: tenant._id,
      createdBy: coachUser._id,
      date,
      weight: 80 - i * 0.3
    });
  }

  console.log("Seed completed");
  mongoose.connection.close();
};

seed();
