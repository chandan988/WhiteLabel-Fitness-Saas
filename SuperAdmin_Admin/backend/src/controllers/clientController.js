import { asyncHandler } from "../utils/asyncHandler.js";
import { Client } from "../models/Client.js";

export const listClientsController = asyncHandler(async (req, res) => {
  const clients = await Client.find({ tenantId: req.user.tenantId });
  res.json(clients);
});

export const createClientController = asyncHandler(async (req, res) => {
  const client = await Client.create({
    ...req.body,
    tenantId: req.user.tenantId,
    createdBy: req.user.id
  });
  res.status(201).json(client);
});

export const updateClientController = asyncHandler(async (req, res) => {
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true }
  );
  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }
  res.json(client);
});
