import { FacebookLead } from "../models/FacebookLead.js";
import { Tenant } from "../models/Tenant.js";
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

const normalizeLeadStatusFilter = (status) => {
  if (!status) return null;
  return status.toString().trim().toLowerCase();
};

const extractField = (fieldData = [], keys = []) => {
  const lowerKeys = keys.map((key) => key.toLowerCase());
  const match = fieldData.find((entry) =>
    lowerKeys.includes((entry.name || "").toLowerCase())
  );
  if (!match) return "";
  const values = match.values || [];
  return values[0] || "";
};

const extractLeadProfile = (fieldData = []) => {
  const fullName =
    extractField(fieldData, ["full_name", "name"]) ||
    [
      extractField(fieldData, ["first_name"]),
      extractField(fieldData, ["last_name"])
    ]
      .filter(Boolean)
      .join(" ");
  const email = extractField(fieldData, ["email"]);
  const phone =
    extractField(fieldData, ["phone_number", "phone", "mobile"]);
  return { fullName, email, phone };
};

const fetchLeadDetails = async ({ leadgenId, pageAccessToken }) => {
  const version = process.env.FACEBOOK_GRAPH_VERSION || "v19.0";
  const url = new URL(`https://graph.facebook.com/${version}/${leadgenId}`);
  url.searchParams.set("access_token", pageAccessToken);
  url.searchParams.set("fields", "created_time,field_data");
  const response = await fetch(url.toString());
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Facebook lead fetch failed: ${text}`);
  }
  return response.json();
};

export const listFacebookLeads = async ({ tenantId, inquiryDate, status }) => {
  logger.info("facebookLeadService.listFacebookLeads", { tenantId, inquiryDate, status });
  const query = { tenantId };
  const normalizedStatus = normalizeLeadStatusFilter(status);
  if (normalizedStatus) {
    query.leadStatus = normalizedStatus;
  } else {
    query.leadStatus = { $ne: "converted" };
  }
  if (inquiryDate) {
    const start = new Date(inquiryDate);
    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 1);
      query.inquiryDate = { $gte: start, $lt: end };
    }
  }

  const leads = await FacebookLead.find(query).sort({ inquiryDate: -1 }).lean();

  return leads.map((lead) => ({
    id: lead.leadgenId || lead._id?.toString(),
    name: lead.name || "-",
    email: lead.email || "-",
    phone: lead.phone || "-",
    rawId: lead._id?.toString(),
    inquiryDate: lead.inquiryDate || lead.createdAt,
    followUps: mapFollowUps(lead.followUps),
    leadStatus: lead.leadStatus || "new",
    source: "facebook",
    pricingTier: "standard",
    pricingPlanName: "Standard",
    pricingExpiresAt: null
  }));
};

export const getFacebookLeadById = async ({ leadId, tenantId }) => {
  logger.info("facebookLeadService.getFacebookLeadById", { leadId, tenantId });
  const lead = await FacebookLead.findOne({ _id: leadId, tenantId }).lean();
  if (!lead) {
    throw new Error("Lead not found");
  }
  return {
    id: lead.leadgenId || lead._id?.toString(),
    name: lead.name || "-",
    email: lead.email || "-",
    phone: lead.phone || "-",
    rawId: lead._id?.toString(),
    inquiryDate: lead.inquiryDate || lead.createdAt,
    followUps: mapFollowUps(lead.followUps),
    leadStatus: lead.leadStatus || "new",
    source: "facebook",
    pricingTier: "standard",
    pricingPlanName: "Standard",
    pricingExpiresAt: null
  };
};

export const updateFacebookLead = async ({ leadId, payload, tenantId }) => {
  logger.info("facebookLeadService.updateFacebookLead", { leadId, tenantId });
  const updates = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone
  };
  const lead = await FacebookLead.findOneAndUpdate(
    { _id: leadId, tenantId },
    updates,
    { new: true }
  ).lean();
  if (!lead) {
    throw new Error("Lead not found");
  }
  return {
    id: lead.leadgenId || lead._id?.toString(),
    name: lead.name || "-",
    email: lead.email || "-",
    phone: lead.phone || "-",
    rawId: lead._id?.toString(),
    inquiryDate: lead.inquiryDate || lead.createdAt,
    followUps: mapFollowUps(lead.followUps),
    leadStatus: lead.leadStatus || "new",
    source: "facebook",
    pricingTier: "standard",
    pricingPlanName: "Standard",
    pricingExpiresAt: null
  };
};

export const addFacebookLeadFollowUp = async ({
  leadId,
  tenantId,
  asked,
  response,
  status,
  callbackAt,
  createdBy
}) => {
  logger.info("facebookLeadService.addFacebookLeadFollowUp", { leadId, tenantId });
  const followUpEntry = {
    asked,
    response,
    status,
    callbackAt: callbackAt ? new Date(callbackAt) : undefined,
    createdAt: new Date(),
    createdBy
  };
  const lead = await FacebookLead.findOneAndUpdate(
    { _id: leadId, tenantId },
    {
      $push: { followUps: followUpEntry },
      $set: { leadStatus: status }
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

export const convertFacebookLead = async ({ leadId, tenantId, userId }) => {
  logger.info("facebookLeadService.convertFacebookLead", { leadId, tenantId });
  const lead = await FacebookLead.findOne({ _id: leadId, tenantId });
  if (!lead) {
    throw new Error("Lead not found");
  }
  if (!lead.email) {
    throw new Error("Email is required to convert this lead");
  }

  const [firstName, ...rest] = (lead.name || "Client User").trim().split(" ");
  const lastName = rest.join(" ") || "User";

  let user = await User.findOne({ email: lead.email, tenantId });
  if (!user) {
    user = await User.create({
      firstName,
      lastName,
      name: lead.name || `${firstName} ${lastName}`.trim(),
      email: lead.email,
      phone: lead.phone,
      role: "client",
      provider: "local",
      emailVerified: false,
      tenantId,
      createdBy: userId
    });
  }

  const client = await Client.create({
    firstName,
    lastName,
    email: lead.email,
    phone: lead.phone || "",
    userId: user._id,
    tenantId,
    createdBy: userId
  });

  lead.leadStatus = "converted";
  lead.convertedAt = new Date();
  lead.convertedClientId = client._id;
  await lead.save();

  return { success: true, clientId: client._id };
};

export const getDueFacebookFollowUps = async ({ tenantId, date, rangeDays }) => {
  logger.info("facebookLeadService.getDueFacebookFollowUps", { tenantId, date, rangeDays });
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

  const leads = await FacebookLead.find({
    tenantId,
    "followUps.callbackAt": { $gte: start, $lt: end }
  }).lean();

  const results = [];
  leads.forEach((lead) => {
    (lead.followUps || []).forEach((entry) => {
      const callbackAt = entry.callbackAt ? new Date(entry.callbackAt) : null;
      if (!callbackAt) return;
      if (callbackAt < start || callbackAt >= end) return;
      results.push({
        leadId: lead._id?.toString(),
        name: lead.name || "-",
        email: lead.email,
        phone: lead.phone || "-",
        leadStatus: lead.leadStatus || "new",
        asked: entry.asked,
        response: entry.response,
        status: entry.status,
        callbackAt: entry.callbackAt,
        createdAt: entry.createdAt,
        source: "facebook"
      });
    });
  });

  return results.sort(
    (a, b) => new Date(a.callbackAt || 0) - new Date(b.callbackAt || 0)
  );
};

export const ingestFacebookLead = async ({
  pageId,
  leadgenId,
  formId,
  adId,
  adsetId,
  campaignId,
  createdTime,
  rawPayload
}) => {
  logger.info("facebookLeadService.ingestFacebookLead", { pageId, leadgenId });
  const tenant = await Tenant.findOne({ "facebook.pageId": pageId });
  if (!tenant) {
    logger.warn("facebookLeadService.noTenantForPage", { pageId });
    return null;
  }
  if (!tenant.facebook?.pageAccessToken) {
    throw new Error("Facebook page access token missing");
  }

  const leadData = await fetchLeadDetails({
    leadgenId,
    pageAccessToken: tenant.facebook.pageAccessToken
  });
  const profile = extractLeadProfile(leadData.field_data || []);
  const inquiryDate = leadData.created_time
    ? new Date(leadData.created_time)
    : createdTime
    ? new Date(createdTime * 1000)
    : new Date();

  const update = {
    tenantId: tenant._id,
    leadgenId,
    formId,
    pageId,
    adId,
    adsetId,
    campaignId,
    name: profile.fullName || "Facebook Lead",
    email: profile.email || "",
    phone: profile.phone || "",
    inquiryDate,
    source: "facebook",
    rawPayload: rawPayload || leadData
  };

  const lead = await FacebookLead.findOneAndUpdate(
    { tenantId: tenant._id, leadgenId },
    { $set: update },
    { new: true, upsert: true }
  );

  return lead;
};
