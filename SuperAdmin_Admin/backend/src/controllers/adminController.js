import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createCoach,
  deleteCoach,
  listCoaches,
  resetCoachPassword,
  updateCoach
} from "../services/coachService.js";

export const createCoachController = asyncHandler(async (req, res) => {
  const { coach, tenant, password } = await createCoach(req.body);
  res.status(201).json({
    coach: {
      id: coach._id,
      email: coach.email,
      firstName: coach.firstName,
      lastName: coach.lastName
    },
    tenant,
    password
  });
});

export const listCoachesController = asyncHandler(async (req, res) => {
  const coaches = await listCoaches();
  res.json(coaches);
});

export const resetCoachPasswordController = asyncHandler(async (req, res) => {
  const { coach, password } = await resetCoachPassword(req.params.id);
  res.json({
    message: "Password reset",
    coachId: coach._id,
    password
  });
});

export const updateCoachController = asyncHandler(async (req, res) => {
  const coach = await updateCoach(req.params.id, req.body);
  res.json({
    id: coach._id,
    firstName: coach.firstName,
    lastName: coach.lastName,
    email: coach.email,
    profile: coach.profile
  });
});

export const deleteCoachController = asyncHandler(async (req, res) => {
  const result = await deleteCoach(req.params.id);
  res.json({
    message: "Coach deleted",
    ...result
  });
});
