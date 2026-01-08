import {
  addLeadFollowUp,
  convertLead,
  createLead,
  getLeadById,
  getLeads,
  getDueFollowUps,
  revertLead,
  updateLead
} from "../services/leadService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export const listLeadsController = asyncHandler(async (req, res) => {
  logger.info("listLeadsController invoked", { userId: req.user.id });
  const leads = await getLeads({
    tenantId: req.user.tenantId,
    inquiryDate: req.query.inquiryDate,
    status: req.query.status,
    source: req.query.source
  });
  res.json(leads);
});

export const getLeadController = asyncHandler(async (req, res) => {
  logger.info("getLeadController invoked", {
    userId: req.user.id,
    leadId: req.params.id
  });
  const lead = await getLeadById({
    leadId: req.params.id,
    tenantId: req.user.tenantId,
    source: req.query.source
  });
  res.json(lead);
});

export const createLeadController = asyncHandler(async (req, res) => {
  logger.info("createLeadController invoked", { userId: req.user.id });
  const lead = await createLead({
    ...req.body,
    createdBy: req.user.id,
    tenantId: req.user.tenantId
  });
  res.status(201).json(lead);
});

export const updateLeadController = asyncHandler(async (req, res) => {
  logger.info("updateLeadController invoked", {
    userId: req.user.id,
    leadId: req.params.id
  });
  const lead = await updateLead({
    id: req.params.id,
    payload: req.body,
    tenantId: req.user.tenantId,
    source: req.body.source || req.query.source
  });
  res.json(lead);
});

export const convertLeadController = asyncHandler(async (req, res) => {
  logger.info("convertLeadController invoked", {
    userId: req.user.id,
    leadId: req.params.id
  });
  await convertLead({
    leadId: req.params.id,
    tenantId: req.user.tenantId,
    userId: req.user.id,
    source: req.body?.source || req.query.source
  });
  res.json({ message: "Lead converted to client" });
});

export const revertLeadController = asyncHandler(async (req, res) => {
  logger.info("revertLeadController invoked", {
    userId: req.user.id,
    clientId: req.params.id
  });
  await revertLead({
    clientId: req.params.id,
    tenantId: req.user.tenantId
  });
  res.json({ message: "Client converted back to lead" });
});

export const addLeadFollowUpController = asyncHandler(async (req, res) => {
  logger.info("addLeadFollowUpController", {
    userId: req.user.id,
    leadId: req.params.id
  });
  const result = await addLeadFollowUp({
    leadId: req.params.id,
    tenantId: req.user.tenantId,
    asked: req.body.asked,
    response: req.body.response,
    status: req.body.status,
    callbackAt: req.body.callbackAt,
    createdBy: req.user.id,
    source: req.body.source || req.query.source
  });
  res.json(result);
});

export const listDueFollowUpsController = asyncHandler(async (req, res) => {
  logger.info("listDueFollowUpsController", { userId: req.user.id });
  const followUps = await getDueFollowUps({
    tenantId: req.user.tenantId,
    date: req.query.date,
    rangeDays: req.query.rangeDays
  });
  res.json(followUps);
});
