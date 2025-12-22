import { Client } from "../models/Client.js";
import { logger } from "../utils/logger.js";

export const createClient = async (data) => {
  logger.info("clientService.createClient", {
    tenantId: data.tenantId?.toString()
  });
  return Client.create(data);
};

export const getClients = async ({ tenantId }) => {
  const query = tenantId ? { tenantId } : {};
  logger.info("clientService.getClients", { tenantId });
  return Client.find(query).sort({ createdAt: -1 });
};

export const getClientById = async (id) => {
  logger.info("clientService.getClientById", { id });
  const client = await Client.findById(id);
  if (!client) {
    throw new Error("Client not found");
  }
  return client;
};

export const updateClient = async (id, data) => {
  logger.info("clientService.updateClient", { id });
  const client = await Client.findByIdAndUpdate(id, data, { new: true });
  if (!client) {
    throw new Error("Client not found");
  }
  return client;
};
