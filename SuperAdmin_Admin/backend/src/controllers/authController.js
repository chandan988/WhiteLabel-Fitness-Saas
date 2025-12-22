import { asyncHandler } from "../utils/asyncHandler.js";
import {
  completeCoachSetup,
  loginCoach,
  loginSuperAdmin
} from "../services/authService.js";

export const superAdminLogin = asyncHandler(async (req, res) => {
  const { user, token } = await loginSuperAdmin(req.body);
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    }
  });
});

export const coachLogin = asyncHandler(async (req, res) => {
  const { user, token } = await loginCoach(req.body);
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId?._id,
      mustResetPassword: user.mustResetPassword
    },
    branding: user.tenantId?.branding,
    profile: user.profile
  });
});

export const coachSetup = asyncHandler(async (req, res) => {
  const coach = await completeCoachSetup({
    coachId: req.user.id,
    password: req.body.password,
    profile: req.body.profile
  });
  res.json({
    message: "Coach profile updated",
    profile: coach.profile
  });
});
