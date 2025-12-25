import {
  createClient,
  getClientById,
  getClients,
  updateClient
} from "../services/clientService.js";
import {
  assignMealToClient,
  assignWorkoutToClient,
  getClientHealth,
  updateWorkoutStatus,
  updateMealStatus
} from "../services/clientHealthService.js";
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

export const getClientHealthController = asyncHandler(async (req, res) => {
  logger.info("Fetching client health", { clientId: req.params.id });
  const health = await getClientHealth({
    clientId: req.params.id,
    tenantId: req.user.tenantId,
    limit: req.query.limit
  });
  res.json(health);
});

export const assignWorkoutController = asyncHandler(async (req, res) => {
  logger.info("Assigning workout", { clientId: req.params.id });
  const client = await assignWorkoutToClient({
    clientId: req.params.id,
    tenantId: req.user.tenantId,
    workoutId: req.body.workoutId,
    duration: req.body.duration,
    notes: req.body.notes
  });
  res.json(client);
});

export const assignMealController = asyncHandler(async (req, res) => {
  logger.info("Assigning meal", { clientId: req.params.id });
  const client = await assignMealToClient({
    clientId: req.params.id,
    tenantId: req.user.tenantId,
    foodId: req.body.foodId,
    foodIds: req.body.foodIds,
    mealType: req.body.mealType,
    notes: req.body.notes
  });
  res.json(client);
});

export const updateWorkoutStatusController = asyncHandler(async (req, res) => {
  logger.info("Updating workout status", { clientId: req.params.id });
  const client = await updateWorkoutStatus({
    clientId: req.params.id,
    tenantId: req.user.tenantId,
    status: req.body.status,
    itemId: req.body.itemId
  });
  res.json(client);
});

export const updateMealStatusController = asyncHandler(async (req, res) => {
  logger.info("Updating meal status", { clientId: req.params.id });
  const client = await updateMealStatus({
    clientId: req.params.id,
    tenantId: req.user.tenantId,
    status: req.body.status,
    itemId: req.body.itemId
  });
  res.json(client);
});
