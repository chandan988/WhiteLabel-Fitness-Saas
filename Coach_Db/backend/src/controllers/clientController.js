import {
  createClient,
  getClientById,
  getClients,
  updateClient
} from "../services/clientService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export const createClientController = asyncHandler(async (req, res) => {
  logger.info("Creating client", { tenantId: req.user.tenantId });
  const tenantId = req.user.tenantId || req.body.tenantId;
  if (!tenantId) {
    return res.status(400).json({ message: "tenantId is required" });
  }
  const client = await createClient({
    ...req.body,
    tenantId,
    createdBy: req.user.id
  });
  res.status(201).json(client);
});

export const listClientsController = asyncHandler(async (req, res) => {
  logger.info("Listing clients", { tenantId: req.query.tenantId || req.user.tenantId });
  const clients = await getClients({
    tenantId: req.query.tenantId || req.user.tenantId
  });
  res.json(clients);
});

export const getClientController = asyncHandler(async (req, res) => {
  logger.info("Fetching client", { clientId: req.params.id });
  const client = await getClientById(req.params.id);
  res.json(client);
});

export const updateClientController = asyncHandler(async (req, res) => {
  logger.info("Updating client", { clientId: req.params.id });
  const client = await updateClient(req.params.id, req.body);
  res.json(client);
});
