import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/User.js";
import { Client } from "../models/Client.js";
import { logger } from "../utils/logger.js";

const mapFollowUps = (followUps = []) =>
  followUps
    .map((entry) => ({
      asked: entry.asked,
      response: entry.response,
      status: entry.status,
      callbackAt: entry.callbackAt,
      createdAt: entry.createdAt,
      createdBy: entry.createdBy?.toString?.()
    }))
    .sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
    );

export const getLeads = async ({ tenantId, inquiryDate, status }) => {
  logger.info("leadService.getLeads", { tenantId, inquiryDate, status });
  const query = {
    role: { $in: ["consumer"] },
    tenantId
  };

  if (inquiryDate) {
    const start = new Date(inquiryDate);
    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 1);
      query.createdAt = { $gte: start, $lt: end };
    }
  }

  if (status) {
    query.leadStatus = status;
  }

  const leads = await User.find(query)
    .select(
      "name firstName lastName email phone unique_id tenantId createdAt followUps leadStatus"
    )
    .sort({ createdAt: -1 })
    .lean();

  return leads.map((lead) => ({
    id: lead.unique_id || lead._id?.toString(),
    name: lead.name || `${lead.firstName || ""} ${lead.lastName || ""}`.trim(),
    email: lead.email,
    phone: lead.phone || "-",
    rawId: lead._id?.toString(),
    inquiryDate: lead.createdAt,
    followUps: mapFollowUps(lead.followUps),
    leadStatus: lead.leadStatus || "new"
  }));
};

export const getLeadById = async ({ leadId, tenantId }) => {
  logger.info("leadService.getLeadById", { leadId, tenantId });
  const lead = await User.findOne({ _id: leadId, tenantId, role: "consumer" })
    .select(
      "name firstName lastName email phone unique_id tenantId createdAt followUps leadStatus"
    )
    .lean();
  if (!lead) {
    throw new Error("Lead not found");
  }
  return {
    id: lead.unique_id || lead._id?.toString(),
    name: lead.name || `${lead.firstName || ""} ${lead.lastName || ""}`.trim(),
    email: lead.email,
    phone: lead.phone || "-",
    rawId: lead._id?.toString(),
    inquiryDate: lead.createdAt,
    followUps: mapFollowUps(lead.followUps),
    leadStatus: lead.leadStatus || "new"
  };
};

export const createLead = async ({
  name,
  email,
  phone,
  createdBy,
  tenantId
}) => {
  logger.info("leadService.createLead", { email, tenantId });
  const existing = await User.findOne({ email, tenantId });
  if (existing) {
    throw new Error("A lead with this email already exists for your tenant");
  }
  const [firstName, ...rest] = (name || "").trim().split(" ");
  const normalizedFirst = firstName || name || "Lead";
  const normalizedLast = rest.join(" ") || "Prospect";
  const lead = await User.create({
    firstName: normalizedFirst,
    lastName: normalizedLast,
    name,
    email,
    phone,
    role: "consumer",
    provider: "local",
    emailVerified: false,
    unique_id: uuidv4(),
    createdBy,
    tenantId
  });
  return {
    id: lead.unique_id,
    name: lead.name || `${lead.firstName} ${lead.lastName}`.trim(),
    email: lead.email,
    phone: lead.phone,
    rawId: lead._id.toString(),
    inquiryDate: lead.createdAt,
    followUps: [],
    leadStatus: lead.leadStatus || "new"
  };
};

export const updateLead = async (id, payload) => {
  logger.info("leadService.updateLead", { id });
  if (payload.email) {
    const existing = await User.findOne({
      _id: { $ne: id },
      email: payload.email
    });
    if (existing) {
      throw new Error("A user with this email already exists");
    }
  }
  const updates = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone
  };
  if (payload.name) {
    const [firstName, ...rest] = payload.name.trim().split(" ");
    updates.firstName = firstName || payload.name;
    updates.lastName = rest.join(" ") || firstName || payload.name;
  }
  const lead = await User.findByIdAndUpdate(id, updates, { new: true });
  if (!lead) throw new Error("Lead not found");
  return {
    id: lead.unique_id || lead._id.toString(),
    name: lead.name || `${lead.firstName || ""} ${lead.lastName || ""}`.trim(),
    email: lead.email,
    phone: lead.phone,
    rawId: lead._id.toString(),
    inquiryDate: lead.createdAt,
    followUps: mapFollowUps(lead.followUps),
    leadStatus: lead.leadStatus || "new"
  };
};

export const convertLead = async ({ leadId, tenantId, userId }) => {
  logger.info("leadService.convertLead", { leadId, tenantId });
  console.log("=== DEBUG CONVERT START ===");

  const lead = await User.findById(leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }
  if (
    lead.tenantId &&
    `${lead.tenantId?.toString?.() || lead.tenantId}` !== `${tenantId}`
  ) {
    throw new Error("This lead belongs to another tenant");
  }

  console.log("Lead found:", {
    id: lead._id,
    name: lead.name,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone
  });

  if (!tenantId) {
    throw new Error("Tenant not available for conversion");
  }

  let firstName = "Client";
  if (lead.firstName && lead.firstName.trim()) {
    firstName = lead.firstName.trim();
  } else if (lead.name && lead.name.trim()) {
    const nameParts = lead.name.trim().split(/\s+/);
    if (nameParts.length > 0) {
      firstName = nameParts[0];
    }
  }

  let lastName = "User";
  if (lead.lastName && lead.lastName.trim()) {
    lastName = lead.lastName.trim();
  } else if (lead.name && lead.name.trim()) {
    const nameParts = lead.name.trim().split(/\s+/);
    if (nameParts.length > 1) {
      lastName = nameParts.slice(1).join(" ");
    } else {
      lastName = "User";
    }
  }

  console.log("Parsed names:", { firstName, lastName });

  if (!firstName.trim()) firstName = "Client";
  if (!lastName.trim()) lastName = "User";

  console.log("Creating client with:", {
    firstName,
    lastName,
    email: lead.email,
    phone: lead.phone || "Not provided",
    tenantId,
    createdBy: userId
  });

  try {
    const client = await Client.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: lead.email,
      phone: lead.phone || "Not provided",
      tenantId,
      createdBy: userId
    });

    console.log("Client created successfully:", client._id);

    lead.firstName =
      (lead.firstName && lead.firstName.trim()) || firstName.trim() || "Client";
    lead.lastName =
      (lead.lastName && lead.lastName.trim()) || lastName.trim() || "User";
    if (!lead.name || !lead.name.trim()) {
      lead.name = `${lead.firstName} ${lead.lastName}`.trim();
    }
    lead.tenantId = tenantId;
    lead.role = "client";
    await lead.save();

    console.log("=== DEBUG CONVERT END ===");

    return { success: true, clientId: client._id };
  } catch (error) {
    console.error("Client creation error:", error);
    throw error;
  }
};

export const revertLead = async ({ clientId, tenantId }) => {
  logger.info("leadService.revertLead", { clientId, tenantId });
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error("Client not found");
  }
  if (`${client.tenantId}` !== `${tenantId}`) {
    throw new Error("You cannot update this client");
  }
  const firstName =
    (client.firstName && client.firstName.trim()) ||
    client.email?.split("@")[0] ||
    "Lead";
  const lastName =
    (client.lastName && client.lastName.trim()) || "Prospect";

  let lead = await User.findOne({ email: client.email });
  if (lead) {
    lead.firstName = firstName;
    lead.lastName = lastName;
    lead.name = lead.name || `${firstName} ${lastName}`.trim();
    lead.tenantId = tenantId;
    lead.role = "consumer";
    lead.leadStatus = lead.leadStatus || "new";
    await lead.save();
  } else {
    lead = await User.create({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email: client.email,
      phone: client.phone,
      role: "consumer",
      provider: "local",
      emailVerified: false,
      tenantId,
      leadStatus: "new"
    });
  }

  await Client.findByIdAndDelete(clientId);

  return { success: true };
};

export const addLeadFollowUp = async ({
  leadId,
  tenantId,
  asked,
  response,
  status,
  callbackAt,
  createdBy
}) => {
  logger.info("leadService.addLeadFollowUp", { leadId, tenantId, status });
  const followUpEntry = {
    asked,
    response,
    status,
    callbackAt: callbackAt ? new Date(callbackAt) : undefined,
    createdAt: new Date(),
    createdBy
  };

  const lead = await User.findOneAndUpdate(
    { _id: leadId, tenantId, role: "consumer" },
    {
      $push: {
        followUps: followUpEntry
      },
      $set: {
        leadStatus: status
      }
    },
    { new: true }
  )
    .select("followUps leadStatus")
    .lean();

  if (!lead) {
    throw new Error("Lead not found");
  }

  return {
    followUps: mapFollowUps(lead.followUps),
    leadStatus: lead.leadStatus
  };
};

export const getDueFollowUps = async ({ tenantId, date, rangeDays }) => {
  logger.info("leadService.getDueFollowUps", { tenantId, date, rangeDays });
  if (!tenantId) {
    throw new Error("Tenant not available for follow-ups");
  }
  const target = date ? new Date(date) : new Date();
  if (Number.isNaN(target.getTime())) {
    throw new Error("Invalid date");
  }
  const start = new Date(target);
  const end = new Date(target);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const days = Number.isFinite(Number(rangeDays)) ? Number(rangeDays) : 0;
  end.setDate(end.getDate() + (days > 0 ? days : 1));

  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
  const results = await User.aggregate([
    {
      $match: {
        tenantId: tenantObjectId,
        role: "consumer",
        "followUps.callbackAt": { $gte: start, $lt: end }
      }
    },
    { $unwind: "$followUps" },
    {
      $match: {
        "followUps.callbackAt": { $gte: start, $lt: end }
      }
    },
    { $sort: { "followUps.callbackAt": 1 } },
    {
      $project: {
        leadId: "$_id",
        name: {
          $ifNull: [
            "$name",
            {
              $trim: {
                input: { $concat: ["$firstName", " ", "$lastName"] }
              }
            }
          ]
        },
        email: 1,
        phone: 1,
        leadStatus: 1,
        asked: "$followUps.asked",
        response: "$followUps.response",
        status: "$followUps.status",
        callbackAt: "$followUps.callbackAt",
        createdAt: "$followUps.createdAt"
      }
    }
  ]);

  return results.map((entry) => ({
    leadId: entry.leadId?.toString(),
    name: entry.name || "-",
    email: entry.email,
    phone: entry.phone || "-",
    leadStatus: entry.leadStatus || "new",
    asked: entry.asked,
    response: entry.response,
    status: entry.status,
    callbackAt: entry.callbackAt,
    createdAt: entry.createdAt
  }));
};
