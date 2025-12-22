import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";

const [, , tenantA, tenantB] = process.argv;

if (!tenantA || !tenantB) {
  console.error(
    "\nUsage: node scripts/distributeLeads.js <tenantIdA> <tenantIdB>\n" +
      "Example:\nnode scripts/distributeLeads.js 64f1...a4 64f1...b2\n"
  );
  process.exit(1);
}

const run = async () => {
  await connectDB();
  const filter = {
    role: "consumer",
    $or: [{ tenantId: { $exists: false } }, { tenantId: null }]
  };
  const leads = await User.find(filter).sort({ createdAt: 1 }).lean();

  if (!leads.length) {
    console.log("No unassigned leads found.");
    await mongoose.connection.close();
    return;
  }

  const midpoint = Math.ceil(leads.length / 2);
  const firstHalf = leads.slice(0, midpoint);
  const secondHalf = leads.slice(midpoint);

  const assign = async (entries, tenantId) => {
    await Promise.all(
      entries.map((lead) =>
        User.updateOne(
          { _id: lead._id },
          { $set: { tenantId, role: "consumer" } }
        )
      )
    );
  };

  await assign(firstHalf, tenantA);
  await assign(secondHalf, tenantB);

  console.log(
    `Assigned ${firstHalf.length} leads to ${tenantA} and ${secondHalf.length} leads to ${tenantB}`
  );
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error("Distribution failed:", err);
  mongoose.connection.close();
  process.exit(1);
});
