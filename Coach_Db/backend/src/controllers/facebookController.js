import { Tenant } from "../models/Tenant.js";
import { ingestFacebookLead } from "../services/facebookLeadService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

const graphVersion = process.env.FACEBOOK_GRAPH_VERSION || "v19.0";

const encodeState = (payload) =>
  Buffer.from(JSON.stringify(payload)).toString("base64");

const decodeState = (value) => {
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
};

const requireFacebookEnv = () => {
  const missing = [];
  if (!process.env.FACEBOOK_APP_ID) missing.push("FACEBOOK_APP_ID");
  if (!process.env.FACEBOOK_APP_SECRET) missing.push("FACEBOOK_APP_SECRET");
  if (!process.env.FACEBOOK_REDIRECT_URI) missing.push("FACEBOOK_REDIRECT_URI");
  if (missing.length) {
    throw new Error(`Missing env: ${missing.join(", ")}`);
  }
};

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data?.error?.message || `Facebook request failed: ${response.status}`
    );
  }
  return data;
};

export const getFacebookAuthUrl = asyncHandler(async (req, res) => {
  requireFacebookEnv();
  const tenantId = req.user.tenantId;
  if (!tenantId) {
    return res.status(400).json({ message: "Tenant not available" });
  }
  const origin = req.headers.origin || process.env.FRONTEND_URL;
  const state = encodeState({ tenantId, redirect: origin });
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
    state,
    scope:
      "pages_manage_metadata,pages_read_engagement,leads_retrieval,ads_read"
  });
  const url = `https://www.facebook.com/${graphVersion}/dialog/oauth?${params.toString()}`;
  res.json({ url });
});

export const facebookCallback = asyncHandler(async (req, res) => {
  requireFacebookEnv();
  const { code, state, page_id: pageIdParam } = req.query;
  if (!code) {
    return res.status(400).json({ message: "Missing code" });
  }
  const stateData = state ? decodeState(state) : null;
  if (!stateData?.tenantId) {
    return res.status(400).json({ message: "Invalid state" });
  }

  const tokenParams = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
    client_secret: process.env.FACEBOOK_APP_SECRET,
    code: code.toString()
  });
  const tokenUrl = `https://graph.facebook.com/${graphVersion}/oauth/access_token?${tokenParams.toString()}`;
  const tokenData = await fetchJson(tokenUrl);

  const pagesUrl = `https://graph.facebook.com/${graphVersion}/me/accounts?access_token=${tokenData.access_token}`;
  const pagesData = await fetchJson(pagesUrl);
  const pages = pagesData.data || [];
  if (!pages.length) {
    return res.status(400).json({ message: "No Facebook pages found" });
  }

  const selectedPage =
    pages.find((page) => page.id === pageIdParam) || pages[0];

  const subscribeUrl = `https://graph.facebook.com/${graphVersion}/${selectedPage.id}/subscribed_apps`;
  await fetchJson(subscribeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      subscribed_fields: "leadgen",
      access_token: selectedPage.access_token
    })
  });

  const tenant = await Tenant.findById(stateData.tenantId);
  if (tenant) {
    tenant.facebook = {
      connected: true,
      pageId: selectedPage.id,
      pageName: selectedPage.name,
      pageAccessToken: selectedPage.access_token,
      connectedAt: new Date()
    };
    await tenant.save({ validateBeforeSave: false });
  }

  const redirectBase =
    stateData.redirect || process.env.FRONTEND_URL || "http://localhost:5173";
  const tenantSlug = tenant?.slug || "";
  const redirectUrl = tenantSlug
    ? `${redirectBase}/${tenantSlug}/leads?fb=connected`
    : `${redirectBase}/leads?fb=connected`;

  res.redirect(redirectUrl);
});

export const getFacebookConnection = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.user.tenantId).lean();
  res.json({
    connected: tenant?.facebook?.connected || false,
    pageId: tenant?.facebook?.pageId || null,
    pageName: tenant?.facebook?.pageName || null
  });
});

export const disconnectFacebook = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.user.tenantId);
  if (!tenant) {
    return res.status(404).json({ message: "Tenant not found" });
  }
  tenant.facebook = {
    connected: false,
    pageId: null,
    pageName: null,
    pageAccessToken: null,
    connectedAt: null
  };
  await tenant.save({ validateBeforeSave: false });
  res.json({ message: "Facebook disconnected" });
});

export const facebookWebhookVerify = asyncHandler(async (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (
    mode === "subscribe" &&
    token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN
  ) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send("Verification failed");
});

export const facebookWebhookReceive = asyncHandler(async (req, res) => {
  const payload = req.body;
  if (!payload?.entry) {
    return res.status(400).json({ message: "Invalid payload" });
  }
  logger.info("facebookWebhookReceive", { entryCount: payload.entry.length });
  for (const entry of payload.entry) {
    const pageId = entry.id;
    const changes = entry.changes || [];
    for (const change of changes) {
      if (change.field !== "leadgen") continue;
      const value = change.value || {};
      try {
        await ingestFacebookLead({
          pageId,
          leadgenId: value.leadgen_id,
          formId: value.form_id,
          adId: value.ad_id,
          adsetId: value.adset_id,
          campaignId: value.campaign_id,
          createdTime: value.created_time,
          rawPayload: value
        });
      } catch (err) {
        logger.error("facebookWebhookReceive ingest failed", {
          error: err.message,
          leadgenId: value.leadgen_id
        });
      }
    }
  }
  res.status(200).json({ received: true });
});
